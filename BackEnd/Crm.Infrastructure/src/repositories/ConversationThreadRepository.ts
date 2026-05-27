import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateConversationThreadInput, IConversationThreadRepository } from '../../../Crm.Application/src/interfaces/repositories/IConversationThreadRepository';
import type { ConversationThread } from '../../../Crm.Domain/entities/ConversationThread';
import type { ConversationStatus } from '../../../Crm.Domain/enums/ConversationStatus';
import {
  toConversationThread,
  type ConversationThreadRow,
} from '../mappers/conversationThreadMapper';

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

    if (error) {
      throw new Error(`Failed to list conversation threads: ${error.message}`);
    }

    if (!data?.length) {
      return [];
    }

    return data.map((row) => toConversationThread(row as ConversationThreadRow));
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

    if (error) {
      throw new Error(`Failed to create conversation thread: ${error.message}`);
    }

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

    if (error) {
      throw new Error(`Failed to assign conversation thread ${threadId}: ${error.message}`);
    }

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
  async updateStatus(threadId: string, status: ConversationStatus): Promise<ConversationThread> {
    const { error } = await this.supabase
      .from('conversation_threads')
      .update({ status })
      .eq('id', threadId);

    if (error) {
      throw new Error(`Failed to update conversation thread status ${threadId}: ${error.message}`);
    }

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

    if (error) {
      throw new Error(`Failed to load conversation thread ${id}: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return toConversationThread(data as ConversationThreadRow);
  }
}
