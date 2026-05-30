import type { ReactNode } from 'react'
import { useParams } from 'react-router-dom'

import { BackLink } from '@/components/common/BackLink'
import { ClientConversationsCard } from '@/features/clients/components/ClientConversationsCard'
import { ClientDealsCard } from '@/features/clients/components/ClientDealsCard'
import { ClientDetailActivity } from '@/features/clients/components/ClientDetailActivity'
import { ClientDetailHeader } from '@/features/clients/components/ClientDetailHeader'
import { useClientDetail } from '@/features/clients/hooks/useClientDetail'
import { ApiError } from '@/lib/apiClient'

/**
 * Client detail — GET /api/clients/:clientId.
 * Layout sections added incrementally as feature components land.
 */
export function ClientDetailPage() {
  const { clientId } = useParams()
  const id = clientId ?? ''
  const { data, isLoading, isError, error } = useClientDetail(id)

  let content: ReactNode = null

  if (isLoading) {
    content = (
      <p className="text-muted-foreground text-sm" role="status">
        Loading client…
      </p>
    )
  } else if (isError || !data) {
    const message =
      error instanceof ApiError ? error.message : 'Could not load client'
    content = (
      <p className="text-destructive text-sm" role="alert">
        {message}
      </p>
    )
  } else {
    content = (
      <>
        <ClientDetailHeader client={data.client} />
        <div className="grid gap-6 lg:grid-cols-2">
          <ClientConversationsCard items={data.conversations} />
          <ClientDealsCard items={data.deals} />
        </div>
        <ClientDetailActivity items={data.recentActivity} />
      </>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <BackLink to="/clients" label="Back to clients" />
      {content}
    </div>
  )
}
