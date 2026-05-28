import type { ConversationThread } from '../../../../Crm.Domain/entities/ConversationThread';
import type { Profile } from '../../../../Crm.Domain/entities/Profile';
import { AppRole } from '../../../../Crm.Domain/enums/AppRole';
import { canAssignThread } from '../../../../Crm.Domain/rules/ConversationRules';
import { isSales } from '../../../../Crm.Domain/rules/helpers';
import { assignConversationError } from '../../errors/assignConversationError';
import type { IConversationThreadRepository } from '../../interfaces/repositories/IConversationThreadRepository';
import type { IProfileRepository } from '../../interfaces/repositories/IProfileRepository';

/** Body for PATCH /api/conversations/:threadId/assign (API contract). */
export interface AssignConversationInput {
  assignedTo: string;
}

/**
 * Use-case: assign a conversation thread to a sales rep (claim or manager reassign).
 * Used by PATCH /api/conversations/:threadId/assign; HTTP mapping stays in Crm.Api.
 */
export class AssignConversationService {
  constructor(
    private readonly conversationThreadRepository: IConversationThreadRepository,
    private readonly profileRepository: IProfileRepository,
  ) {}

  async execute(
    threadId: string,
    input: AssignConversationInput,
    actor: Profile,
  ): Promise<ConversationThread> {
    const thread = await this.conversationThreadRepository.getById(threadId);
    if (!thread) {
      throw assignConversationError('THREAD_NOT_FOUND');
    }

    if (!canAssignThread(actor, thread)) {
      throw assignConversationError('FORBIDDEN');
    }

    if (isSales(actor) && input.assignedTo !== actor.id) {
      throw assignConversationError('SALES_MUST_CLAIM_SELF');
    }

    const assignee = await this.profileRepository.getById(input.assignedTo);
    if (!assignee) {
      throw assignConversationError('ASSIGNEE_NOT_FOUND');
    }

    if (assignee.role !== AppRole.Sales) {
      throw assignConversationError('ASSIGNEE_NOT_SALES');
    }

    return this.conversationThreadRepository.assignTo(threadId, input.assignedTo);
  }
}
