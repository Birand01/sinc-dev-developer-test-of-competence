import type { Deal } from '../../../Crm.Domain/entities/Deal';
import { DealStage } from '../../../Crm.Domain/enums/DealStage';
import type { DealStage as DealStageType } from '../../../Crm.Domain/enums/DealStage';

/** Row shape returned by Supabase from public.deals (snake_case). */
export type DealRow = {
  id: string;
  client_id: string;
  owner_id: string | null;
  title: string;
  stage: string;
  value_amount: number | string | null;
  value_currency: string | null;
  expected_intake: string | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
};

function toDealStage(value: string): DealStageType {
  const allowed = Object.values(DealStage) as string[];
  if (!allowed.includes(value)) {
    throw new Error(`Invalid deals.stage value: ${value}`);
  }
  return value as DealStageType;
}

function toNumberOrNull(value: number | string | null): number | null {
  if (value === null || value === '') {
    return null;
  }
  const n = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(n)) {
    throw new Error(`Invalid deals.value_amount: ${value}`);
  }
  return n;
}

/** Maps a Supabase deals row to the domain Deal entity. */
export function toDeal(row: DealRow): Deal {
  return {
    id: row.id,
    clientId: row.client_id,
    ownerId: row.owner_id,
    title: row.title,
    stage: toDealStage(row.stage),
    valueAmount: toNumberOrNull(row.value_amount),
    valueCurrency: row.value_currency,
    expectedIntake: row.expected_intake,
    lostReason: row.lost_reason,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
