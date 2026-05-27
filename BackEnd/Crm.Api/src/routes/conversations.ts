import { Hono } from 'hono';
import type { CreateConversationInput } from '../../../Crm.Application/src/services';
import {
  CreateConversationService,
  GetConversationThreadByIdService,
  GetMeService,
  ListConversationThreadsService,
} from '../../../Crm.Application/src/services';
import { AppRole } from '../../../Crm.Domain/enums/AppRole';
import { MessageSenderType } from '../../../Crm.Domain/enums/MessageSenderType';
import { ConversationMessageRepository } from '../../../Crm.Infrastructure/src/repositories/ConversationMessageRepository';
import { ConversationThreadRepository } from '../../../Crm.Infrastructure/src/repositories/ConversationThreadRepository';
import { ProfileRepository } from '../../../Crm.Infrastructure/src/repositories/ProfileRepository';
import { ApiError } from '../errors/ApiError';
import { HttpStatus } from '../http/HttpStatus';
import type { Env } from '../types/env';

/**
 * Conversation routes under /api/conversations (see app.ts mount).
 * Handlers delegate to Application services — no Supabase calls here.
 */
const conversations = new Hono<Env>();

/**
 * GET /api/conversations
 */
conversations.get('/', async (c) => {
  const supabase = c.get('supabase');

  const listThreads = new ListConversationThreadsService(
    new ConversationThreadRepository(supabase),
  );
  const items = await listThreads.execute();

  return c.json(
    items.map((thread) => ({
      id: thread.id,
      clientId: thread.clientId,
      assignedTo: thread.assignedTo,
      subject: thread.subject,
      status: thread.status,
      lastMessageAt: thread.lastMessageAt.toISOString(),
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
    })),
  );
});

/**
 * POST /api/conversations
 */
conversations.post('/', async (c) => {
  // --- Block 1: Auth context (set by middleware; not from request body) ---
  const supabase = c.get('supabase');
  const userId = c.get('userId');

  // --- Block 2: Parse JSON body; malformed JSON → 400 INVALID_JSON ---
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    throw new ApiError({
      code: 'INVALID_JSON',
      status: HttpStatus.BadRequest,
      message: 'Invalid JSON body',
    });
  }

  // --- Block 3: Required-field type guard (clientId, subject, message) ---
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as { clientId?: unknown }).clientId !== 'string' ||
    typeof (body as { subject?: unknown }).subject !== 'string' ||
    typeof (body as { message?: unknown }).message !== 'string'
  ) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'clientId, subject, and message are required',
    });
  }

  // --- Block 4: Normalize (trim) and reject empty strings ---
  const raw = body as { clientId: string; subject: string; message: string };
  const input: CreateConversationInput = {
    clientId: raw.clientId.trim(),
    subject: raw.subject.trim(),
    message: raw.message.trim(),
  };

  if (!input.clientId || !input.subject || !input.message) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'clientId, subject, and message are required',
    });
  }

  // --- Block 5: Resolve senderType from profile role (client vs team) ---
  const profile = await new GetMeService(new ProfileRepository(supabase)).execute(userId);
  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  const senderType =
    profile.role === AppRole.Client ? MessageSenderType.Client : MessageSenderType.Team;

  // --- Block 6: Api → Application → Infrastructure (thread + first message) ---
  const createConversation = new CreateConversationService(
    new ConversationThreadRepository(supabase),
    new ConversationMessageRepository(supabase),
  );
  const thread = await createConversation.execute(input, userId, senderType);

  // --- Block 7: Map domain thread → API JSON; 201 Created ---
  return c.json(
    {
      id: thread.id,
      clientId: thread.clientId,
      assignedTo: thread.assignedTo,
      subject: thread.subject,
      status: thread.status,
      lastMessageAt: thread.lastMessageAt.toISOString(),
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
    },
    HttpStatus.Created,
  );
});

/**
 * GET /api/conversations/:threadId
 */
conversations.get('/:threadId', async (c) => {
  const threadId = c.req.param('threadId');
  const supabase = c.get('supabase');

  const getThreadById = new GetConversationThreadByIdService(
    new ConversationThreadRepository(supabase),
  );
  const thread = await getThreadById.execute(threadId);

  if (!thread) {
    throw new ApiError({
      code: 'NOT_FOUND',
      status: HttpStatus.NotFound,
      message: 'Conversation thread not found',
    });
  }

  return c.json({
    id: thread.id,
    clientId: thread.clientId,
    assignedTo: thread.assignedTo,
    subject: thread.subject,
    status: thread.status,
    lastMessageAt: thread.lastMessageAt.toISOString(),
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
  });
});

export { conversations };
