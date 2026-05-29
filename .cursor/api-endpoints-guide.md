# Student CRM API — All Implemented Endpoints (One Real Example)

This document describes **every HTTP endpoint that is actually registered and working** in `Crm.Api` today (`app.ts`). It uses **one continuous story** with real seed IDs and the flows we tested in PowerShell.

**Messages:** There is no standalone `/api/messages` router — chat lives under `/api/conversations/:threadId/messages`.

---

## Quick reference (implemented only)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | No | Liveness check |
| GET | `/api/me` | Yes | Current user profile + role |
| GET | `/api/clients` | Yes | List clients (optional `?q=&ownerId=`) |
| POST | `/api/clients` | Yes | Create a new lead/client record |
| GET | `/api/clients/:clientId` | Yes | Rich client detail (client + conversations + deals + recent activity) |
| GET | `/api/conversations` | Yes | List conversation threads (inbox) |
| POST | `/api/conversations` | Yes | New thread + first message |
| GET | `/api/conversations/:threadId` | Yes | Thread detail |
| GET | `/api/conversations/:threadId/messages` | Yes | Message history (oldest first) |
| POST | `/api/conversations/:threadId/messages` | Yes | Send a message on existing thread |
| PATCH | `/api/conversations/:threadId/assign` | Yes | Assign thread to a sales rep |
| PATCH | `/api/conversations/:threadId/status` | Yes | Update thread status (open/pending/closed) |
| GET | `/api/deals` | Yes | List deals (optional `?stage=&ownerId=&clientId=&q=`) |
| POST | `/api/deals` | Yes | Create a deal on a client |
| GET | `/api/deals/:dealId` | Yes | Rich deal detail (deal + client summary + notes + stage history) |
| PATCH | `/api/deals/:dealId/stage` | Yes | Move pipeline stage (writes `deal_stage_history` when stage changes) |
| PATCH | `/api/deals/:dealId/owner` | Yes | Reassign deal owner (manager only) |
| POST | `/api/deals/:dealId/notes` | Yes | Add an internal deal note |
| GET | `/api/dashboard` | Yes | Manager/sales KPIs + recent activity feed (`403` for client role) |

All `/api/*` routes require: `Authorization: Bearer <Supabase JWT>`.

---

## Cast (seed + test data)

| Role | Login | User / profile ID |
|------|--------|-------------------|
| Manager | `manager@studentcrm.test` | `3a9e21e7-1aec-49ee-bd92-959bba2fdff6` |
| Sales | `sales@studentcrm.test` | `8326ef2b-11cd-4096-8c01-44974b2520d7` |
| Client (Germany) | `client@studentcrm.test` | profile linked to client `a0000000-0000-4000-8000-000000000001` |
| Client (UK lead) | same or separate client user | client `a0000000-0000-4000-8000-000000000002` |

| Client record | ID | Notes |
|---------------|-----|--------|
| Germany applicant | `a0000000-0000-4000-8000-000000000001` | Has assigned conversation |
| UK lead | `a0000000-0000-4000-8000-000000000002` | Unassigned thread in seed; we **claimed** it in tests |

| Thread | ID | Subject | Seed assignee |
|--------|-----|---------|-----------------|
| Germany | `b0000000-0000-4000-8000-000000000001` | Germany study visa questions | Demo Sales |
| UK | `b0000000-0000-4000-8000-000000000002` | New lead — UK intake | `null` → claimed in test |

| Deal | ID | Client | Notes |
|------|-----|--------|--------|
| Germany intake | `d0000000-0000-4000-8000-000000000001` | `a000...001` | Seed pipeline; stage history + notes in tests |

---

## The story: Demo Sales handles a UK lead (full API journey)

```text
 0. Check API is up          GET  /health
 1. Who am I?                GET  /api/me
 2. Find the UK client       GET  /api/clients?q=...
 3. Open client record       GET  /api/clients/:clientId   (client + conversations + deals + activity)
 4. See all conversations    GET  /api/conversations
 5. Open UK thread           GET  /api/conversations/:threadId
 6. Read chat (if any)       GET  /api/conversations/:threadId/messages
 7. Claim the lead           PATCH /api/conversations/:threadId/assign
 8. Send follow-up          POST /api/conversations/:threadId/messages
 9. Close the case           PATCH /api/conversations/:threadId/status
10. Open pipeline board      GET  /api/deals
11. Open one deal            GET  /api/deals/:dealId
12. Move stage / add note    PATCH .../stage, POST .../notes
13. Manager overview         GET  /api/dashboard

(Optional earlier in CRM life: register lead)
   POST /api/clients
   POST /api/conversations   (new thread + first message in one call)
   POST /api/deals           (new opportunity on a client)
```

