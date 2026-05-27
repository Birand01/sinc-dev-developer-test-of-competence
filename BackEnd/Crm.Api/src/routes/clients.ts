import { Hono } from 'hono';
import type { CreateClientInput } from '../../../Crm.Application/src/interfaces/repositories/IClientRepository';
import { CreateClientService } from '../../../Crm.Application/src/services/CreateClientService';
import { GetClientByIdService } from '../../../Crm.Application/src/services/GetClientByIdService';
import { ListClientsService } from '../../../Crm.Application/src/services/ListClientsService';
import { ClientRepository } from '../../../Crm.Infrastructure/src/repositories/ClientRepository';
import { ApiError } from '../errors/ApiError';
import { HttpStatus } from '../http/HttpStatus';
import type { Env } from '../types/env';

/**
 * Client routes under /api/clients (see app.ts mount).
 * Handlers delegate to Application services — no Supabase calls here.
 */
const clients = new Hono<Env>();

/**
 * GET /api/clients?q=&ownerId=
 */
clients.get('/', async (c) => {
  const supabase = c.get('supabase');
  const q = c.req.query('q');
  const ownerId = c.req.query('ownerId');

  const filters =
    q || ownerId
      ? {
          ...(q ? { q } : {}),
          ...(ownerId ? { ownerId } : {}),
        }
      : undefined;

  const listClients = new ListClientsService(new ClientRepository(supabase));
  const items = await listClients.execute(filters);

  return c.json(
    items.map((client) => ({
      id: client.id,
      profileId: client.profileId,
      fullName: client.fullName,
      email: client.email,
      phone: client.phone,
      country: client.country,
      targetCountry: client.targetCountry,
      createdBy: client.createdBy,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    })),
  );
});

/**
 * POST /api/clients
 */
clients.post('/', async (c) => {
  // Values set by auth middleware after JWT verification.
  const supabase = c.get('supabase');
  const userId = c.get('userId');

  // Parse JSON body safely; malformed JSON should return 400, not crash.
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

  // Basic required-field/type guard before casting.
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

  // Normalize strings and keep optional fields only when provided.
  const input: CreateClientInput = {
    fullName: raw.fullName.trim(),
    email: raw.email.trim(),
    ...(raw.phone !== undefined ? { phone: raw.phone } : {}),
    ...(raw.country !== undefined ? { country: raw.country } : {}),
    ...(raw.targetCountry !== undefined ? { targetCountry: raw.targetCountry } : {}),
  };

  // Catch empty strings after trim.
  if (!input.fullName || !input.email) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'fullName and email are required',
    });
  }

  // Api -> Application -> Infrastructure flow.
  // createdBy comes from authenticated user id, not from request body.
  const createClient = new CreateClientService(new ClientRepository(supabase));
  const client = await createClient.execute(input, userId);

  // Return API-friendly shape and 201 Created.
  return c.json(
    {
      id: client.id,
      profileId: client.profileId,
      fullName: client.fullName,
      email: client.email,
      phone: client.phone,
      country: client.country,
      targetCountry: client.targetCountry,
      createdBy: client.createdBy,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    },
    HttpStatus.Created,
  );
});

/**
 * GET /api/clients/:clientId
 * Step 4b: read route param + RLS-scoped Supabase client from auth middleware.
 * Step 4c: wire Application service + repository.
 * Step 4d: HTTP status + JSON mapping (domain → API contract).
 */
clients.get('/:clientId', async (c) => {
  const clientId = c.req.param('clientId');
  const supabase = c.get('supabase');

  const getClientById = new GetClientByIdService(new ClientRepository(supabase));
  const client = await getClientById.execute(clientId);

  if (!client) {
    throw new ApiError({
      code: 'NOT_FOUND_CLIENT',
      status: HttpStatus.NotFound,
      message: 'Client not found',
    });
  }

  return c.json({
    id: client.id,
    profileId: client.profileId,
    fullName: client.fullName,
    email: client.email,
    phone: client.phone,
    country: client.country,
    targetCountry: client.targetCountry,
    createdBy: client.createdBy,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  });
});

export { clients };
