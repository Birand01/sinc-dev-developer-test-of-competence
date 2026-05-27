import type { ConversationThread } from '../../../../Crm.Domain/entities/ConversationThread';

/** Body fields for the thread row in POST /api/conversations. */
export interface CreateConversationThreadInput {
  clientId: string;
  subject: string;
}

/**
 * Port for conversation threads (conversation_threads table).
 * Implemented by Crm.Infrastructure; consumed by Application use-cases.
 */
export interface IConversationThreadRepository {
  getById(id: string): Promise<ConversationThread | null>;
  list(): Promise<ConversationThread[]>;
  create(input: CreateConversationThreadInput): Promise<ConversationThread>;
}
