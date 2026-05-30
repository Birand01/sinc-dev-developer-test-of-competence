/**
 * React Query cache keys for conversation reads and invalidation targets.
 *
 * Assignee filters (Unassigned / Mine / All) are applied client-side on the
 * list result — GET /api/conversations has no query params yet.
 */
export const conversationsQueryKeys = {
  /** Inbox list — GET /api/conversations (useConversations). */
  list: () => ['conversations', 'list'] as const,
  /** Prefix — invalidate after create/assign/status so inbox refetches. */
  allLists: ['conversations', 'list'] as const,
  /** Thread header — GET /api/conversations/:threadId (future detail pane). */
  detail: (threadId: string) => ['conversations', 'detail', threadId] as const,
  /** Message transcript — GET /api/conversations/:threadId/messages. */
  messages: (threadId: string) =>
    ['conversations', 'messages', threadId] as const,
}
