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

/** Rich payload contract for GET /api/deals/:dealId. */
export interface DealDetail {
  deal: Deal;
  client: DealClientSummary;
  notes: DealNote[];
  stageHistory: DealStageHistory[];
}
