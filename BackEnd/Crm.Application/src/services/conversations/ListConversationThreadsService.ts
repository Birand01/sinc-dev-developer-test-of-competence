import type { ConversationThread } from '../../../../Crm.Domain/entities/ConversationThread';
import type { IConversationThreadRepository } from '../../interfaces/repositories/IConversationThreadRepository';

/**
 * Use-case: list conversation threads visible to the current user.
 * Used by GET /api/conversations; HTTP status mapping stays in Crm.Api.
 */
export class ListConversationThreadsService {
  constructor(private readonly conversationThreadRepository: IConversationThreadRepository) {}

  async execute(): Promise<ConversationThread[]> {
    return this.conversationThreadRepository.list();
  }
}
