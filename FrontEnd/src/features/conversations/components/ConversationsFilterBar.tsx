import { Button } from '@/components/ui/form/button'
import {
  conversationAssigneeFilterOrder,
  formatConversationAssigneeFilterLabel,
  type ConversationAssigneeFilter,
} from '@/features/conversations/lib/conversationFilters'

type ConversationsFilterBarProps = {
  value: ConversationAssigneeFilter
  onValueChange: (value: ConversationAssigneeFilter) => void
}

/** Inbox assignee scope — Unassigned / Mine / All (wireframe top bar). */
export function ConversationsFilterBar({
  value,
  onValueChange,
}: ConversationsFilterBarProps) {
  return (
    <div
      role="group"
      aria-label="Filter conversations by assignee"
      className="flex flex-wrap gap-2"
    >
      {conversationAssigneeFilterOrder.map((filter) => {
        const isActive = value === filter

        return (
          <Button
            key={filter}
            type="button"
            size="sm"
            variant={isActive ? 'default' : 'outline'}
            aria-pressed={isActive}
            onClick={() => onValueChange(filter)}
          >
            {formatConversationAssigneeFilterLabel(filter)}
          </Button>
        )
      })}
    </div>
  )
}
