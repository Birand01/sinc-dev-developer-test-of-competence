import type { Deal } from '../../../Crm.Domain/entities/Deal';

/** API response mapper for deal resources. */
export function toDealResponse(deal: Deal) {
  return {
    id: deal.id,
    clientId: deal.clientId,
    ownerId: deal.ownerId,
    title: deal.title,
    stage: deal.stage,
    valueAmount: deal.valueAmount,
    valueCurrency: deal.valueCurrency,
    expectedIntake: deal.expectedIntake,
    lostReason: deal.lostReason,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
  };
}
