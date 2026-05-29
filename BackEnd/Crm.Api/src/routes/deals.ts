import { Hono } from 'hono';
import {
  CreateDealNoteError,
  CreateDealError,
  UpdateDealOwnerError,
  UpdateDealStageError,
} from '../../../Crm.Application/src/errors';
import type { CreateDealNoteInput } from '../../../Crm.Application/src/services/deals/CreateDealNoteService';
import type { CreateDealInput } from '../../../Crm.Application/src/services/deals/CreateDealService';
import type { UpdateDealOwnerInput } from '../../../Crm.Application/src/services/deals/UpdateDealOwnerService';
import type { UpdateDealStageInput } from '../../../Crm.Application/src/services/deals/UpdateDealStageService';
import {
  CreateDealNoteService,
  CreateDealService,
  GetDealDetailService,
  GetMeService,
  ListDealsService,
  UpdateDealOwnerService,
  UpdateDealStageService,
} from '../../../Crm.Application/src/services';
import type { DealListFilters } from '../../../Crm.Application/src/interfaces/repositories/IDealRepository';
import {
  ApiError,
  mapCreateDealError,
  mapCreateDealNoteError,
  mapUpdateDealOwnerError,
  mapUpdateDealStageError,
} from '../errors';
import { HttpStatus } from '../http/HttpStatus';
import { ClientRepository } from '../../../Crm.Infrastructure/src/repositories/ClientRepository';
import { DealNoteRepository } from '../../../Crm.Infrastructure/src/repositories/DealNoteRepository';
import { DealStageHistoryRepository } from '../../../Crm.Infrastructure/src/repositories/DealStageHistoryRepository';
import { DealRepository } from '../../../Crm.Infrastructure/src/repositories/DealRepository';
import { ProfileRepository } from '../../../Crm.Infrastructure/src/repositories/ProfileRepository';
import {
  toDealDetailResponse,
  toDealNoteResponse,
  toDealResponse,
} from '../mappers/dealResponseMapper';
import type { Env } from '../types/env';
import {
  createDealNoteBodySchema,
  createDealBodySchema,
  listDealsQuerySchema,
  updateDealOwnerBodySchema,
  updateDealStageBodySchema,
} from '../validation/dealsSchemas';
import { dealIdParamSchema } from '../validation/pathSchemas';
import { parseBodyOrThrow, parseParamsOrThrow, parseQueryOrThrow } from '../validation/parseHelpers';

const deals = new Hono<Env>();

// Request-scoped dependency factory for deals routes (keeps endpoint wiring concise).
function createDealDeps(supabase: Env['Variables']['supabase']) {
  const dealRepository = new DealRepository(supabase);
  const dealNoteRepository = new DealNoteRepository(supabase);
  const dealStageHistoryRepository = new DealStageHistoryRepository(supabase);
  const profileRepository = new ProfileRepository(supabase);
  const clientRepository = new ClientRepository(supabase);

  return {
    listDealsService: new ListDealsService(dealRepository),
    getDealDetailService: new GetDealDetailService(
      dealRepository,
      clientRepository,
      dealNoteRepository,
      dealStageHistoryRepository,
    ),
    getMeService: new GetMeService(profileRepository),
    updateDealOwnerService: new UpdateDealOwnerService(dealRepository, profileRepository),
    updateDealStageService: new UpdateDealStageService(
      dealRepository,
      dealStageHistoryRepository,
    ),
    createDealNoteService: new CreateDealNoteService(
      dealRepository,
      dealNoteRepository,
    ),
    createDealService: new CreateDealService(
      dealRepository,
      clientRepository,
      profileRepository,
    ),
  };
}

/**
 * GET /api/deals
 */
deals.get('/', async (c) => {
  const supabase = c.get('supabase');
  const deps = createDealDeps(supabase);

  const query = parseQueryOrThrow(listDealsQuerySchema, {
    stage: c.req.query('stage'),
    ownerId: c.req.query('ownerId'),
    clientId: c.req.query('clientId'),
    q: c.req.query('q'),
  });
  const filters: DealListFilters = {
    stage: query.stage as DealListFilters['stage'],
    ownerId: query.ownerId ?? undefined,
    clientId: query.clientId ?? undefined,
    q: query.q ?? undefined,
  };

  const items = await deps.listDealsService.execute(filters);

  return c.json(items.map(toDealResponse));
});

