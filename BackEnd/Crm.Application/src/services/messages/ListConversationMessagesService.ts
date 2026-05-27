import type { ConversationMessage } from '../../../../Crm.Domain/entities/ConversationMessage';
import type { IConversationMessageRepository } from '../../interfaces/repositories/IConversationMessageRepository';

/**
 * Use-case: list messages on a conversation thread (chronological).
 * Used by GET /api/conversations/:threadId/messages; HTTP status mapping stays in Crm.Api.
 */
export class ListConversationMessagesService {
  constructor(private readonly conversationMessageRepository: IConversationMessageRepository) {}

  async execute(threadId: string): Promise<ConversationMessage[]> {
    return this.conversationMessageRepository.listByThreadId(threadId);
  }
}
