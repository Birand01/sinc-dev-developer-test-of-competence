import { DealStage } from '@/features/dashboard/types'
import type { DealStage as DealStageType } from '@/features/dashboard/types'
import type { DealResponse } from '@/features/deals/types'

import { PipelineColumn } from './PipelineColumn'

/** Column order for GET /api/deals kanban (matches wireframe + DealStage enum). */
const PIPELINE_STAGES: { stage: DealStageType; label: string }[] = [
  { stage: DealStage.NewLead, label: 'New Lead' },
  { stage: DealStage.Contacted, label: 'Contacted' },
  { stage: DealStage.ConsultationBooked, label: 'Consultation' },
  { stage: DealStage.DocumentsRequested, label: 'Documents' },
  { stage: DealStage.ApplicationStarted, label: 'Application' },
  { stage: DealStage.Submitted, label: 'Submitted' },
  { stage: DealStage.Won, label: 'Won' },
  { stage: DealStage.Lost, label: 'Lost' },
]

type PipelineBoardProps = {
  deals: DealResponse[]
  onDealClick?: (deal: DealResponse) => void
}

/** Kanban board — groups deals by stage into columns. */
export function PipelineBoard({ deals, onDealClick }: PipelineBoardProps) {
  const dealsByStage = new Map<DealStageType, DealResponse[]>()

  // Initialise empty buckets for every pipeline column.
  for (const { stage } of PIPELINE_STAGES) {
    dealsByStage.set(stage, [])
  }

  // Client-side group — API returns a flat list (GET /api/deals).
  for (const deal of deals) {
    const column = dealsByStage.get(deal.stage)
    if (column) {
      column.push(deal)
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {PIPELINE_STAGES.map(({ stage, label }) => (
        <PipelineColumn
          key={stage}
          label={label}
          deals={dealsByStage.get(stage) ?? []}
          onDealClick={onDealClick}
        />
      ))}
    </div>
  )
}
