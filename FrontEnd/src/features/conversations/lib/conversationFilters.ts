import type { ConversationThreadResponse } from '@/features/conversations/types'

/** Inbox assignee scope filter values (Conversations workspace toolbar). */
export const conversationFilterAll = 'all'
export const conversationFilterMine = 'mine'
export const conversationFilterUnassigned = 'unassigned'

export type ConversationAssigneeFilter =
  | typeof conversationFilterAll
  | typeof conversationFilterMine
  | typeof conversationFilterUnassigned

export const conversationAssigneeFilterDefault: ConversationAssigneeFilter =
  conversationFilterAll

/** Toolbar button order (wireframe: Unassigned → Mine → All). */
export const conversationAssigneeFilterOrder = [
  conversationFilterUnassigned,
  conversationFilterMine,
  conversationFilterAll,
] as const satisfies ReadonlyArray<ConversationAssigneeFilter>

export function formatConversationAssigneeFilterLabel(
  filter: ConversationAssigneeFilter,
): string {
  return filter.charAt(0).toUpperCase() + filter.slice(1)
}

/** Client-side inbox slice — GET /api/conversations has no assignee query param. */
export function filterThreadsByAssignee(
  threads: ConversationThreadResponse[],
  assigneeFilter: ConversationAssigneeFilter,
  currentUserId: string | undefined,
): ConversationThreadResponse[] {
  if (assigneeFilter === conversationFilterUnassigned) {
    return threads.filter((thread) => thread.assignedTo === null)
  }

  if (assigneeFilter === conversationFilterMine && currentUserId) {
    return threads.filter((thread) => thread.assignedTo === currentUserId)
  }

  return threads
}
