import type { ConversationThread } from '../../../../Crm.Domain/entities/ConversationThread';
import type { IConversationThreadRepository } from '../../interfaces/repositories/IConversationThreadRepository';

/**
 * Use-case: load a single conversation thread by id.
 * Used by GET /api/conversations/:threadId; HTTP status mapping stays in Crm.Api.
 */
export class GetConversationThreadByIdService {
  constructor(private readonly conversationThreadRepository: IConversationThreadRepository) {}

  async execute(threadId: string): Promise<ConversationThread | null> {
    return this.conversationThreadRepository.getById(threadId);
  }
}
