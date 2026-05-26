import type { SupabaseClient } from '@supabase/supabase-js';
import type { ConversationThread } from '../../../Crm.Domain/entities/ConversationThread';
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
export class ConversationThreadRepository {
  constructor(private readonly supabase: SupabaseClient) {}

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
