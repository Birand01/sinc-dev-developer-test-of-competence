import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/form/button'
import { Input } from '@/components/ui/form/input'
import { Label } from '@/components/ui/form/label'
import { Textarea } from '@/components/ui/form/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlay/dialog'
import { useCreateConversation } from '@/features/conversations/hooks/useCreateConversation'
import type { ConversationThreadResponse } from '@/features/conversations/types'
import { ApiError } from '@/lib/apiClient'

/** Who opens the dialog — drives copy and form field ids (avoid duplicate htmlFor). */
export type StartConversationVariant = 'staff' | 'portal'

const copyByVariant = {
  staff: {
    description: 'Start a conversation thread with this client.',
    subjectPlaceholder: 'e.g. Admission help',
    messagePlaceholder: 'Write the first message…',
    subjectId: 'start-conversation-subject-staff',
    messageId: 'start-conversation-message-staff',
  },
  portal: {
    description: 'Start a conversation with your advisory team.',
    subjectPlaceholder: 'e.g. Visa document question',
    messagePlaceholder: 'Write your first message…',
    subjectId: 'start-conversation-subject-portal',
    messageId: 'start-conversation-message-portal',
  },
} as const satisfies Record<
  StartConversationVariant,
  {
    description: string
    subjectPlaceholder: string
    messagePlaceholder: string
    subjectId: string
    messageId: string
  }
>

/**
 * Shared modal to open a conversation thread (POST /api/conversations).
 *
 * Used by:
 * - Staff Client detail — `features/clients/ClientNewChatButton` (variant staff)
 * - Client portal My Chats — `features/client/ClientNewChatButton` (variant portal)
 *
 * Same API body: { clientId, subject, message }. Worker sets senderType from JWT role.
 * Client role also needs RLS policy threads_insert_client (migration 005).
 */
type StartConversationDialogProps = {
  /** clients.id — required by createConversationBodySchema. */
  clientId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: StartConversationVariant
  /** Optional — portal selects new thread in list; staff may omit. */
  onSuccess?: (thread: ConversationThreadResponse) => void
}

/** Controlled dialog: subject + first message → useCreateConversation. */
export function StartConversationDialog({
  clientId,
  open,
  onOpenChange,
  variant,
  onSuccess,
}: StartConversationDialogProps) {
  const copy = copyByVariant[variant]
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const { mutate, isPending, isError, error, reset } = useCreateConversation()

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSubject('')
      setMessage('')
      reset()
    }
    onOpenChange(nextOpen)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedSubject = subject.trim()
    const trimmedMessage = message.trim()
    if (!trimmedSubject || !trimmedMessage) return

    mutate(
      { clientId, subject: trimmedSubject, message: trimmedMessage },
      {
        onSuccess: (thread) => {
          setSubject('')
          setMessage('')
          onOpenChange(false)
          onSuccess?.(thread)
        },
      },
    )
  }

  const canSubmit = Boolean(subject.trim()) && Boolean(message.trim())

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor={copy.subjectId}>Subject</Label>
              <Input
                id={copy.subjectId}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder={copy.subjectPlaceholder}
                disabled={isPending}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={copy.messageId}>Message</Label>
              <Textarea
                id={copy.messageId}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={copy.messagePlaceholder}
                disabled={isPending}
                rows={4}
              />
            </div>
          </div>
          {isError ? (
            <p className="text-destructive text-sm" role="alert">
              {error instanceof ApiError
                ? error.message
                : 'Could not start conversation'}
            </p>
          ) : null}
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !canSubmit}>
              {isPending ? 'Starting…' : 'Start chat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
