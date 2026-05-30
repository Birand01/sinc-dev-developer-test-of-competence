import { ClientNewChatButton } from '@/features/clients/components/ClientNewChatButton'
import { ClientNewDealButton } from '@/features/clients/components/ClientNewDealButton'
import type { ClientDetailClientResponse } from '@/features/clients/types'

type ClientDetailHeaderProps = {
  client: ClientDetailClientResponse
}

function displayValue(value: string | null | undefined): string {
  if (value == null || value.trim() === '') return '—'
  return value
}

/** Client name, contact row, and primary actions (wireframe header). */
export function ClientDetailHeader({ client }: ClientDetailHeaderProps) {
  return (
    <header className="space-y-4 border-b border-border pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-semibold">{client.fullName}</h1>
        <div className="flex flex-wrap gap-2">
          <ClientNewDealButton clientId={client.id} />
          <ClientNewChatButton clientId={client.id} />
        </div>
      </div>
      <dl className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <div>
          <dt className="sr-only">Email</dt>
          <dd>
            <span className="text-foreground font-medium">Email:</span>{' '}
            {displayValue(client.email)}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Phone</dt>
          <dd>
            <span className="text-foreground font-medium">Phone:</span>{' '}
            {displayValue(client.phone)}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Target country</dt>
          <dd>
            <span className="text-foreground font-medium">Target:</span>{' '}
            {displayValue(client.targetCountry)}
          </dd>
        </div>
      </dl>
    </header>
  )
}
