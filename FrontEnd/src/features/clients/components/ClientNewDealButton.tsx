import { Button } from '@/components/ui/form/button'

type ClientNewDealButtonProps = {
  clientId: string
}

/** Starts a new deal for the current client — wired to POST /api/deals later. */
export function ClientNewDealButton({ clientId }: ClientNewDealButtonProps) {
  return (
    <Button type="button" variant="outline" disabled aria-label={`New deal for client ${clientId}`}>
      New Deal
    </Button>
  )
}
