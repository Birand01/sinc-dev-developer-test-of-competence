import type { SupabaseClient } from '@supabase/supabase-js';
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
export class ConversationMessageRepository {
  constructor(private readonly supabase: SupabaseClient) {}

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
