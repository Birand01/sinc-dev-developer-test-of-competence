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

## Demo login (for README)

- Manager: `manager@studentcrm.test` / `Demo123!`
- Sales: `sales@studentcrm.test` / `Demo123!`
- Client: `client@studentcrm.test` / `Demo123!`
