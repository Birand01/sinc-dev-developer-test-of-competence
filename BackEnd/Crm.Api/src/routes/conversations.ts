import { Hono } from 'hono';
import { AssignConversationError, UpdateConversationStatusError } from '../../../Crm.Application/src/errors';
import { ApiError, mapAssignConversationError, mapUpdateConversationStatusError } from '../errors';
import type {
  AssignConversationInput,
  CreateConversationInput,
  SendMessageInput,
  UpdateConversationStatusInput,
} from '../../../Crm.Application/src/services';
import {
  AssignConversationService,
  CreateConversationService,
  GetConversationThreadByIdService,
  GetMeService,
  ListConversationMessagesService,
  ListConversationThreadsService,
  SendMessageService,
  UpdateConversationStatusService,
} from '../../../Crm.Application/src/services';
import { AppRole } from '../../../Crm.Domain/enums/AppRole';
import { MessageSenderType } from '../../../Crm.Domain/enums/MessageSenderType';
import { ConversationMessageRepository } from '../../../Crm.Infrastructure/src/repositories/ConversationMessageRepository';
import { ConversationThreadRepository } from '../../../Crm.Infrastructure/src/repositories/ConversationThreadRepository';
import { ProfileRepository } from '../../../Crm.Infrastructure/src/repositories/ProfileRepository';
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
 * POST /api/conversations/:threadId/messages
 */
conversations.post('/:threadId/messages', async (c) => {
  // --- Block 1: Auth context + thread id from URL ---
  const supabase = c.get('supabase');
  const userId = c.get('userId');
  const threadId = c.req.param('threadId');

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

  // --- Block 3: Required-field type guard (message) ---
  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as { message?: unknown }).message !== 'string'
  ) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'message is required',
    });
  }

  // --- Block 4: Normalize (trim) and reject empty message ---
  const input: SendMessageInput = {
    message: (body as { message: string }).message.trim(),
  };

  if (!input.message) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'message is required',
    });
  }

  // --- Block 5: Thread must exist and be visible (RLS via getById) ---
  const thread = await new GetConversationThreadByIdService(
    new ConversationThreadRepository(supabase),
  ).execute(threadId);

  if (!thread) {
    throw new ApiError({
      code: 'NOT_FOUND',
      status: HttpStatus.NotFound,
      message: 'Conversation thread not found',
    });
  }

  // --- Block 6: Resolve senderType from profile role (client vs team) ---
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

  // --- Block 7: Api → Application → Infrastructure (new message on thread) ---
  const message = await new SendMessageService(new ConversationMessageRepository(supabase)).execute(
    threadId,
    input,
    userId,
    senderType,
  );

  // --- Block 8: Map domain message → API JSON; 201 Created ---
  return c.json(
    {
      id: message.id,
      threadId: message.threadId,
      senderId: message.senderId,
      senderType: message.senderType,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    },
    HttpStatus.Created,
  );
});

/**
 * GET /api/conversations/:threadId/messages
 */
conversations.get('/:threadId/messages', async (c) => {
  const threadId = c.req.param('threadId');
  const supabase = c.get('supabase');

  const thread = await new GetConversationThreadByIdService(
    new ConversationThreadRepository(supabase),
  ).execute(threadId);

  if (!thread) {
    throw new ApiError({
      code: 'NOT_FOUND',
      status: HttpStatus.NotFound,
      message: 'Conversation thread not found',
    });
  }

  const items = await new ListConversationMessagesService(
    new ConversationMessageRepository(supabase),
  ).execute(threadId);

  return c.json(
    items.map((message) => ({
      id: message.id,
      threadId: message.threadId,
      senderId: message.senderId,
      senderType: message.senderType,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    })),
  );
});

/**
 * PATCH /api/conversations/:threadId/assign
 */
conversations.patch('/:threadId/assign', async (c) => {
  const supabase = c.get('supabase');
  const userId = c.get('userId');
  const threadId = c.req.param('threadId');

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

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as { assignedTo?: unknown }).assignedTo !== 'string'
  ) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'assignedTo is required',
    });
  }

  const input: AssignConversationInput = {
    assignedTo: (body as { assignedTo: string }).assignedTo.trim(),
  };

  if (!input.assignedTo) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'assignedTo is required',
    });
  }

  const profile = await new GetMeService(new ProfileRepository(supabase)).execute(userId);
  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  try {
    const thread = await new AssignConversationService(
      new ConversationThreadRepository(supabase),
      new ProfileRepository(supabase),
    ).execute(threadId, input, profile);

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
  } catch (err) {
    if (err instanceof AssignConversationError) {
      throw mapAssignConversationError(err);
    }
    throw err;
  }
});

/**
 * PATCH /api/conversations/:threadId/status
 */
conversations.patch('/:threadId/status', async (c) => {
  const supabase = c.get('supabase');
  const userId = c.get('userId');
  const threadId = c.req.param('threadId');

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

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as { status?: unknown }).status !== 'string'
  ) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'status is required',
    });
  }

  const input: UpdateConversationStatusInput = {
    status: (body as { status: string }).status.trim() as UpdateConversationStatusInput['status'],
  };

  if (!input.status) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'status is required',
    });
  }

  const profile = await new GetMeService(new ProfileRepository(supabase)).execute(userId);
  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  try {
    const thread = await new UpdateConversationStatusService(
      new ConversationThreadRepository(supabase),
    ).execute(threadId, input, profile);

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
  } catch (err) {
    if (err instanceof UpdateConversationStatusError) {
      throw mapUpdateConversationStatusError(err);
    }
    throw err;
  }
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
