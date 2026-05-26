import type { ConversationStatus } from '../enums/ConversationStatus';

/**
 * Chat thread between a client and the team (conversation_threads table).
 * assigned_to is null when unassigned (sales can pick up unassigned threads).
 */
export interface ConversationThread {
  id: string;
  /** clients.id */
  clientId: string;
  /** profiles.id of assigned sales; null = unassigned */
  assignedTo: string | null;
  subject: string;
  status: ConversationStatus;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