---

## Step 0 — `GET /health`

**Purpose:** Prove the Worker/API is running (deploy, local Wrangler). No database, no login.

**Example:** `GET http://127.0.0.1:8787/health` → `{ "status": "ok" }`.

---

## Step 1 — `GET /api/me`

**Purpose:** After login, the frontend loads **role and display name** (sales vs manager vs client). Drives UI permissions.

**Returns:** `id`, `fullName`, `role`, `createdAt`.

**In the story:** Sales token → `role: "sales"`, `fullName: "Demo Sales"`. Every protected route uses the same JWT; middleware sets `userId` for handlers.

**Typical errors:** `401` invalid/expired token; `404` profile missing.

---

## Step 2 — `GET /api/clients`

**Purpose:** **Lead/client directory** — search and filter CRM contacts.

**Query params (optional):**

- `q` — search text  
- `ownerId` — filter by owning user  

**In the story:** Sales lists clients to find **UK intake** lead (`a0000000-0000-4000-8000-000000000002`) before opening their conversation.

**Returns:** Array of clients with `id`, `fullName`, `email`, `phone`, `country`, `targetCountry`, etc.

---

## Step 3 — `GET /api/clients/:clientId`

**Purpose:** **Client detail page** in one request — aggregate response (case study contract).

**Returns:**

- `client` — contact record (`fullName`, `email`, `profileId`, etc.)
- `conversations` — threads for this `clientId`
- `deals` — pipeline rows for this `clientId`
- `recentActivity` — merged feed (messages, stage changes, notes) scoped to this client

**In the story:**

```http
GET /api/clients/a0000000-0000-4000-8000-000000000001
```

Germany applicant: one closed conversation thread, one deal (`consultation_booked`), and a `recentActivity` timeline. RLS scopes all nested lists.

**Typical errors:** `404` `NOT_FOUND_CLIENT`.

---

## Step 4 — `POST /api/clients` (optional — new lead)

**Purpose:** Sales **creates a new lead** in CRM (before any chat exists).

**Body (required):** `fullName`, `email`  
**Optional:** `phone`, `country`, `targetCountry`

**Returns:** `201` + new client JSON. `createdBy` is the authenticated user (not sent in body).

**In the story:** Used when someone calls the agency and is not in the system yet. Our seed already has UK/Germany clients, so steps 2–3 are enough for the demo narrative.

---

## Step 5 — `GET /api/conversations`

**Purpose:** **Inbox** — all conversation threads visible to the user (sorted by recent activity).

**In the story:** Sales sees:

- Germany thread — already assigned to them, `status: open` (later we set `closed` in tests)  
- UK thread — `assignedTo: null` (available to **claim**)

---

## Step 6 — `GET /api/conversations/:threadId`

**Purpose:** **Thread header** — subject, assignee, status, client link.

**In the story:**

```http
GET /api/conversations/b0000000-0000-4000-8000-000000000002
```

UK thread: subject *"New lead — UK intake"*, unassigned until step 8.

---

## Step 7 — `GET /api/conversations/:threadId/messages`

**Purpose:** **Chat transcript** for the UI (chronological).

**In the story:** Germany thread `...000001` returned 3 messages in tests (client question, sales reply, test follow-up). UK thread may have fewer until sales posts in step 9.

---

## Step 8 — `PATCH /api/conversations/:threadId/assign`

**Purpose:** Set **who owns** the conversation (`assigned_to`).

**Body:** `{ "assignedTo": "<sales-user-uuid>" }`

| Actor | Behavior |
|--------|----------|
| Sales | Only **unassigned** threads; must assign **to self** (claim) |
| Manager | Reassign to any sales user |
| Client | Not allowed |

**In the story (success):**

```http
PATCH .../b0000000-0000-4000-8000-000000000002/assign
{ "assignedTo": "8326ef2b-11cd-4096-8c01-44974b2520d7" }
```

UK lead is no longer in the shared pool — it belongs to Demo Sales.

**Test we ran (failure):** Assign on Germany thread already owned → **403** (sales cannot assign non-unassigned threads).

---

## Step 9 — `POST /api/conversations/:threadId/messages`

**Purpose:** **Reply** in an existing thread (not a new subject).

**Body:** `{ "message": "..." }`  
**Sender:** From JWT — sales → `senderType: "team"`, client → `"client"`.

**In the story:** After claim, sales sends e.g. *"Thanks for your interest in UK intake — here are next steps."*

We also tested on Germany thread:

```http
POST .../b0000000-0000-4000-8000-000000000001/messages
{ "message": "Follow-up from sales team" }
```

→ `201` with new message `id`.

---

## Step 10 — `PATCH /api/conversations/:threadId/status`

