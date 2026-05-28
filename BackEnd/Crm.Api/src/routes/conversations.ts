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
import {
  toConversationMessageResponse,
  toConversationThreadResponse,
} from '../mappers/conversationResponseMapper';
import type { Env } from '../types/env';
import {
  assignConversationBodySchema,
  createConversationBodySchema,
  sendConversationMessageBodySchema,
  updateConversationStatusBodySchema,
} from '../validation/conversationsSchemas';
import { parseBodyOrThrow } from '../validation/parseHelpers';

/**
 * Conversation routes under /api/conversations (see app.ts mount).
 * Handlers delegate to Application services — no Supabase calls here.
 */
const conversations = new Hono<Env>();

// Request-scoped dependency factory for conversations routes (shared service/repository wiring).
function createConversationDeps(supabase: Env['Variables']['supabase']) {
  const threadRepository = new ConversationThreadRepository(supabase);
  const messageRepository = new ConversationMessageRepository(supabase);
  const profileRepository = new ProfileRepository(supabase);

  return {
    listConversationThreadsService: new ListConversationThreadsService(threadRepository),
    createConversationService: new CreateConversationService(threadRepository, messageRepository),
    getConversationThreadByIdService: new GetConversationThreadByIdService(threadRepository),
    getMeService: new GetMeService(profileRepository),
    sendMessageService: new SendMessageService(messageRepository),
    listConversationMessagesService: new ListConversationMessagesService(messageRepository),
    assignConversationService: new AssignConversationService(
      threadRepository,
      profileRepository,
    ),
    updateConversationStatusService: new UpdateConversationStatusService(threadRepository),
  };
}

/**
 * GET /api/conversations
 */
conversations.get('/', async (c) => {
  const supabase = c.get('supabase');
  const deps = createConversationDeps(supabase);

  const items = await deps.listConversationThreadsService.execute();

  return c.json(items.map(toConversationThreadResponse));
});

/**
 * POST /api/conversations
 */
conversations.post('/', async (c) => {
  // --- Block 1: Auth context (set by middleware; not from request body) ---
  const supabase = c.get('supabase');
  const deps = createConversationDeps(supabase);
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

  const input: CreateConversationInput = parseBodyOrThrow(
    createConversationBodySchema,
    body,
  );

  // --- Block 5: Resolve senderType from profile role (client vs team) ---
  const profile = await deps.getMeService.execute(userId);
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
  const thread = await deps.createConversationService.execute(input, userId, senderType);

  // --- Block 7: Map domain thread → API JSON; 201 Created ---
  return c.json(toConversationThreadResponse(thread), HttpStatus.Created);
});

/**
 * POST /api/conversations/:threadId/messages
 */
conversations.post('/:threadId/messages', async (c) => {
  // --- Block 1: Auth context + thread id from URL ---
  const supabase = c.get('supabase');
  const deps = createConversationDeps(supabase);
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

  const input: SendMessageInput = parseBodyOrThrow(
    sendConversationMessageBodySchema,
    body,
  );

  // --- Block 5: Thread must exist and be visible (RLS via getById) ---
  const thread = await deps.getConversationThreadByIdService.execute(threadId);

  if (!thread) {
    throw new ApiError({
      code: 'NOT_FOUND',
      status: HttpStatus.NotFound,
      message: 'Conversation thread not found',
    });
  }

  // --- Block 6: Resolve senderType from profile role (client vs team) ---
  const profile = await deps.getMeService.execute(userId);
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
  const message = await deps.sendMessageService.execute(threadId, input, userId, senderType);

  // --- Block 8: Map domain message → API JSON; 201 Created ---
  return c.json(toConversationMessageResponse(message), HttpStatus.Created);
});

/**
 * GET /api/conversations/:threadId/messages
 */
conversations.get('/:threadId/messages', async (c) => {
  const threadId = c.req.param('threadId');
  const supabase = c.get('supabase');
  const deps = createConversationDeps(supabase);

  const thread = await deps.getConversationThreadByIdService.execute(threadId);

  if (!thread) {
    throw new ApiError({
      code: 'NOT_FOUND',
      status: HttpStatus.NotFound,
      message: 'Conversation thread not found',
    });
  }

  const items = await deps.listConversationMessagesService.execute(threadId);

  return c.json(items.map(toConversationMessageResponse));
});

/**
 * PATCH /api/conversations/:threadId/assign
 */
conversations.patch('/:threadId/assign', async (c) => {
  const supabase = c.get('supabase');
  const deps = createConversationDeps(supabase);
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

  const input: AssignConversationInput = parseBodyOrThrow(
    assignConversationBodySchema,
    body,
  );

  const profile = await deps.getMeService.execute(userId);
  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  try {
    const thread = await deps.assignConversationService.execute(threadId, input, profile);

    return c.json(toConversationThreadResponse(thread));
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
  const deps = createConversationDeps(supabase);
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

  const input: UpdateConversationStatusInput = parseBodyOrThrow(
    updateConversationStatusBodySchema,
    body,
  ) as UpdateConversationStatusInput;

  const profile = await deps.getMeService.execute(userId);
  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  try {
    const thread = await deps.updateConversationStatusService.execute(threadId, input, profile);

    return c.json(toConversationThreadResponse(thread));
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
  const deps = createConversationDeps(supabase);

  const thread = await deps.getConversationThreadByIdService.execute(threadId);

  if (!thread) {
    throw new ApiError({
      code: 'NOT_FOUND',
      status: HttpStatus.NotFound,
      message: 'Conversation thread not found',
    });
  }

  return c.json(toConversationThreadResponse(thread));
});

export { conversations };
