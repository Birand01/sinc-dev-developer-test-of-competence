import { Hono } from 'hono';
import { CreateDealError } from '../../../Crm.Application/src/errors';
import type { CreateDealInput } from '../../../Crm.Application/src/services/deals/CreateDealService';
import {
  CreateDealService,
  GetDealByIdService,
  GetMeService,
} from '../../../Crm.Application/src/services';
import { ApiError, mapCreateDealError } from '../errors';
import { HttpStatus } from '../http/HttpStatus';
import { ClientRepository } from '../../../Crm.Infrastructure/src/repositories/ClientRepository';
import { DealRepository } from '../../../Crm.Infrastructure/src/repositories/DealRepository';
import { ProfileRepository } from '../../../Crm.Infrastructure/src/repositories/ProfileRepository';
import type { Env } from '../types/env';

const deals = new Hono<Env>();

/**
 * GET /api/deals/:dealId
 */
deals.get('/:dealId', async (c) => {
  const dealId = c.req.param('dealId');
  const supabase = c.get('supabase');

  const deal = await new GetDealByIdService(new DealRepository(supabase)).execute(dealId);
  if (!deal) {
    throw new ApiError({
      code: 'NOT_FOUND',
      status: HttpStatus.NotFound,
      message: 'Deal not found',
    });
  }

  return c.json({
    id: deal.id,
    clientId: deal.clientId,
    ownerId: deal.ownerId,
    title: deal.title,
    stage: deal.stage,
    valueAmount: deal.valueAmount,
    valueCurrency: deal.valueCurrency,
    expectedIntake: deal.expectedIntake,
    lostReason: deal.lostReason,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
  });
});

/**
 * POST /api/deals
 */
deals.post('/', async (c) => {
  const supabase = c.get('supabase');
  const userId = c.get('userId');

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
    typeof (body as { clientId?: unknown }).clientId !== 'string' ||
    typeof (body as { title?: unknown }).title !== 'string'
  ) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'clientId and title are required',
    });
  }

  const raw = body as {
    clientId: string;
    title: string;
    ownerId?: unknown;
    expectedIntake?: unknown;
    valueAmount?: unknown;
    valueCurrency?: unknown;
  };

  if (
    (raw.ownerId !== undefined && raw.ownerId !== null && typeof raw.ownerId !== 'string') ||
    (raw.expectedIntake !== undefined &&
      raw.expectedIntake !== null &&
      typeof raw.expectedIntake !== 'string') ||
    (raw.valueCurrency !== undefined &&
      raw.valueCurrency !== null &&
      typeof raw.valueCurrency !== 'string') ||
    (raw.valueAmount !== undefined &&
      raw.valueAmount !== null &&
      typeof raw.valueAmount !== 'number')
  ) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message:
        'ownerId, expectedIntake, valueAmount, and valueCurrency must be valid nullable fields',
    });
  }

  const input: CreateDealInput = {
    clientId: raw.clientId.trim(),
    title: raw.title.trim(),
    ownerId: typeof raw.ownerId === 'string' ? raw.ownerId.trim() : null,
    expectedIntake:
      typeof raw.expectedIntake === 'string' ? raw.expectedIntake.trim() : null,
    valueAmount: typeof raw.valueAmount === 'number' ? raw.valueAmount : null,
    valueCurrency:
      typeof raw.valueCurrency === 'string' ? raw.valueCurrency.trim() : null,
  };

  if (!input.clientId || !input.title) {
    throw new ApiError({
      code: 'VALIDATION_FAILED',
      status: HttpStatus.BadRequest,
      message: 'clientId and title are required',
    });
  }

  if (input.ownerId === '') input.ownerId = null;
  if (input.expectedIntake === '') input.expectedIntake = null;
  if (input.valueCurrency === '') input.valueCurrency = null;

  const profile = await new GetMeService(new ProfileRepository(supabase)).execute(userId);
  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  try {
    const deal = await new CreateDealService(
      new DealRepository(supabase),
      new ClientRepository(supabase),
      new ProfileRepository(supabase),
    ).execute(input, profile);

    return c.json(
      {
        id: deal.id,
        clientId: deal.clientId,
        ownerId: deal.ownerId,
        title: deal.title,
        stage: deal.stage,
        valueAmount: deal.valueAmount,
        valueCurrency: deal.valueCurrency,
        expectedIntake: deal.expectedIntake,
        lostReason: deal.lostReason,
        createdAt: deal.createdAt.toISOString(),
        updatedAt: deal.updatedAt.toISOString(),
      },
      HttpStatus.Created,
    );
  } catch (err) {
    if (err instanceof CreateDealError) {
      // Keep HTTP mapping centralized in Crm.Api/errors.
      throw mapCreateDealError(err);
    }
    throw err;
  }
});

export { deals };
