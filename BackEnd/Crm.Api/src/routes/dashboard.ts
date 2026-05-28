import { Hono } from 'hono';
import { GetDashboardService, GetMeService } from '../../../Crm.Application/src/services';
import { AppRole } from '../../../Crm.Domain/enums/AppRole';
import { ConversationThreadRepository } from '../../../Crm.Infrastructure/src/repositories/ConversationThreadRepository';
import { DashboardActivityRepository } from '../../../Crm.Infrastructure/src/repositories/DashboardActivityRepository';
import { DealRepository } from '../../../Crm.Infrastructure/src/repositories/DealRepository';
import { ProfileRepository } from '../../../Crm.Infrastructure/src/repositories/ProfileRepository';
import { ApiError } from '../errors/ApiError';
import { HttpStatus } from '../http/HttpStatus';
import { toDashboardResponse } from '../mappers/dashboardResponseMapper';
import type { Env } from '../types/env';

/**
 * Dashboard routes under /api/dashboard (see app.ts mount).
 * Manager/sales aggregates; clients are not allowed.
 */
const dashboard = new Hono<Env>();

function createDashboardDeps(supabase: Env['Variables']['supabase']) {
  const conversationThreadRepository = new ConversationThreadRepository(supabase);
  const dealRepository = new DealRepository(supabase);
  const dashboardActivityRepository = new DashboardActivityRepository(supabase);
  const profileRepository = new ProfileRepository(supabase);

  return {
    getDashboardService: new GetDashboardService(
      conversationThreadRepository,
      dealRepository,
      dashboardActivityRepository,
    ),
    getMeService: new GetMeService(profileRepository),
  };
}

/**
 * GET /api/dashboard
 */
dashboard.get('/', async (c) => {
  const supabase = c.get('supabase');
  const userId = c.get('userId');
  const deps = createDashboardDeps(supabase);

  const profile = await deps.getMeService.execute(userId);
  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  if (profile.role === AppRole.Client) {
    throw new ApiError({
      code: 'FORBIDDEN',
      status: HttpStatus.Forbidden,
      message: 'Dashboard is not available for client profiles',
    });
  }

  const summary = await deps.getDashboardService.execute();

  return c.json(toDashboardResponse(summary));
});

export { dashboard };