**Purpose:** Mark conversation **open**, **pending**, or **closed**.

**Body:** `{ "status": "open" | "pending" | "closed" }`

| Actor | Behavior |
|--------|----------|
| Manager | Any thread |
| Sales | Only threads **assigned to them** |
| Client | Not allowed |

**In the story (success):**

```http
PATCH .../b0000000-0000-4000-8000-000000000001/status
{ "status": "closed" }
```

Germany case marked resolved. Same for UK thread **after** step 8 (claim); before claim → **403**.

---

## Alternative entry — `POST /api/conversations`

**Purpose:** Create **new thread + first message** in one request (no existing `threadId`).

**Body:**

```json
{
  "clientId": "a0000000-0000-4000-8000-000000000002",
  "subject": "Admission help",
  "message": "I want to study in the UK."
}
```

**When to use:** New case from staff or client, instead of step 9 on an old thread.

| | `POST /conversations` | `POST /.../messages` |
|--|------------------------|----------------------|
| Creates thread | Yes | No |
| Needs `clientId` + `subject` | Yes | No (uses URL `threadId`) |

---

## Deals API (`/api/deals`)

**Purpose:** Sales pipeline — opportunities linked to a `clientId`, with stage history and internal notes.

| Endpoint | Who | Notes |
|----------|-----|--------|
| `GET /api/deals` | Staff (RLS) | Filters: `stage`, `ownerId`, `clientId`, `q` (title search) |
| `POST /api/deals` | Sales, manager | Body: `clientId`, `title`, optional `ownerId`, `valueAmount`, `expectedIntake`, … |
| `GET /api/deals/:dealId` | Staff (RLS) | `{ deal, client, notes, stageHistory }` |
| `PATCH .../stage` | Sales (owned) / manager | `lost` requires `lostReason`; records `deal_stage_history` on real stage change |
| `PATCH .../owner` | **Manager only** | `ownerId` must be a sales profile UUID (Zod validates UUID → `400` if malformed) |
| `POST .../notes` | Sales (owned) / manager | Body: `{ "body": "..." }` |

**Example (manager reassign):**

```http
PATCH /api/deals/d0000000-0000-4000-8000-000000000001/owner
{ "ownerId": "8326ef2b-11cd-4096-8c01-44974b2520d7" }
```

**Typical errors:** `403` sales updating another rep’s deal; `400` validation (`lostReason`, invalid `ownerId` UUID); `404` deal not found.

---

## Dashboard API (`GET /api/dashboard`)

**Purpose:** Manager/sales home screen — one aggregate JSON for KPI widgets + activity feed.

**Returns:**

- `conversationsByStatus` — counts per `open` / `pending` / `closed`
- `unassignedConversationCount` — threads with no assignee
- `dealsByStage` — pipeline funnel counts
- `dealsByOwner` — workload per sales rep (`ownerId: null` = unassigned deals)
- `recentActivity` — newest events across messages, stage history, and notes (RLS-scoped)

**Access:** `manager` and `sales` only → `403 FORBIDDEN` for `client` role.

**Example:**

```http
GET /api/dashboard
Authorization: Bearer <manager-or-sales-jwt>
```

Counts reflect **RLS** (sales may see the same totals as manager on small seed data if all rows are unassigned or owned by that sales user).

---

## How clients, conversations, and deals connect

```text
clients (a000...001 Germany applicant)
    ├── conversation_threads (b000...001 visa questions)
    │       └── conversation_messages (chat lines)
    └── deals (d000...001 Fall 2026 intake)
            ├── deal_notes
            └── deal_stage_history
```

- **Clients API** = CRM contact records (leads/applicants).  
- **Conversations API** = support/sales chat tied to a `clientId`.  
- **Deals API** = pipeline opportunities on a `clientId`.  
- **Dashboard API** = org-wide aggregates for staff (not clients).  
- **`GET /api/me`** = who is using the app and what they’re allowed to do.

---

## Architecture (all endpoints)

```text
HTTP (Crm.Api routes)
  → auth middleware (JWT → supabase client + userId)
  → Application services (use cases)
  → Infrastructure repositories (Supabase + RLS)
  → Domain rules (ConversationRules, etc. where used)
```

---

## Related docs

- [conversation-endpoints-guide.md](./conversation-endpoints-guide.md) — conversations-only deep dive  
- [conversation-post-rls-debug.md](./conversation-post-rls-debug.md) — RLS note for `POST /conversations`  
- [profile-read-flow.md](./profile-read-flow.md) — `GET /api/me` sequence diagram  
- [error-mappers-and-helpers.md](./error-mappers-and-helpers.md) — validation, `ApiError`, and mapper patterns  
