/**
 * Hono application — HTTP pipeline and route registration.
 *
 * Public:  GET /health
 * Protected (auth required): GET /api/me, future /api/* routes
 */
import { Hono } from 'hono';
import { auth } from './middleware/auth';
import { users } from './routes/users';
import type { Env } from './types/env';

const app = new Hono<Env>();

// No auth — liveness check for deploy/local dev
app.get('/health', (c) => c.json({ status: 'ok' }));

// All /api/* routes share auth middleware
const api = new Hono<Env>();
api.use('*', auth);
api.route('/', users); // GET /me → full path /api/me

app.route('/api', api);

export { app };
