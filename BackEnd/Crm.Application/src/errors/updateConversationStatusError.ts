export type UpdateConversationStatusFailureReason =
  | 'THREAD_NOT_FOUND'
  | 'FORBIDDEN'
  | 'INVALID_STATUS';

/** Application failure for status update use-case; Crm.Api maps reason → HTTP status. */
export class UpdateConversationStatusError extends Error {
  constructor(
    public readonly reason: UpdateConversationStatusFailureReason,
    message: string,
  ) {
    super(message);
    this.name = 'UpdateConversationStatusError';
  }
}

/** Factory for status update use-case failures. */
const UPDATE_CONVERSATION_STATUS_ERROR_MESSAGES: Record<
  UpdateConversationStatusFailureReason,
  string
> = {
  THREAD_NOT_FOUND: 'Conversation thread not found',
  FORBIDDEN: 'Not allowed to update status on this conversation',
  INVALID_STATUS: 'status must be open, pending, or closed',
};

export function updateConversationStatusError(
  reason: UpdateConversationStatusFailureReason,
  message?: string,
): UpdateConversationStatusError {
  return new UpdateConversationStatusError(
    reason,
    message ?? UPDATE_CONVERSATION_STATUS_ERROR_MESSAGES[reason],
  );
}
