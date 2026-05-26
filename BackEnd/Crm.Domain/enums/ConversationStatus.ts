/**
 * Thread lifecycle status (conversation_threads.status / conversation_status enum).
 */
export const ConversationStatus = {
  Open: 'open',
  Pending: 'pending',
  Closed: 'closed',
} as const;

export type ConversationStatus =
  (typeof ConversationStatus)[keyof typeof ConversationStatus];
