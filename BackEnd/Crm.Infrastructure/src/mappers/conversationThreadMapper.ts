import type { ConversationThread } from '../../../Crm.Domain/entities/ConversationThread';
import { ConversationStatus } from '../../../Crm.Domain/enums/ConversationStatus';
import type { ConversationStatus as ConversationStatusType } from '../../../Crm.Domain/enums/ConversationStatus';

/** Row shape returned by Supabase from public.conversation_threads (snake_case). */
export type ConversationThreadRow = {
  id: string;
  client_id: string;
  assigned_to: string | null;
  subject: string;
  status: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
};

function toConversationStatus(value: string): ConversationStatusType {
  const allowed = Object.values(ConversationStatus) as string[];
  if (!allowed.includes(value)) {
    throw new Error(`Invalid conversation_threads.status value: ${value}`);
  }
  return value as ConversationStatusType;
}

/** Maps a Supabase conversation_threads row to the domain ConversationThread entity. */
export function toConversationThread(row: ConversationThreadRow): ConversationThread {
  return {
    id: row.id,
    clientId: row.client_id,
    assignedTo: row.assigned_to,
    subject: row.subject,
    status: toConversationStatus(row.status),
    lastMessageAt: new Date(row.last_message_at),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
