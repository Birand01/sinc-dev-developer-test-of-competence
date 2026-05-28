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
    typeof (body as { fullName?: unknown }).fullName !== 'string' ||
    typeof (body as { email?: unknown }).email !== 'string'
  ) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'fullName and email are required',
    });
  }

  const raw = body as {
    fullName: string;
    email: string;
    phone?: string;
    country?: string;
    targetCountry?: string;
  };

  const input: CreateClientInput = {
    fullName: raw.fullName.trim(),
    email: raw.email.trim(),
    ...(raw.phone !== undefined ? { phone: raw.phone } : {}),
    ...(raw.country !== undefined ? { country: raw.country } : {}),
    ...(raw.targetCountry !== undefined ? { targetCountry: raw.targetCountry } : {}),
  };

  if (!input.fullName || !input.email) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'fullName and email are required',
    });
  }

  const client = await deps.createClientService.execute(input, userId);

  return c.json(toClientResponse(client), HttpStatus.Created);
});

/**
 * GET /api/clients/:clientId
 */
clients.get('/:clientId', async (c) => {
  const clientId = c.req.param('clientId');
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
