import type { DealStageHistory } from '../../../Crm.Domain/entities/DealStageHistory';
import { DealStage } from '../../../Crm.Domain/enums/DealStage';
import type { DealStage as DealStageType } from '../../../Crm.Domain/enums/DealStage';

/** Row shape returned by Supabase from public.deal_stage_history (snake_case). */
export type DealStageHistoryRow = {
  id: string;
  deal_id: string;
  from_stage: string | null;
  to_stage: string;
  changed_by: string;
  created_at: string;
};

function toDealStage(value: string): DealStageType {
  const allowed = Object.values(DealStage) as string[];
  if (!allowed.includes(value)) {
    throw new Error(`Invalid deal_stage_history stage value: ${value}`);
  }
  return value as DealStageType;
}

function toDealStageOrNull(value: string | null): DealStageType | null {
  if (value === null) {
    return null;
  }
  return toDealStage(value);
}

/** Maps a Supabase deal_stage_history row to the domain DealStageHistory entity. */
export function toDealStageHistory(row: DealStageHistoryRow): DealStageHistory {
  return {
    id: row.id,
    dealId: row.deal_id,
    fromStage: toDealStageOrNull(row.from_stage),
    toStage: toDealStage(row.to_stage),
    changedBy: row.changed_by,
    createdAt: new Date(row.created_at),
  };
}
