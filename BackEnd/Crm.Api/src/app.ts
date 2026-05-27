/**
 * Hono application — HTTP pipeline and route registration.
 *
 * Public:  GET /health
 * Protected (auth required): GET /api/me, GET /api/clients/:clientId, …
 */
import { Hono } from 'hono';
import { ApiError } from './errors/ApiError';
import { HttpStatus } from './http/HttpStatus';
import { auth } from './middleware/auth';
import { clients } from './routes/clients';
import { users } from './routes/users';
import type { Env } from './types/env';

const app = new Hono<Env>();

// Central error handling: keep routes free of repeated status/JSON boilerplate.
app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(
      {
        code: err.code,
        error: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
      { status: err.status as any },
    );
  }

  // Unknown/unhandled error: don't leak internals.
  return c.json(
    { code: 'INTERNAL_SERVER_ERROR', error: 'Internal Server Error' },
    HttpStatus.InternalServerError,
  );
});

// No auth — liveness check for deploy/local dev
app.get('/health', (c) => c.json({ status: 'ok' }));

// All /api/* routes share auth middleware
const api = new Hono<Env>();
api.use('*', auth);
api.route('/', users); // GET /me → full path /api/me
api.route('/clients', clients); // GET /:clientId → /api/clients/:clientId

app.route('/api', api);

export { app };
