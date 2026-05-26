/**
 * Hono application setup (HTTP pipeline and routes).
 * Register middleware and route modules here as you add them.
 */
import { Hono } from 'hono';

const app = new Hono();

// Liveness check — use this before wiring Supabase or /api routes
app.get('/health', (c) => c.json({ status: 'ok' }));

export { app };
