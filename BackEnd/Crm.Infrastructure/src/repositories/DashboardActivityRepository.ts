import type { SupabaseClient } from '@supabase/supabase-js';
import type { DashboardActivityItem } from '../../../Crm.Application/src/dto/dashboard';
import type { IDashboardActivityRepository } from '../../../Crm.Application/src/interfaces/repositories/IDashboardActivityRepository';
import { throwIfSupabaseError } from '../helpers/repositoryHelpers';

const SUMMARY_MAX_LENGTH = 120;

function truncateSummary(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length <= SUMMARY_MAX_LENGTH) {
    return trimmed;
  }
  return `${trimmed.slice(0, SUMMARY_MAX_LENGTH - 1)}…`;
}

type ThreadClientRef = { client_id: string } | { client_id: string }[] | null;
type DealClientRef = { client_id: string } | { client_id: string }[] | null;

function readClientId(ref: ThreadClientRef | DealClientRef): string | undefined {
  if (!ref) {
    return undefined;
  }
  if (Array.isArray(ref)) {
    return ref[0]?.client_id;
  }
  return ref.client_id;
}

/**
 * Merges recent messages, stage changes, and notes into one activity feed (RLS-scoped).
 */
export class DashboardActivityRepository implements IDashboardActivityRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async listRecentActivity(limit: number): Promise<DashboardActivityItem[]> {
    const safeLimit = Math.max(1, Math.min(limit, 50));

    const [messagesResult, stageHistoryResult, notesResult] = await Promise.all([
      this.supabase
        .from('conversation_messages')
        .select('id, thread_id, body, created_at, conversation_threads(client_id)')
        .order('created_at', { ascending: false })
        .limit(safeLimit),
      this.supabase
        .from('deal_stage_history')
        .select('id, deal_id, from_stage, to_stage, created_at, deals(client_id)')
        .order('created_at', { ascending: false })
        .limit(safeLimit),
      this.supabase
        .from('deal_notes')
        .select('id, deal_id, body, created_at, deals(client_id)')
        .order('created_at', { ascending: false })
        .limit(safeLimit),
    ]);

    throwIfSupabaseError(messagesResult.error, 'Failed to load recent conversation messages');
    throwIfSupabaseError(stageHistoryResult.error, 'Failed to load recent deal stage history');
    throwIfSupabaseError(notesResult.error, 'Failed to load recent deal notes');

    const items: DashboardActivityItem[] = [];

    for (const row of messagesResult.data ?? []) {
      const threadRef = row.conversation_threads as ThreadClientRef;
      items.push({
        type: 'conversation_message',
        occurredAt: new Date(row.created_at as string),
        summary: `Message: ${truncateSummary(row.body as string)}`,
        threadId: row.thread_id as string,
        clientId: readClientId(threadRef),
      });
    }

    for (const row of stageHistoryResult.data ?? []) {
      const dealRef = row.deals as DealClientRef;
      const fromStage = row.from_stage as string | null;
      const toStage = row.to_stage as string;
      const stageLabel = fromStage ? `${fromStage} → ${toStage}` : toStage;
      items.push({
        type: 'deal_stage_change',
        occurredAt: new Date(row.created_at as string),
        summary: `Deal stage: ${stageLabel}`,
        dealId: row.deal_id as string,
        clientId: readClientId(dealRef),
      });
    }

    for (const row of notesResult.data ?? []) {
      const dealRef = row.deals as DealClientRef;
      items.push({
        type: 'deal_note',
        occurredAt: new Date(row.created_at as string),
        summary: `Deal note: ${truncateSummary(row.body as string)}`,
        dealId: row.deal_id as string,
        clientId: readClientId(dealRef),
      });
    }

    return items
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, safeLimit);
  }
}
