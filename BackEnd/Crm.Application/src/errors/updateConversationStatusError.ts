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
export function updateConversationStatusError(
  reason: UpdateConversationStatusFailureReason,
  message: string,
): UpdateConversationStatusError {
  return new UpdateConversationStatusError(reason, message);
}
