import type { ConversationStatusCount } from '../../dto/dashboard';
import type { ConversationThread } from '../../../../Crm.Domain/entities/ConversationThread';
import type { ConversationStatus } from '../../../../Crm.Domain/enums/ConversationStatus';

/** Body fields for the thread row in POST /api/conversations. */
export interface CreateConversationThreadInput {
  clientId: string;
  subject: string;
}

/**
 * Port for conversation threads (conversation_threads table).
 * Implemented by Crm.Infrastructure; consumed by Application use-cases.
 */
export interface IConversationThreadRepository {
  getById(id: string): Promise<ConversationThread | null>;
  list(): Promise<ConversationThread[]>;
  /** Threads for one client, newest activity first (RLS-scoped). */
  listByClientId(clientId: string): Promise<ConversationThread[]>;
  create(input: CreateConversationThreadInput): Promise<ConversationThread>;
  /** Sets assigned_to on a thread. RLS enforces manager vs sales claim rules. */
  assignTo(threadId: string, assignedTo: string): Promise<ConversationThread>;
  /** Updates status on a thread. RLS enforces manager vs sales-on-owned-thread rules. */
  updateStatus(threadId: string, status: ConversationStatus): Promise<ConversationThread>;
  /** Dashboard aggregate: thread counts per status (RLS-scoped). */
  countByStatus(): Promise<ConversationStatusCount[]>;
  /** Dashboard aggregate: threads with no assignee (RLS-scoped). */
  countUnassigned(): Promise<number>;
}
