import type { SupabaseClient } from '@supabase/supabase-js';
import type { ConversationStatusCount } from '../../../Crm.Application/src/dto/dashboard';
import type { CreateConversationThreadInput, IConversationThreadRepository } from '../../../Crm.Application/src/interfaces/repositories/IConversationThreadRepository';
import type { ConversationThread } from '../../../Crm.Domain/entities/ConversationThread';
import { ConversationStatus } from '../../../Crm.Domain/enums/ConversationStatus';
import type { ConversationStatus as ConversationStatusType } from '../../../Crm.Domain/enums/ConversationStatus';
import {
  toConversationThread,
  type ConversationThreadRow,
} from '../mappers/conversationThreadMapper';
import {
  mapMaybeSingle,
  mapRowsOrEmpty,
  throwIfSupabaseError,
} from '../helpers/repositoryHelpers';

/**
 * Data access for public.conversation_threads (Supabase Postgres).
 *
 * Project flow: Api → createSupabaseUserClient → ConversationThreadRepository
 * → query (RLS via can_access_thread) → conversationThreadMapper → domain entity.
 *
 * select('*'): mapper maps only known fields; single-table query.
 */
export class ConversationThreadRepository implements IConversationThreadRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Lists conversation threads visible under RLS, newest activity first.
   */
  async list(): Promise<ConversationThread[]> {
    const { data, error } = await this.supabase
      .from('conversation_threads')
      .select('*')
      .order('last_message_at', { ascending: false });

    throwIfSupabaseError(error, 'Failed to list conversation threads');
    return mapRowsOrEmpty(data as ConversationThreadRow[] | null, toConversationThread);
  }

  /**
   * Lists threads for one client visible under RLS, newest activity first.
   */
  async listByClientId(clientId: string): Promise<ConversationThread[]> {
    const { data, error } = await this.supabase
      .from('conversation_threads')
      .select('*')
      .eq('client_id', clientId)
      .order('last_message_at', { ascending: false });

    throwIfSupabaseError(error, `Failed to list conversation threads for client ${clientId}`);
    return mapRowsOrEmpty(data as ConversationThreadRow[] | null, toConversationThread);
  }

  /**
   * Inserts a new thread (unassigned, status open). RLS controls who may insert.
   * Insert without RETURNING: PostgREST insert+select can fail SELECT policy even when insert succeeds.
   */
  async create(input: CreateConversationThreadInput): Promise<ConversationThread> {
    const id = crypto.randomUUID();

    const { error } = await this.supabase.from('conversation_threads').insert({
      id,
      client_id: input.clientId,
      subject: input.subject,
      assigned_to: null,
    });

    throwIfSupabaseError(error, 'Failed to create conversation thread');

    const thread = await this.getById(id);
    if (!thread) {
      throw new Error(`Failed to load conversation thread ${id} after insert`);
    }

    return thread;
  }

  /**
   * Updates assigned_to on a thread. RLS controls who may update (manager vs sales claim).
   * Update without RETURNING: same RLS read-back issue as create.
   */
  async assignTo(threadId: string, assignedTo: string): Promise<ConversationThread> {
    const { error } = await this.supabase
      .from('conversation_threads')
      .update({ assigned_to: assignedTo })
      .eq('id', threadId);

    throwIfSupabaseError(error, `Failed to assign conversation thread ${threadId}`);

    const thread = await this.getById(threadId);
    if (!thread) {
      throw new Error(`Failed to load conversation thread ${threadId} after assign`);
    }

    return thread;
  }

  /**
   * Updates status on a thread. RLS controls who may update.
   * Update without RETURNING: same RLS read-back issue as assignTo.
   */
  async updateStatus(threadId: string, status: ConversationStatusType): Promise<ConversationThread> {
    const { error } = await this.supabase
      .from('conversation_threads')
      .update({ status })
      .eq('id', threadId);

    throwIfSupabaseError(error, `Failed to update conversation thread status ${threadId}`);

    const thread = await this.getById(threadId);
    if (!thread) {
      throw new Error(`Failed to load conversation thread ${threadId} after status update`);
    }

    return thread;
  }

  /**
   * Returns the thread or null if not found / not visible under RLS.
   * maybeSingle: 0 rows → null; 1 row → data; 2+ rows → error.
   */
  async getById(id: string): Promise<ConversationThread | null> {
    const { data, error } = await this.supabase
      .from('conversation_threads')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    throwIfSupabaseError(error, `Failed to load conversation thread ${id}`);
    return mapMaybeSingle(data as ConversationThreadRow | null, toConversationThread);
  }

  /** Groups visible thread rows by status (RLS-scoped). */
  async countByStatus(): Promise<ConversationStatusCount[]> {
    const { data, error } = await this.supabase
      .from('conversation_threads')
      .select('status');

    throwIfSupabaseError(error, 'Failed to count conversation threads by status');

    const counts = new Map<ConversationStatusType, number>();
    for (const status of Object.values(ConversationStatus)) {
      counts.set(status, 0);
    }

    for (const row of data ?? []) {
      const status = row.status as ConversationStatusType;
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
  }

  /** Head count of visible threads with no assignee. */
  async countUnassigned(): Promise<number> {
    const { count, error } = await this.supabase
      .from('conversation_threads')
      .select('*', { count: 'exact', head: true })
      .is('assigned_to', null);

    throwIfSupabaseError(error, 'Failed to count unassigned conversation threads');
    return count ?? 0;
  }
}
