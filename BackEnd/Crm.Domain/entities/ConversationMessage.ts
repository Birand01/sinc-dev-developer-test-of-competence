import type { MessageSenderType } from '../enums/MessageSenderType';

/**
 * Single message in a conversation thread (conversation_messages table).
 */
export interface ConversationMessage {
  id: string;
  /** conversation_threads.id */
  threadId: string;
  /** profiles.id of the sender */
  senderId: string;
  senderType: MessageSenderType;
  body: string;
  createdAt: Date;
}
