# Seed data (demo users)

## 1. Create Auth users (Supabase Dashboard)

**Authentication → Users → Add user** (email confirmed ON):

| Email | Password (example) | Role metadata (optional) |
|-------|----------------------|---------------------------|
| `manager@studentcrm.test` | `Demo123!` | — |
| `sales@studentcrm.test` | `Demo123!` | — |
| `client@studentcrm.test` | `Demo123!` | — |

## 2. Run SQL

**SQL Editor** → paste and run `supabase/migrations/003_seed.sql`

## 3. Verify

**Table Editor** → `profiles`, `clients`, `deals` should have rows.

## Incremental migrations (after initial setup)

If the repo adds SQL under `supabase/migrations/` after you already ran `001`–`003`, apply only the **new** files in order via **SQL Editor → New query → Run**.

| File | When to run |
|------|-------------|
| `004_deals_claim_rls.sql` | Sales deal claim (PATCH owner on unassigned deals) |
| `005_client_thread_insert.sql` | **Client portal New Chat** — client can POST `/api/conversations` |

### Run now (P-4 — client New Chat)

**Supabase Dashboard → SQL Editor → New query** — paste and run:

```sql
-- From supabase/migrations/005_client_thread_insert.sql
create policy threads_insert_client on public.conversation_threads
  for insert to authenticated
  with check (
    public.is_client()
    and client_id = public.current_client_id()
  );
```

**Verify:** as `client@studentcrm.test`, `POST /api/conversations` with your `clients.id` should return `201` (not RLS error). Frontend New Chat button is P-4b/c.

## Demo login (for README)

- Manager: `manager@studentcrm.test` / `Demo123!`
- Sales: `sales@studentcrm.test` / `Demo123!`
- Client: `client@studentcrm.test` / `Demo123!`
