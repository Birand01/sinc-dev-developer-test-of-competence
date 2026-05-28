export type AssignConversationFailureReason =
  | 'THREAD_NOT_FOUND'
  | 'FORBIDDEN'
  | 'SALES_MUST_CLAIM_SELF'
  | 'ASSIGNEE_NOT_FOUND'
  | 'ASSIGNEE_NOT_SALES';

/** Application failure for assign use-case; Crm.Api maps reason → HTTP status. */
export class AssignConversationError extends Error {
  constructor(
    public readonly reason: AssignConversationFailureReason,
    message: string,
  ) {
    super(message);
    this.name = 'AssignConversationError';
  }
}

/** Factory for assign use-case failures (keeps service focused on business flow). */
const ASSIGN_CONVERSATION_ERROR_MESSAGES: Record<AssignConversationFailureReason, string> = {
  THREAD_NOT_FOUND: 'Conversation thread not found',
  FORBIDDEN: 'Not allowed to assign this conversation',
  SALES_MUST_CLAIM_SELF: 'Sales can only assign unassigned threads to themselves',
  ASSIGNEE_NOT_FOUND: 'Assignee profile not found',
  ASSIGNEE_NOT_SALES: 'Conversation can only be assigned to a sales user',
};

export function assignConversationError(
  reason: AssignConversationFailureReason,
  message?: string,
): AssignConversationError {
  return new AssignConversationError(
    reason,
    message ?? ASSIGN_CONVERSATION_ERROR_MESSAGES[reason],
  );
}
