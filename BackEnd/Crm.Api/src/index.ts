/**
 * Cloudflare Worker entry point (like Program.cs in .NET).
 * Wrangler runs this file; it only re-exports the Hono app from app.ts.
 * Keep this file thin — no routes or business logic here.
 */
import { app } from './app';

export default app;
