import {
  MessageSenderType,
  type MessageSenderType as MessageSenderTypeValue,
} from '@/features/conversations/types'

/** Wireframe transcript label — client vs team (Sales). */
export function formatMessageSenderLabel(
  senderType: MessageSenderTypeValue,
): string {
  return senderType === MessageSenderType.Client ? 'Client' : 'Sales'
}

/** Display label for inbox queue assignee column (assignedTo is profiles.id or null). */
export function formatConversationAssigneeLabel(
  assignedTo: string | null,
  assigneeNameById?: Record<string, string>,
): string {
  if (assignedTo === null) {
    return 'Unassigned'
  }

  const name = assigneeNameById?.[assignedTo]?.trim()
  return name || 'Assigned'
}

/** Capitalize conversation status for Badge copy (open → Open). */
export function formatConversationStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
