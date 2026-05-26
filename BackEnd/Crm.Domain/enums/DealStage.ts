/**
 * Deal pipeline stage (deals.stage / deal_stage enum).
 * lost stage requires lostReason on the Deal when moving to lost.
 */
export const DealStage = {
  NewLead: 'new_lead',
  Contacted: 'contacted',
  ConsultationBooked: 'consultation_booked',
  DocumentsRequested: 'documents_requested',
  ApplicationStarted: 'application_started',
  Submitted: 'submitted',
  Won: 'won',
  Lost: 'lost',
} as const;

export type DealStage = (typeof DealStage)[keyof typeof DealStage];
