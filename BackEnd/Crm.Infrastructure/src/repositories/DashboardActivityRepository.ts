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
function mergeActivityRows(
  messagesResult: { data: unknown[] | null },
  stageHistoryResult: { data: unknown[] | null },
  notesResult: { data: unknown[] | null },
  fallbackClientId?: string,
): DashboardActivityItem[] {
  const items: DashboardActivityItem[] = [];

  for (const row of messagesResult.data ?? []) {
    const messageRow = row as {
      thread_id: string;
      body: string;
      created_at: string;
      conversation_threads: ThreadClientRef;
    };
    const threadRef = messageRow.conversation_threads;
    items.push({
      type: 'conversation_message',
      occurredAt: new Date(messageRow.created_at),
      summary: `Message: ${truncateSummary(messageRow.body)}`,
      threadId: messageRow.thread_id,
      clientId: readClientId(threadRef) ?? fallbackClientId,
    });
  }

  for (const row of stageHistoryResult.data ?? []) {
    const historyRow = row as {
      deal_id: string;
      from_stage: string | null;
      to_stage: string;
      created_at: string;
      deals: DealClientRef;
    };
    const fromStage = historyRow.from_stage;
    const toStage = historyRow.to_stage;
    const stageLabel = fromStage ? `${fromStage} → ${toStage}` : toStage;
    items.push({
      type: 'deal_stage_change',
      occurredAt: new Date(historyRow.created_at),
      summary: `Deal stage: ${stageLabel}`,
      dealId: historyRow.deal_id,
      clientId: readClientId(historyRow.deals) ?? fallbackClientId,
    });
  }

  for (const row of notesResult.data ?? []) {
    const noteRow = row as {
      deal_id: string;
      body: string;
      created_at: string;
      deals: DealClientRef;
    };
    items.push({
      type: 'deal_note',
      occurredAt: new Date(noteRow.created_at),
      summary: `Deal note: ${truncateSummary(noteRow.body)}`,
      dealId: noteRow.deal_id,
      clientId: readClientId(noteRow.deals) ?? fallbackClientId,
    });
  }

  return items;
}

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

    return mergeActivityRows(messagesResult, stageHistoryResult, notesResult)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, safeLimit);
  }

  async listRecentActivityByClientId(
    clientId: string,
    limit: number,
  ): Promise<DashboardActivityItem[]> {
    const safeLimit = Math.max(1, Math.min(limit, 50));

    const [messagesResult, stageHistoryResult, notesResult] = await Promise.all([
      this.supabase
        .from('conversation_messages')
        .select('id, thread_id, body, created_at, conversation_threads!inner(client_id)')
        .eq('conversation_threads.client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(safeLimit),
      this.supabase
        .from('deal_stage_history')
        .select('id, deal_id, from_stage, to_stage, created_at, deals!inner(client_id)')
        .eq('deals.client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(safeLimit),
      this.supabase
        .from('deal_notes')
        .select('id, deal_id, body, created_at, deals!inner(client_id)')
        .eq('deals.client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(safeLimit),
    ]);

    throwIfSupabaseError(
      messagesResult.error,
      `Failed to load recent conversation messages for client ${clientId}`,
    );
    throwIfSupabaseError(
      stageHistoryResult.error,
      `Failed to load recent deal stage history for client ${clientId}`,
    );
    throwIfSupabaseError(
      notesResult.error,
      `Failed to load recent deal notes for client ${clientId}`,
    );

    return mergeActivityRows(messagesResult, stageHistoryResult, notesResult, clientId)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, safeLimit);
  }
}
