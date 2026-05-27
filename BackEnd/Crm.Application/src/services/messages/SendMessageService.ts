import type { ConversationMessage } from '../../../../Crm.Domain/entities/ConversationMessage';
import type { MessageSenderType } from '../../../../Crm.Domain/enums/MessageSenderType';
import type { IConversationMessageRepository } from '../../interfaces/repositories/IConversationMessageRepository';

/** Body for POST /api/conversations/:threadId/messages (API contract). */
export interface SendMessageInput {
  message: string;
}

/**
 * Use-case: add a message to an existing conversation thread.
 * Used by POST /api/conversations/:threadId/messages; HTTP status mapping stays in Crm.Api.
 */
export class SendMessageService {
  constructor(private readonly conversationMessageRepository: IConversationMessageRepository) {}

  async execute(
    threadId: string,
    input: SendMessageInput,
    senderId: string,
    senderType: MessageSenderType,
  ): Promise<ConversationMessage> {
    return this.conversationMessageRepository.create({
      threadId,
      senderId,
      senderType,
      body: input.message,
    });
  }
}
