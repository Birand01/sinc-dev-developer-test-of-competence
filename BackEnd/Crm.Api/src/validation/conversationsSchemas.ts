import { z } from 'zod';
import { ConversationStatus } from '../../../Crm.Domain/enums/ConversationStatus';

const requiredTrimmedString = z.string().trim().min(1);

/** Body schema for POST /api/conversations. */
export const createConversationBodySchema = z.object({
  clientId: requiredTrimmedString,
  subject: requiredTrimmedString,
  message: requiredTrimmedString,
});

/** Body schema for POST /api/conversations/:threadId/messages. */
export const sendConversationMessageBodySchema = z.object({
  message: requiredTrimmedString,
});

/** Body schema for PATCH /api/conversations/:threadId/assign. */
export const assignConversationBodySchema = z.object({
  assignedTo: requiredTrimmedString,
});

/** Body schema for PATCH /api/conversations/:threadId/status. */
export const updateConversationStatusBodySchema = z.object({
  status: z.enum(Object.values(ConversationStatus) as [string, ...string[]]),
});

export type CreateConversationBody = z.infer<typeof createConversationBodySchema>;
export type SendConversationMessageBody = z.infer<typeof sendConversationMessageBodySchema>;
export type AssignConversationBody = z.infer<typeof assignConversationBodySchema>;
export type UpdateConversationStatusBody = z.infer<typeof updateConversationStatusBodySchema>;
