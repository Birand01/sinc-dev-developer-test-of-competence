export type CreateDealNoteFailureReason =
  | 'DEAL_NOT_FOUND'
  | 'FORBIDDEN'
  | 'BODY_REQUIRED';

/** Application failure for deal note creation use-case; Crm.Api maps reason → HTTP status. */
export class CreateDealNoteError extends Error {
  constructor(
    public readonly reason: CreateDealNoteFailureReason,
    message: string,
  ) {
    super(message);
    this.name = 'CreateDealNoteError';
  }
}

/** Factory for deal note creation failures (keeps service focused on business flow). */
const CREATE_DEAL_NOTE_ERROR_MESSAGES: Record<CreateDealNoteFailureReason, string> = {
  DEAL_NOT_FOUND: 'Deal not found',
  FORBIDDEN: 'Not allowed to add notes to this deal',
  BODY_REQUIRED: 'body is required',
};

export function createDealNoteError(
  reason: CreateDealNoteFailureReason,
  message?: string,
): CreateDealNoteError {
  return new CreateDealNoteError(reason, message ?? CREATE_DEAL_NOTE_ERROR_MESSAGES[reason]);
}
