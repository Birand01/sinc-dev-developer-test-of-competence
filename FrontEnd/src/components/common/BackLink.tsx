import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/form/button'

type BackLinkProps = {
  /** React Router destination (e.g. `/clients`, `/deals`). */
  to: string
  /** Visible label after the arrow (e.g. `Back to clients`). */
  label: string
}

/** Outline back navigation used on detail pages (client, deal, …). */
export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="-ml-2 gap-1.5 font-medium text-foreground shadow-sm"
      asChild
    >
      <Link to={to}>
        <ArrowLeft aria-hidden />
        {label}
      </Link>
    </Button>
  )
}
