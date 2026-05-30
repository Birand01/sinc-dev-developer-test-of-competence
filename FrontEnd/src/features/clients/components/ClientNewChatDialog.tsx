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
import { ApiError } from '@/lib/apiClient'

type ClientNewChatDialogProps = {
  clientId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Modal form to start a conversation for the current client (POST /api/conversations). */
export function ClientNewChatDialog({
  clientId,
  open,
  onOpenChange,
}: ClientNewChatDialogProps) {
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
        onSuccess: () => {
          setSubject('')
          setMessage('')
          onOpenChange(false)
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
            <DialogDescription>
              Start a conversation thread with this client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="chat-subject">Subject</Label>
              <Input
                id="chat-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="e.g. Admission help"
                disabled={isPending}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chat-message">Message</Label>
              <Textarea
                id="chat-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write the first message…"
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
