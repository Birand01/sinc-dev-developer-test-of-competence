import { useEffect, useMemo } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select'
import { useAssignConversation } from '@/features/conversations/hooks/useAssignConversation'
import { useSalesRepOptions } from '@/features/deals/hooks/useSalesRepOptions'
import { ApiError } from '@/lib/apiClient'

/** Select value when thread returns to the unassigned pool (PATCH assignedTo: null). */
export const conversationAssigneeUnassigned = 'unassigned'

type ConversationReassignSelectProps = {
  threadId: string
  /** Current thread.assignedTo; null when unassigned. */
  assignedTo: string | null
  /** Display name when assignee is not in dashboard dealsByOwner list. */
  assigneeFullName?: string | null
  /** Disable while claim or send runs in the same pane. */
  disabled?: boolean
  /** Notifies parent so sibling controls can disable during reassign. */
  onPendingChange?: (isPending: boolean) => void
}

/**
 * Manager-only assignee reassign (PATCH /api/conversations/:threadId/assign).
 * Inline Select — Unassigned or a sales rep from dashboard dealsByOwner.
 */
export function ConversationReassignSelect({
  threadId,
  assignedTo,
  assigneeFullName,
  disabled = false,
  onPendingChange,
}: ConversationReassignSelectProps) {
  const { options, isLoading: isLoadingOptions } = useSalesRepOptions()
  const { mutate, isPending, isError, error } = useAssignConversation({
    threadId,
  })

  const selectValue = assignedTo ?? conversationAssigneeUnassigned

  const repOptions = useMemo(() => {
    if (assignedTo && !options.some((option) => option.id === assignedTo)) {
      return [
        {
          id: assignedTo,
          label: assigneeFullName?.trim() || 'Current assignee',
        },
        ...options,
      ]
    }
    return options
  }, [options, assignedTo, assigneeFullName])

  useEffect(() => {
    onPendingChange?.(isPending)
  }, [isPending, onPendingChange])

  function handleAssigneeChange(nextValue: string) {
    if (nextValue === selectValue) return

    if (nextValue === conversationAssigneeUnassigned) {
      mutate({ assignedTo: null })
      return
    }

    mutate({ assignedTo: nextValue })
  }

  const selectDisabled = disabled || isPending || isLoadingOptions

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <Select
        value={selectValue}
        disabled={selectDisabled}
        onValueChange={handleAssigneeChange}
      >
        <SelectTrigger
          className="h-8 min-w-[172px] border-foreground/30 bg-background font-medium text-foreground shadow-sm hover:border-foreground/50 hover:bg-muted/40 data-placeholder:text-muted-foreground"
          aria-label="Reassign conversation assignee"
        >
          <SelectValue placeholder="Unassigned" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={conversationAssigneeUnassigned}>
            Unassigned
          </SelectItem>
          {repOptions.map((rep) => (
            <SelectItem key={rep.id} value={rep.id}>
              {rep.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending ? (
        <span className="text-muted-foreground text-xs" role="status">
          Updating…
        </span>
      ) : null}
      {isError ? (
        <span className="text-destructive text-xs" role="alert">
          {error instanceof ApiError
            ? error.message
            : 'Could not reassign conversation'}
        </span>
      ) : null}
    </span>
  )
}
