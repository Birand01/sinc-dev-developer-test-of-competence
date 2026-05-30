import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/form/button'

/** Navigates from client detail back to the clients list. */
export function ClientBackButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="-ml-2 gap-1.5 font-medium text-foreground shadow-sm"
      asChild
    >
      <Link to="/clients">
        <ArrowLeft aria-hidden />
        Back to clients
      </Link>
    </Button>
  )
}
