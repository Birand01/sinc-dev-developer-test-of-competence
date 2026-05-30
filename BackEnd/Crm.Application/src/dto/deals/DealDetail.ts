import type { Deal } from '../../../../Crm.Domain/entities/Deal';
import type { DealNote } from '../../../../Crm.Domain/entities/DealNote';
import type { DealStageHistory } from '../../../../Crm.Domain/entities/DealStageHistory';

/** Compact client projection returned in deal detail responses. */
export interface DealClientSummary {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  country: string | null;
  targetCountry: string | null;
}

/** Compact sales rep projection for deal detail; null when deal is unassigned. */
export interface DealOwnerSummary {
  /** profiles.id — matches deal.ownerId when set */
  id: string;
  fullName: string;
}

/** Rich payload contract for GET /api/deals/:dealId. */
export interface DealDetail {
  deal: Deal;
  client: DealClientSummary;
  /** Resolved from profiles when deal.ownerId is set; null when unassigned. */
  owner: DealOwnerSummary | null;
  notes: DealNote[];
  stageHistory: DealStageHistory[];
}
