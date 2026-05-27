import { Hono } from 'hono';
import { GetMeService } from '../../../Crm.Application/src/services/GetMeService';
import { ProfileRepository } from '../../../Crm.Infrastructure/src/repositories/ProfileRepository';
import { ApiError } from '../errors/ApiError';
import { HttpStatus } from '../http/HttpStatus';
import type { Env } from '../types/env';

/**
 * User/profile routes under /api (see app.ts mount).
 * Handlers delegate to Application services — no Supabase calls here.
 */
const users = new Hono<Env>();

/**
 * GET /api/me — "who am I?" for the logged-in user.
 *
 * Requires auth middleware (JWT). Returns profile from profiles table.
 * 401 = no/invalid token (auth middleware)
 * 404 = token valid but no profile row (or RLS blocked)
 * 200 = { id, fullName, role, createdAt }
 */
users.get('/me', async (c) => {
  const userId = c.get('userId');
  const supabase = c.get('supabase');

  const getMeService = new GetMeService(new ProfileRepository(supabase));
  const profile = await getMeService.execute(userId);

  if (!profile) {
    throw new ApiError({
      code: 'NOT_FOUND_PROFILE',
      status: HttpStatus.NotFound,
      message: 'Profile not found',
    });
  }

  // Map domain Profile → JSON (Date → ISO string for HTTP)
  return c.json({
    id: profile.id,
    fullName: profile.fullName,
    role: profile.role,
    createdAt: profile.createdAt.toISOString(),
  });
});

export { users };
