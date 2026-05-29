import { Hono } from 'hono';
import type { CreateClientInput } from '../../../Crm.Application/src/interfaces/repositories/IClientRepository';
import {
  CreateClientService,
  GetClientDetailService,
  ListClientsService,
} from '../../../Crm.Application/src/services';
import { ClientRepository } from '../../../Crm.Infrastructure/src/repositories/ClientRepository';
import { ConversationThreadRepository } from '../../../Crm.Infrastructure/src/repositories/ConversationThreadRepository';
import { DashboardActivityRepository } from '../../../Crm.Infrastructure/src/repositories/DashboardActivityRepository';
import { DealRepository } from '../../../Crm.Infrastructure/src/repositories/DealRepository';
import { ApiError } from '../errors/ApiError';
import { HttpStatus } from '../http/HttpStatus';
import { toClientDetailResponse, toClientResponse } from '../mappers/clientResponseMapper';
import type { Env } from '../types/env';
import { createClientBodySchema } from '../validation/clientsSchemas';
import { clientIdParamSchema } from '../validation/pathSchemas';
import { parseBodyOrThrow, parseParamsOrThrow } from '../validation/parseHelpers';

/**
 * Client routes under /api/clients (see app.ts mount).
 * Handlers delegate to Application services — no Supabase calls here.
 */
const clients = new Hono<Env>();

function createClientDeps(supabase: Env['Variables']['supabase']) {
  const clientRepository = new ClientRepository(supabase);
  const conversationThreadRepository = new ConversationThreadRepository(supabase);
  const dealRepository = new DealRepository(supabase);
  const dashboardActivityRepository = new DashboardActivityRepository(supabase);

  return {
    listClientsService: new ListClientsService(clientRepository),
    createClientService: new CreateClientService(clientRepository),
    getClientDetailService: new GetClientDetailService(
      clientRepository,
      conversationThreadRepository,
      dealRepository,
      dashboardActivityRepository,
    ),
  };
}

/**
 * GET /api/clients?q=&ownerId=
 */
clients.get('/', async (c) => {
  const supabase = c.get('supabase');
  const deps = createClientDeps(supabase);

  const q = c.req.query('q');
  const ownerId = c.req.query('ownerId');

  const filters =
    q || ownerId
      ? {
          ...(q ? { q } : {}),
          ...(ownerId ? { ownerId } : {}),
        }
      : undefined;

  const items = await deps.listClientsService.execute(filters);

  return c.json(items.map(toClientResponse));
});

/**
 * POST /api/clients
 */
clients.post('/', async (c) => {
  const supabase = c.get('supabase');
  const userId = c.get('userId');
  const deps = createClientDeps(supabase);

  let rawBody: unknown;
  try {
    rawBody = await c.req.json();
  } catch {
    throw new ApiError({
      code: 'INVALID_JSON',
      status: HttpStatus.BadRequest,
      message: 'Invalid JSON body',
    });
  }

  const parsed = parseBodyOrThrow(createClientBodySchema, rawBody);

  const input: CreateClientInput = {
    fullName: parsed.fullName,
    email: parsed.email,
    ...(parsed.phone !== undefined ? { phone: parsed.phone } : {}),
    ...(parsed.country !== undefined ? { country: parsed.country } : {}),
    ...(parsed.targetCountry !== undefined ? { targetCountry: parsed.targetCountry } : {}),
  };

  const client = await deps.createClientService.execute(input, userId);

  return c.json(toClientResponse(client), HttpStatus.Created);
});

/**
 * GET /api/clients/:clientId
 */
clients.get('/:clientId', async (c) => {
  const { clientId } = parseParamsOrThrow(clientIdParamSchema, {
    clientId: c.req.param('clientId'),
  });
  const supabase = c.get('supabase');
  const deps = createClientDeps(supabase);

  const detail = await deps.getClientDetailService.execute(clientId);

  if (!detail) {
    throw new ApiError({
      code: 'NOT_FOUND_CLIENT',
      status: HttpStatus.NotFound,
      message: 'Client not found',
    });
  }

  return c.json(toClientDetailResponse(detail));
});

export { clients };
