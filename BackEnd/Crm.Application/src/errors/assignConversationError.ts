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
export function assignConversationError(
  reason: AssignConversationFailureReason,
  message: string,
): AssignConversationError {
  return new AssignConversationError(reason, message);
}
