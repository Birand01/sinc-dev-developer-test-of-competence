import type { DealStage } from '../enums/DealStage';

/**
 * Audit log for deal stage changes (deal_stage_history table).
 * Written on every stage transition; from_stage is null on first entry.
 */
export interface DealStageHistory {
  id: string;
  /** deals.id */
  dealId: string;
  /** Previous stage; null when deal first enters the pipeline */
  fromStage: DealStage | null;
  toStage: DealStage;
  /** profiles.id of user who made the change */
  changedBy: string;
  createdAt: Date;
}
