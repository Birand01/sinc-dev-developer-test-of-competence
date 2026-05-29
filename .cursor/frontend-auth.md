# Frontend auth — development log

Living notes for Supabase session auth, route guards, and how this maps to the project spec. Update this file when auth-related frontend work changes.

---

## Scope (what frontend auth does today)

| Layer | Responsibility | Status |
|-------|----------------|--------|
| **Supabase Auth** | Login, session, JWT in browser | Done |
| **AuthContext** | Global session state (`isAuthenticated`, `isLoading`) | Done |
| **Route guards** | URL access by session (in / out) | Done |
| **GET /api/me** | `fullName`, `role` from `profiles` | Done (`getMe`, `useMe`, dashboard) |
| **Role-based UI** | Hide actions per role (UX only) | Not started |
| **Worker API** | Enforce role on every request | Backend (existing) |

Spec rule: *frontend hides unavailable actions; Worker must still reject unauthorized calls.* Route guards only answer **“is there a session?”**, not **“which role?”**.

---

## File map (`FrontEnd/src/features/auth/`)

```txt
features/auth/
  api/getMe.ts
  context/AuthContext.tsx
  hooks/useMe.ts
  lib/constants.ts
  lib/queryKeys.ts
  routes/ProtectedRoute.tsx
  routes/PublicOnlyRoute.tsx
  types/index.ts
```

| Path | Purpose |
|------|---------|
| `context/AuthContext.tsx` | `AuthProvider`, `useAuth()` — `getSession` + `onAuthStateChange` |
| `routes/ProtectedRoute.tsx` | CRM routes: no session → redirect to `/` |
| `routes/PublicOnlyRoute.tsx` | Public routes: session → redirect to `/dashboard` |
| `lib/constants.ts` | `AUTHENTICATED_HOME` (`/dashboard`) |
| `types/index.ts` | `MeResponse`, `AppRole` — Worker JSON contract |
| `api/getMe.ts` | `apiFetch('/api/me')` |
| `lib/queryKeys.ts` | `authQueryKeys.me` for React Query cache |
| `hooks/useMe.ts` | `useQuery` wrapper; `enabled` when session ready |

Related:

| File | Change |
|------|--------|
| `main.tsx` | Wraps app with `AuthProvider` (inside `BrowserRouter`) |
| `app/router.tsx` | Wires guards on `/`, `/login`, `/dashboard` |
| `components/homepage/LoginForm.tsx` | After sign-in → `AUTHENTICATED_HOME` |
| `components/layout/AppLayout.tsx` | App shell: brand, search placeholder, user menu, nav, `<Outlet />` |
| `app/pages/dashboard/DashboardPage.tsx` | Dashboard content only (shell handles profile) |

---

## Provider order (`main.tsx`)

```
QueryClientProvider
  → BrowserRouter
    → AuthProvider
      → App → AppRouter
```

Guards use `useNavigate` / `<Navigate>` → must be under `BrowserRouter`. Session must be above all routes → `AuthProvider` wraps `App`.

---

## Route behavior

| URL | Guest (no session) | Authenticated |
|-----|-------------------|---------------|
| `/` | `HomePage` (login panel) | → `/dashboard` |
| `/login` | Redirect to `/` (alias) | → `/dashboard` |
| `/dashboard` | → `/` | `DashboardPage` |

### Flow diagram

```
Sign in (LoginForm)
  → Supabase session created
  → AuthContext updates
  → navigate(AUTHENTICATED_HOME)
  → PublicOnlyRoute would also send authenticated users away from /

Sign out (DashboardPage)
  → signOut()
  → session null
  → ProtectedRoute on /dashboard → /
```

Both guards wait on `isLoading` before redirecting (avoids flash on page refresh while `getSession` runs).

---

## AuthContext details

- **Stores:** `session`, `user` (Supabase Auth user: id, email, metadata).
- **Does not store:** `profiles.role`, `fullName` (CRM profile — later via Worker `GET /api/me`).
- **`isAuthenticated`:** `session !== null` (Supabase logged in, any role).
- **Token storage:** Supabase client `persistSession: true` → default `localStorage` (`lib/supabase.ts`). Normal for Vite SPA + Supabase; security-sensitive operations stay on Worker.

---

## Test users

See [SEED.md](./SEED.md). Example:

- `manager@studentcrm.test` / `Demo123!`
- `sales@studentcrm.test` / `Demo123!`
- `client@studentcrm.test` / `Demo123!`

Manual checklist:

1. Guest opens `/dashboard` → lands on `/`
2. Sign in → `/dashboard` with email shown
3. Guest opens `/` while logged in → `/dashboard`
4. Sign out → `/`; `/dashboard` blocked again

### Local dev: CORS

Frontend (`http://localhost:5173`) → Worker (`http://127.0.0.1:8787`) is cross-origin. `Crm.Api` `app.ts` enables `hono/cors` for Vite dev origins. Restart Worker after changing CORS. Both must run: `BackEnd/Crm.Api` `npm run dev` + `FrontEnd` `npm run dev`.

---

## Commit reference

```
feat(frontend): add Supabase session auth and route guards
```

---

## Next steps (planned)

1. **Role-based UI** — e.g. hide “Create deal” for `client`; never rely on UI alone for security.
2. **Layouts** — `components/layout/` for authenticated shell (nav, sidebar).
3. **Optional:** `RequireRole` route wrapper for manager-only pages (still redundant with Worker checks).

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-28 | Initial doc: `AuthContext`, `ProtectedRoute`, `PublicOnlyRoute`, `constants`, router, `DashboardPage` placeholder, login redirect |
| 2026-05-28 | `types.ts`, `getMe`, `useMe`, `queryKeys`; dashboard shows `fullName` + `role` from Worker |
| 2026-05-28 | `AppLayout` + nested routes; placeholders for clients, conversations, pipeline |
