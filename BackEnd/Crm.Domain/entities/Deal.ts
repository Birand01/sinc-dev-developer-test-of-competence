import type { DealStage } from '../enums/DealStage';

/**
 * Sales pipeline deal for a client (deals table).
 * owner_id is the sales rep; managers can reassign any deal.
 */
export interface Deal {
  id: string;
  /** clients.id */
  clientId: string;
  /** profiles.id of owning sales rep; null if unassigned */
  ownerId: string | null;
  title: string;
  stage: DealStage;
  valueAmount: number | null;
  valueCurrency: string | null;
  expectedIntake: string | null;
  /** Required when stage is lost (case study rule) */
  lostReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
