# Student CRM API — All Implemented Endpoints (One Real Example)

This document describes **every HTTP endpoint that is actually registered and working** in `Crm.Api` today (`app.ts`). It uses **one continuous story** with real seed IDs and the flows we tested in PowerShell.

**Not implemented yet (files exist but not mounted):** `/api/deals/*`, `/api/dashboard/*`, standalone `/api/messages/*`.

---

## Quick reference (implemented only)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | No | Liveness check |
| GET | `/api/me` | Yes | Current user profile + role |
| GET | `/api/clients` | Yes | List clients (optional `?q=&ownerId=`) |
| POST | `/api/clients` | Yes | Create a new lead/client record |
| GET | `/api/clients/:clientId` | Yes | Client detail |
| GET | `/api/conversations` | Yes | List conversation threads (inbox) |
| POST | `/api/conversations` | Yes | New thread + first message |
| GET | `/api/conversations/:threadId` | Yes | Thread detail |
| GET | `/api/conversations/:threadId/messages` | Yes | Message history (oldest first) |
| POST | `/api/conversations/:threadId/messages` | Yes | Send a message on existing thread |
| PATCH | `/api/conversations/:threadId/assign` | Yes | Assign thread to a sales rep |
| PATCH | `/api/conversations/:threadId/status` | Yes | Update thread status (open/pending/closed) |

All `/api/*` routes require: `Authorization: Bearer <Supabase JWT>`.

---

## Cast (seed + test data)

| Role | Login | User / profile ID |
|------|--------|-------------------|
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

---

## The story: Demo Sales handles a UK lead (full API journey)

```text
 0. Check API is up          GET  /health
 1. Who am I?                GET  /api/me
 2. Find the UK client       GET  /api/clients?q=...
 3. Open client record       GET  /api/clients/:clientId
 4. See all conversations    GET  /api/conversations
 5. Open UK thread           GET  /api/conversations/:threadId
 6. Read chat (if any)       GET  /api/conversations/:threadId/messages
 7. Claim the lead           PATCH /api/conversations/:threadId/assign
 8. Send follow-up          POST /api/conversations/:threadId/messages
 9. Close the case           PATCH /api/conversations/:threadId/status

(Optional earlier in CRM life: register lead)
   POST /api/clients
   POST /api/conversations   (new thread + first message in one call)
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

**Purpose:** **Single client profile** screen (contact details, linked `profileId` if they can log in).

**In the story:**

```http
GET /api/clients/a0000000-0000-4000-8000-000000000002
```

Shows UK lead details. RLS ensures sales only sees clients they are allowed to see.

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

## How clients and conversations connect

```text
clients (a000...002 UK lead)
    └── conversation_threads (b000...002 UK intake)
            └── conversation_messages (chat lines)
```

- **Clients API** = CRM contact records (leads/applicants).  
- **Conversations API** = support/sales chat tied to a `clientId`.  
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

## Not implemented (do not call yet)

| Planned area | Route file | Status |
|--------------|------------|--------|
| Deals pipeline | `routes/deals.ts` | Stub, not in `app.ts` |
| Dashboard stats | `routes/dashboard.ts` | Stub, not in `app.ts` |
| Standalone messages | `routes/messages.ts` | Stub; messages live under `/conversations/.../messages` |

---

## Related docs

- [conversation-endpoints-guide.md](./conversation-endpoints-guide.md) — conversations-only deep dive  
- [conversation-post-rls-debug.md](./conversation-post-rls-debug.md) — RLS note for `POST /conversations`  
- [profile-read-flow.md](./profile-read-flow.md) — `GET /api/me` sequence diagram  
