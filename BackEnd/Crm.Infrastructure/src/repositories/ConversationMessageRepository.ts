import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CreateConversationMessageInput,
  IConversationMessageRepository,
} from '../../../Crm.Application/src/interfaces/repositories/IConversationMessageRepository';
import type { ConversationMessage } from '../../../Crm.Domain/entities/ConversationMessage';
import {
  toConversationMessage,
  type ConversationMessageRow,
} from '../mappers/conversationMessageMapper';

/**
 * Data access for public.conversation_messages (Supabase Postgres).
 *
 * Project flow: Api → createSupabaseUserClient → ConversationMessageRepository
 * → query (RLS via can_access_thread on thread_id) → mapper → domain entity.
 *
 * select('*'): mapper maps only known fields; single-table query.
 */
export class ConversationMessageRepository implements IConversationMessageRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Inserts a new message on a thread. RLS requires access to the parent thread.
   * Insert without RETURNING: same RLS read-back issue as conversation_threads.create.
   */
  async create(input: CreateConversationMessageInput): Promise<ConversationMessage> {
    const id = crypto.randomUUID();

    const { error } = await this.supabase.from('conversation_messages').insert({
      id,
      thread_id: input.threadId,
      sender_id: input.senderId,
      sender_type: input.senderType,
      body: input.body,
    });

    if (error) {
      throw new Error(`Failed to create conversation message: ${error.message}`);
    }

    const message = await this.getById(id);
    if (!message) {
      throw new Error(`Failed to load conversation message ${id} after insert`);
    }

    return message;
  }

  /**
   * Lists messages for a thread visible under RLS, chronological (created_at asc).
   */
  async listByThreadId(threadId: string): Promise<ConversationMessage[]> {
    const { data, error } = await this.supabase
      .from('conversation_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to list conversation messages for thread ${threadId}: ${error.message}`);
    }

    if (!data?.length) {
      return [];
    }

    return data.map((row) => toConversationMessage(row as ConversationMessageRow));
  }

  /**
   * Returns the message or null if not found / not visible under RLS.
   * maybeSingle: 0 rows → null; 1 row → data; 2+ rows → error.
   */
  async getById(id: string): Promise<ConversationMessage | null> {
    const { data, error } = await this.supabase
      .from('conversation_messages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load conversation message ${id}: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return toConversationMessage(data as ConversationMessageRow);
  }
}
