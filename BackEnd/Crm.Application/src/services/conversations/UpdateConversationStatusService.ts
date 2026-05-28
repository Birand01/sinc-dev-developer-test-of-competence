import type { ConversationThread } from '../../../../Crm.Domain/entities/ConversationThread';
import type { Profile } from '../../../../Crm.Domain/entities/Profile';
import {
  ConversationStatus,
  type ConversationStatus as ConversationStatusType,
} from '../../../../Crm.Domain/enums/ConversationStatus';
import { canUpdateThreadStatus } from '../../../../Crm.Domain/rules/ConversationRules';
import { updateConversationStatusError } from '../../errors/updateConversationStatusError';
import type { IConversationThreadRepository } from '../../interfaces/repositories/IConversationThreadRepository';

/** Body for PATCH /api/conversations/:threadId/status (API contract). */
export interface UpdateConversationStatusInput {
  status: ConversationStatusType;
}

const allowedStatuses = new Set<string>(Object.values(ConversationStatus));

function parseStatus(value: string): ConversationStatusType | null {
  if (!allowedStatuses.has(value)) {
    return null;
  }
  return value as ConversationStatusType;
}

/**
 * Use-case: update conversation thread status (open / pending / closed).
 * Used by PATCH /api/conversations/:threadId/status; HTTP mapping stays in Crm.Api.
 */
export class UpdateConversationStatusService {
  constructor(private readonly conversationThreadRepository: IConversationThreadRepository) {}

  async execute(
    threadId: string,
    input: UpdateConversationStatusInput,
    actor: Profile,
  ): Promise<ConversationThread> {
    const status = parseStatus(input.status);
    if (!status) {
      throw updateConversationStatusError('INVALID_STATUS');
    }

    const thread = await this.conversationThreadRepository.getById(threadId);
    if (!thread) {
      throw updateConversationStatusError('THREAD_NOT_FOUND');
    }

    if (!canUpdateThreadStatus(actor, thread)) {
      throw updateConversationStatusError('FORBIDDEN');
    }

    return this.conversationThreadRepository.updateStatus(threadId, status);
  }
}
