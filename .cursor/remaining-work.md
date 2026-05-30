# Remaining Work

Gaps after client portal (P-1–P-4), staff conversations inbox, and New Client UI.  
Core API and main staff/client chat flows are done; items below are polish, onboarding, or bonus scope.

---

## Public / onboarding

- **Client Sign Up** — `FrontEnd/src/components/homepage/ClientSignUpForm.tsx` is still TODO (`supabase.auth.signUp` + `profiles` + `clients.profile_id`).
- **Signup backend / RLS** — `clients_insert_staff` blocks self-registration; needs Worker endpoint, new RLS policy, or Auth trigger.
- **Lead ↔ account linking** — Staff-created leads (`profile_id` null) are not merged when the same email signs up later.

---

## Staff polish

- **Conversation status UI** — `PATCH /api/conversations/:threadId/status` (open / pending / closed); no frontend hook or UI.
- ~~**Client detail → inbox link** — `ClientConversationsCard` rows are not clickable / do not open `/conversations`.~~ Done: link + `ConversationsPage` reads `location.state.threadId`.
- **Deep URL for conversations** — No `/conversations/:threadId`; selection lives in component state only.
- **Global search** — AppLayout search input is disabled (`Search (coming soon)`).
- **Pipeline card owner name** — `PipelineDealCard` shows title/intake/value only, not owner.
- **Edit client** — No UI to update CRM client fields (backend update rules exist for staff).

---

## Client portal (P-5+)

- **My Applications** — Read-only deal stage view; no second client route/tab yet.
- ~~**Portal message labels** — Transcript still uses "Client / Sales"; not "You / Advisor".~~ Done: client portal uses You/Advisor via `senderLabelVariant="portal"`.
- ~~**Portal branding** — AppLayout title still "SINC Sales CRM" for client role.~~ Done: client sees "Student Portal".

---

## Technical / bonus

- **Supabase Realtime** — No live updates for messages, threads, or deals (case study mentions channels).
- **Loading skeletons** — Most screens use text-only loading states.
- **Tests / CI** — Coverage unclear or missing.
- **`GET /api/me` + `clientId`** — Portal uses `useClients()` to resolve `clientId`; optional API improvement.

---

## Reference

- Wireframes: [frontend-ui-wireframes.md](./frontend-ui-wireframes.md)
- API: [api-endpoints-guide.md](./api-endpoints-guide.md)
- Incremental SQL: [SEED.md](./SEED.md) (migrations 004, 005)
