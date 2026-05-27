import type { ConversationMessage } from '../../../../Crm.Domain/entities/ConversationMessage';
import type { MessageSenderType } from '../../../../Crm.Domain/enums/MessageSenderType';

/** Body fields for a new row in conversation_messages. */
export interface CreateConversationMessageInput {
  threadId: string;
  senderId: string;
  senderType: MessageSenderType;
  body: string;
}

/**
 * Port for chat messages (conversation_messages table).
 * Implemented by Crm.Infrastructure; consumed by Application use-cases.
 */
export interface IConversationMessageRepository {
  create(input: CreateConversationMessageInput): Promise<ConversationMessage>;
  /** Messages on one thread, oldest first (chat order). RLS filters by thread access. */
  listByThreadId(threadId: string): Promise<ConversationMessage[]>;
}
