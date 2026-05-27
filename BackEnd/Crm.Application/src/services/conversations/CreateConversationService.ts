import type { ConversationThread } from '../../../../Crm.Domain/entities/ConversationThread';
import type { MessageSenderType } from '../../../../Crm.Domain/enums/MessageSenderType';
import type { IConversationMessageRepository } from '../../interfaces/repositories/IConversationMessageRepository';
import type { IConversationThreadRepository } from '../../interfaces/repositories/IConversationThreadRepository';

/** Body for POST /api/conversations (API contract). */
export interface CreateConversationInput {
  clientId: string;
  subject: string;
  message: string;
}

/**
 * Use-case: open a new thread and store the first chat message.
 * Used by POST /api/conversations; HTTP status mapping stays in Crm.Api.
 */
export class CreateConversationService {
  constructor(
    private readonly conversationThreadRepository: IConversationThreadRepository,
    private readonly conversationMessageRepository: IConversationMessageRepository,
  ) {}

  async execute(
    input: CreateConversationInput,
    senderId: string,
    senderType: MessageSenderType,
  ): Promise<ConversationThread> {
    const thread = await this.conversationThreadRepository.create({
      clientId: input.clientId,
      subject: input.subject,
    });

    await this.conversationMessageRepository.create({
      threadId: thread.id,
      senderId,
      senderType,
      body: input.message,
    });

    return thread;
  }
}
