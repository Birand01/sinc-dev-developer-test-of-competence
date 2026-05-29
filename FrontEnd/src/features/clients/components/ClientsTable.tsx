import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/data/table'
import type { ClientResponse } from '@/features/clients/types'

type ClientsTableProps = {
  items: ClientResponse[]
}

function displayValue(value: string | null | undefined): string {
  if (value == null || value.trim() === '') return '—'
  return value
}

function formatActiveDeal(title: string | null): string {
  if (title == null || title.trim() === '') return 'No active deal'
  return title
}

/** Client list table — data from GET /api/clients; no fetching here. */
export function ClientsTable({ items }: ClientsTableProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No clients match your search.</p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Target Country</TableHead>
          <TableHead>Active Deal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.fullName}</TableCell>
            <TableCell>{displayValue(client.email)}</TableCell>
            <TableCell>{displayValue(client.targetCountry)}</TableCell>
            <TableCell>{formatActiveDeal(client.activeDealTitle)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
