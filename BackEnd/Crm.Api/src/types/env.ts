/**
 * Worker environment types — maps .dev.vars / Wrangler secrets to TypeScript.
 * Used as Hono generic: new Hono<Env>() for typed c.env access.
 */
export type Env = {
  Bindings: {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
  };
};
