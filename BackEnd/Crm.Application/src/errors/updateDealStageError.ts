export type UpdateDealStageFailureReason =
  | 'DEAL_NOT_FOUND'
  | 'FORBIDDEN'
  | 'LOST_REASON_REQUIRED';

/** Application failure for deal stage update use-case; Crm.Api maps reason → HTTP status. */
export class UpdateDealStageError extends Error {
  constructor(
    public readonly reason: UpdateDealStageFailureReason,
    message: string,
  ) {
    super(message);
    this.name = 'UpdateDealStageError';
  }
}

/** Factory for deal stage update failures (keeps service focused on business flow). */
const UPDATE_DEAL_STAGE_ERROR_MESSAGES: Record<UpdateDealStageFailureReason, string> = {
  DEAL_NOT_FOUND: 'Deal not found',
  FORBIDDEN: 'Not allowed to update this deal stage',
  LOST_REASON_REQUIRED: 'lostReason is required when stage is lost',
};

export function updateDealStageError(
  reason: UpdateDealStageFailureReason,
  message?: string,
): UpdateDealStageError {
  return new UpdateDealStageError(reason, message ?? UPDATE_DEAL_STAGE_ERROR_MESSAGES[reason]);
}
