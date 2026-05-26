/**
 * Who sent the message (conversation_messages.sender_type / message_sender_type enum).
 * team = sales or manager on behalf of the organization.
 */
export const MessageSenderType = {
  Client: 'client',
  Team: 'team',
} as const;

export type MessageSenderType =
  (typeof MessageSenderType)[keyof typeof MessageSenderType];
