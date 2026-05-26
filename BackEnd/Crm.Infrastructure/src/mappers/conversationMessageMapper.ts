import type { ConversationMessage } from '../../../Crm.Domain/entities/ConversationMessage';
import { MessageSenderType } from '../../../Crm.Domain/enums/MessageSenderType';
import type { MessageSenderType as MessageSenderTypeValue } from '../../../Crm.Domain/enums/MessageSenderType';

/** Row shape returned by Supabase from public.conversation_messages (snake_case). */
export type ConversationMessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_type: string;
  body: string;
  created_at: string;
};

function toMessageSenderType(value: string): MessageSenderTypeValue {
  const allowed = Object.values(MessageSenderType) as string[];
  if (!allowed.includes(value)) {
    throw new Error(`Invalid conversation_messages.sender_type value: ${value}`);
  }
  return value as MessageSenderTypeValue;
}

/** Maps a Supabase conversation_messages row to the domain ConversationMessage entity. */
export function toConversationMessage(row: ConversationMessageRow): ConversationMessage {
  return {
    id: row.id,
    threadId: row.thread_id,
    senderId: row.sender_id,
    senderType: toMessageSenderType(row.sender_type),
    body: row.body,
    createdAt: new Date(row.created_at),
  };
}
