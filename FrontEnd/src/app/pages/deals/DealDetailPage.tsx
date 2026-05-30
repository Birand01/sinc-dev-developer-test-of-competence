import { useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { AppRole } from '@/features/auth/types'
import { useMe } from '@/features/auth/hooks/useMe'
import { DealDetailHeader } from '@/features/deals/components/DealDetailHeader'
import { DealNotesCard } from '@/features/deals/components/DealNotesCard'
import { DealStageHistoryCard } from '@/features/deals/components/DealStageHistoryCard'
import { useDealDetail } from '@/features/deals/hooks/useDealDetail'
import { ApiError } from '@/lib/apiClient'

/**
 * Deal detail page — GET /api/deals/:dealId (deal, client, notes, stageHistory).
 * Stage edits: manager on any deal; sales on owned deals only.
 */
export function DealDetailPage() {
  const { dealId } = useParams()
  const id = dealId ?? ''
  const { data: me } = useMe()
  const { data, isLoading, isError, error } = useDealDetail(id)

  // Matches backend canUpdateDeal + RLS (manager all; sales owned only).
  const canEditStage =
    data?.deal != null &&
    (me?.role === AppRole.Manager ||
      (me?.role === AppRole.Sales && data.deal.ownerId === me.id))

  return (
    <div className="space-y-6 p-6">
      <BackLink to="/deals" label="Back to pipeline" />

      {isLoading ? (
        <p className="text-muted-foreground text-sm" role="status">
          Loading deal…
        </p>
      ) : null}

      {isError || (!isLoading && !data) ? (
        <p className="text-destructive text-sm" role="alert">
          {error instanceof ApiError ? error.message : 'Could not load deal'}
        </p>
      ) : null}

      {data ? (
        <>
          <DealDetailHeader
            dealId={id}
            deal={data.deal}
            client={data.client}
            canEditStage={canEditStage}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <DealNotesCard
              dealId={id}
              items={data.notes}
              canAddNote={canEditStage}
            />
            <DealStageHistoryCard
              items={data.stageHistory}
              lostReason={data.deal.lostReason}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
