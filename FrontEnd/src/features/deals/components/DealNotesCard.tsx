import { useState, type FormEvent } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/display/card'
import { Button } from '@/components/ui/form/button'
import { Label } from '@/components/ui/form/label'
import { Textarea } from '@/components/ui/form/textarea'
import { useCreateDealNote } from '@/features/deals/hooks/useCreateDealNote'
import type { DealNoteResponse } from '@/features/deals/types'
import { ApiError } from '@/lib/apiClient'

type DealNotesCardProps = {
  dealId: string
  /** From GET /api/deals/:dealId → notes[]. */
  items: DealNoteResponse[]
  /** Manager always; sales only when deal.ownerId matches signed-in user. */
  canAddNote: boolean
}

function formatNoteDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/**
 * Deal detail — notes column (wireframe left card).
 * Add form → POST /api/deals/:dealId/notes via useCreateDealNote when canAddNote.
 */
export function DealNotesCard({
  dealId,
  items,
  canAddNote,
}: DealNotesCardProps) {
  const [body, setBody] = useState('')
  const { mutate, isPending, isError, error, reset } = useCreateDealNote({
    dealId,
  })

  // Newest first for the activity-style feed.
  const notes = [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return

    mutate(
      { body: trimmed },
      {
        onSuccess: () => {
          setBody('')
          reset()
        },
      },
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canAddNote ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Label htmlFor="deal-note-body">Add note</Label>
            <Textarea
              id="deal-note-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Internal note about this deal…"
              disabled={isPending}
              rows={3}
            />
            {isError ? (
              <p className="text-destructive text-sm" role="alert">
                {error instanceof ApiError
                  ? error.message
                  : 'Could not add note'}
              </p>
            ) : null}
            <Button type="submit" disabled={isPending || !body.trim()}>
              {isPending ? 'Adding…' : 'Add note'}
            </Button>
          </form>
        ) : null}

        {notes.length === 0 ? (
          <p className="text-muted-foreground text-sm">No notes yet.</p>
        ) : (
          <ul className="space-y-4">
            {notes.map((note) => (
              <li key={note.id} className="space-y-1">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {note.body}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatNoteDate(note.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
