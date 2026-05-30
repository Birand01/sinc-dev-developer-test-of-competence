import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useMe } from '@/features/auth/hooks/useMe'
import { AppRole } from '@/features/auth/types'
import { ClientsTable } from '@/features/clients/components/ClientsTable'
import { NewClientButton } from '@/features/clients/components/NewClientButton'
import { useClients } from '@/features/clients/hooks/useClients'
import type { ClientDetailClientResponse } from '@/features/clients/types'
import { Input } from '@/components/ui/form/input'
import { ApiError } from '@/lib/apiClient'

/** CRM clients list — search, create lead, table rows → client detail. */
export function ClientsPage() {
  const navigate = useNavigate()
  const { data: me } = useMe()
  const [search, setSearch] = useState('')
  const trimmedSearch = search.trim()
  const { data, isLoading, isError, error } = useClients({
    params: trimmedSearch ? { q: trimmedSearch } : {},
  })

  const canCreateClient =
    me?.role === AppRole.Sales || me?.role === AppRole.Manager

  const handleClientCreated = (client: ClientDetailClientResponse) => {
    navigate(`/clients/${client.id}`)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        {canCreateClient ? (
          <NewClientButton onCreated={handleClientCreated} />
        ) : null}
      </div>

      <Input
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search clients"
        className="max-w-md"
      />

      {isLoading ? (
        <p className="text-muted-foreground text-sm" role="status">
          Loading clients…
        </p>
      ) : null}

      {isError ? (
        <p className="text-destructive text-sm" role="alert">
          {error instanceof ApiError ? error.message : 'Could not load clients'}
        </p>
      ) : null}

      {!isLoading && !isError && data ? <ClientsTable items={data} /> : null}
    </div>
  )
}
