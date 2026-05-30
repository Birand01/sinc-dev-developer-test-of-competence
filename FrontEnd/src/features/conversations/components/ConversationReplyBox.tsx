import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/form/button'
import { Textarea } from '@/components/ui/form/textarea'
import { useSendConversationMessage } from '@/features/conversations/hooks/useSendConversationMessage'
import { ApiError } from '@/lib/apiClient'

type ConversationReplyBoxProps = {
  threadId: string
}

/** Staff reply composer — POST /api/conversations/:threadId/messages (wireframe bottom bar). */
export function ConversationReplyBox({ threadId }: ConversationReplyBoxProps) {
  const [message, setMessage] = useState('')
  const { mutate, isPending, isError, error, reset } = useSendConversationMessage({
    threadId,
  })

  const trimmedMessage = message.trim()
  const canSend = trimmedMessage.length > 0 && !isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSend) return

    mutate(
      { message: trimmedMessage },
      {
        onSuccess: () => {
          setMessage('')
          reset()
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Reply…"
        disabled={isPending}
        rows={3}
        aria-label="Reply to conversation"
        className="min-h-[80px] resize-none"
      />
      {isError ? (
        <p className="text-destructive text-sm" role="alert">
          {error instanceof ApiError ? error.message : 'Could not send message'}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" disabled={!canSend}>
          {isPending ? 'Sending…' : 'Send'}
        </Button>
      </div>
    </form>
  )
}
