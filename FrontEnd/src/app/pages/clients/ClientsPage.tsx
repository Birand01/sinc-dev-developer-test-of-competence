import { useState } from 'react'

import { ClientsTable } from '@/features/clients/components/ClientsTable'
import { useClients } from '@/features/clients/hooks/useClients'
import { Input } from '@/components/ui/form/input'
import { ApiError } from '@/lib/apiClient'

/** CRM clients list — GET /api/clients with optional search. */
export function ClientsPage() {
  const [search, setSearch] = useState('')
  const trimmedSearch = search.trim()
  const { data, isLoading, isError, error } = useClients({
    params: trimmedSearch ? { q: trimmedSearch } : {},
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
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
