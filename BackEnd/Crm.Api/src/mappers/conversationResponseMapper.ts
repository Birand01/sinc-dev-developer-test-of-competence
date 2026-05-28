import type { ConversationMessage } from '../../../Crm.Domain/entities/ConversationMessage';
import type { ConversationThread } from '../../../Crm.Domain/entities/ConversationThread';

/** API response mapper for conversation thread resources. */
export function toConversationThreadResponse(thread: ConversationThread) {
  return {
    id: thread.id,
    clientId: thread.clientId,
    assignedTo: thread.assignedTo,
    subject: thread.subject,
    status: thread.status,
    lastMessageAt: thread.lastMessageAt.toISOString(),
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
  };
}

/** API response mapper for conversation message resources. */
export function toConversationMessageResponse(message: ConversationMessage) {
  return {
    id: message.id,
    threadId: message.threadId,
    senderId: message.senderId,
    senderType: message.senderType,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  };
}