/**
 * GET /api/deals/:dealId
 */
deals.get('/:dealId', async (c) => {
  const { dealId } = parseParamsOrThrow(dealIdParamSchema, {
    dealId: c.req.param('dealId'),
  });
  const supabase = c.get('supabase');
  const deps = createDealDeps(supabase);

  const detail = await deps.getDealDetailService.execute(dealId);
  if (!detail) {
    throw new ApiError({
      code: 'NOT_FOUND',
      status: HttpStatus.NotFound,
      message: 'Deal not found',
    });
  }

  return c.json(toDealDetailResponse(detail));
});

/**
 * POST /api/deals
 */
deals.post('/', async (c) => {
  const supabase = c.get('supabase');
  const deps = createDealDeps(supabase);
  const userId = c.get('userId');

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

  const input: CreateDealInput = parseBodyOrThrow(createDealBodySchema, rawBody);

  const profile = await deps.getMeService.execute(userId);
  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  try {
    const deal = await deps.createDealService.execute(input, profile);

    return c.json(toDealResponse(deal), HttpStatus.Created);
  } catch (err) {
    if (err instanceof CreateDealError) {
      // Keep HTTP mapping centralized in Crm.Api/errors.
      throw mapCreateDealError(err);
    }
    throw err;
  }
});

/**
 * PATCH /api/deals/:dealId/stage
 */
deals.patch('/:dealId/stage', async (c) => {
  const supabase = c.get('supabase');
  const deps = createDealDeps(supabase);
  const userId = c.get('userId');
  const { dealId } = parseParamsOrThrow(dealIdParamSchema, {
    dealId: c.req.param('dealId'),
  });

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

  const input = parseBodyOrThrow(
    updateDealStageBodySchema,
    rawBody,
  ) as UpdateDealStageInput;

  const profile = await deps.getMeService.execute(userId);
  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  try {
    const deal = await deps.updateDealStageService.execute(dealId, input, profile);
    return c.json(toDealResponse(deal));
  } catch (err) {
    if (err instanceof UpdateDealStageError) {
      throw mapUpdateDealStageError(err);
    }
    throw err;
  }
});

/**
 * PATCH /api/deals/:dealId/owner
 */
deals.patch('/:dealId/owner', async (c) => {
  const supabase = c.get('supabase');
  const deps = createDealDeps(supabase);
  const userId = c.get('userId');
  const { dealId } = parseParamsOrThrow(dealIdParamSchema, {
    dealId: c.req.param('dealId'),
  });

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

  const input = parseBodyOrThrow(
    updateDealOwnerBodySchema,
    rawBody,
  ) as UpdateDealOwnerInput;

  const profile = await deps.getMeService.execute(userId);
  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  try {
    const deal = await deps.updateDealOwnerService.execute(dealId, input, profile);
    return c.json(toDealResponse(deal));
  } catch (err) {
    if (err instanceof UpdateDealOwnerError) {
      throw mapUpdateDealOwnerError(err);
    }
    throw err;
  }
});

/**
 * POST /api/deals/:dealId/notes
 */
deals.post('/:dealId/notes', async (c) => {
  const supabase = c.get('supabase');
  const deps = createDealDeps(supabase);
  const userId = c.get('userId');
  const { dealId } = parseParamsOrThrow(dealIdParamSchema, {
    dealId: c.req.param('dealId'),
  });

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

  const input = parseBodyOrThrow(
    createDealNoteBodySchema,
    rawBody,
  ) as CreateDealNoteInput;

  const profile = await deps.getMeService.execute(userId);
  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  try {
    const note = await deps.createDealNoteService.execute(dealId, input, profile);
    return c.json(toDealNoteResponse(note), HttpStatus.Created);
  } catch (err) {
    if (err instanceof CreateDealNoteError) {
      throw mapCreateDealNoteError(err);
    }
    throw err;
  }
});

export { deals };
