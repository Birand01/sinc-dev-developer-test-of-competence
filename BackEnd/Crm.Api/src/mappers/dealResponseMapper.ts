import type { Deal } from '../../../Crm.Domain/entities/Deal';
import type { DealNote } from '../../../Crm.Domain/entities/DealNote';
import type { DealDetail } from '../../../Crm.Application/src/dto/deals/DealDetail';

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

/** API response mapper for deal note resources. */
export function toDealNoteResponse(note: DealNote) {
  return {
    id: note.id,
    dealId: note.dealId,
    authorId: note.authorId,
    body: note.body,
    createdAt: note.createdAt.toISOString(),
  };
}

/** API response mapper for rich deal detail resources. */
export function toDealDetailResponse(detail: DealDetail) {
  return {
    deal: toDealResponse(detail.deal),
    client: detail.client,
    notes: detail.notes.map(toDealNoteResponse),
    stageHistory: detail.stageHistory.map((entry) => ({
      id: entry.id,
      dealId: entry.dealId,
      fromStage: entry.fromStage,
      toStage: entry.toStage,
      changedBy: entry.changedBy,
      createdAt: entry.createdAt.toISOString(),
    })),
  };
}
