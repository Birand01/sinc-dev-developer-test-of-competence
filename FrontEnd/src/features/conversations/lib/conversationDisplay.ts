import {
  MessageSenderType,
  type MessageSenderType as MessageSenderTypeValue,
} from '@/features/conversations/types'

/** Who reads the transcript — staff inbox vs client portal wording. */
export type MessageSenderLabelVariant = 'staff' | 'portal'

/** Transcript sender prefix — staff: Client/Sales; portal: You/Advisor. */
export function formatMessageSenderLabel(
  senderType: MessageSenderTypeValue,
  variant: MessageSenderLabelVariant = 'staff',
): string {
  if (variant === 'portal') {
    return senderType === MessageSenderType.Client ? 'You' : 'Advisor'
  }
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
