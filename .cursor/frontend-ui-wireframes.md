# Frontend UI Wireframes & Component Rules

Reference for building the Student CRM UI in `FrontEnd/`. Use **shadcn/ui** components (add via CLI as needed). Layout and copy should match these wireframes unless the user approves a change.

**Stack:** Vite, React, TypeScript, React Router, TanStack Query, Supabase Auth + Realtime, Tailwind, shadcn/ui.

**API:** Worker at `VITE_API_BASE_URL` — see [api-endpoints-guide.md](./api-endpoints-guide.md).

---

## shadcn/ui Components (approved set)

Install with `npx shadcn@latest add <name>` when implementing each screen.

| Component | Typical use in this app |
|-----------|-------------------------|
| `Button` | Primary actions, Send, Assign, New Client/Deal |
| `Card` | Dashboard KPIs, deal/client summary blocks |
| `Input` | Search, login, forms, reply box (with composition) |
| `Textarea` | Deal notes, long replies |
| `Badge` | Stage, status (Open/Closed), role chips |
| `Tabs` | Client detail: Conversations / Deals / Activity filters |
| `Table` | Clients list, dashboard breakdown tables |
| `Dialog` | Confirmations, reassign, lost reason |
| `Select` | Stage picker, owner filter, status |
| `ScrollArea` | Message list, long tables |
| `Avatar` | User menu, assignee |
| `DropdownMenu` | User menu, row actions |
| `Sheet` | Mobile nav / side panels (optional) |
| `Command` | Global search (optional polish) |
| `Separator` | Section dividers in detail views |
| `App Shell` | Top bar + horizontal nav (compose with layout + `Separator`) |

---

## App Shell (all authenticated staff pages)

```
+--------------------------------------------------------------------------------+
| SINC Sales CRM                         Search...                  User menu v   |
|--------------------------------------------------------------------------------|
| Dashboard | Clients | Conversations | Pipeline                                  |
+--------------------------------------------------------------------------------+
```

**Rules:**

- Brand: **SINC Sales CRM** (top left).
- Global search placeholder: `Search...` (wire as `Command` or `Input` later).
- **User menu** (`DropdownMenu` + `Avatar`): profile, logout.
- Nav links map to routes:
  - Dashboard → `/dashboard`
  - Clients → `/clients`
  - Conversations → `/inbox` (or `/conversations`)
  - Pipeline → `/deals`
- **Client** role: hide staff nav; client-only routes (not in wireframe set).
- Data: `GET /api/me` for user display; role gates which nav items show.

---

## Dashboard

**Route:** `/dashboard`  
**API:** `GET /api/dashboard`  
**Roles:** sales, manager (403 for client)

```
+--------------------------------------------------------------------------------+
| Dashboard                                                                      |
|--------------------------------------------------------------------------------|
| +----------------+ +----------------+ +----------------+ +-------------------+ |
| | Open Chats     | | Unassigned     | | Active Deals   | | Won Deals         | |
| | 18             | | 5              | | 42             | | 9                 | |
| +----------------+ +----------------+ +----------------+ +-------------------+ |
|                                                                                |
| +-----------------------------------+ +----------------------------------------+ |
| | Deals by Stage                    | | Deals by Owner                         | |
| |-----------------------------------| |----------------------------------------| |
| | New Lead              10          | | Aigerim                  14            | |
| | Contacted             8           | | Dias                     11            | |
| | Consultation Booked   6           | | Mira                     7             | |
| | Submitted             4           | | Unassigned               10            | |
| +-----------------------------------+ +----------------------------------------+ |
+--------------------------------------------------------------------------------+
```

**Components:** `Card` (KPI row), `Table` or stacked rows for aggregates, `Badge` for stage labels optional.

**Data mapping:**

| Wireframe block | API field |
|-----------------|-----------|
| Open Chats | `conversationsByStatus` (sum open + pending or open only — align with product) |
| Unassigned | `unassignedConversationCount` |
| Active Deals | derive from `dealsByStage` (exclude won/lost) or separate metric if added |
| Won Deals | `dealsByStage` → `won` count |
| Deals by Stage | `dealsByStage[]` |
| Deals by Owner | `dealsByOwner[]` |
| Recent activity (optional below fold) | `recentActivity[]` |

---

## Clients (list)

**Route:** `/clients`  
**API:** `GET /api/clients?q=`

```
+--------------------------------------------------------------------------------+
| Clients                                                   [ New Client ]        |
|--------------------------------------------------------------------------------|
| Search [ aruzhan                                      ]                         |
|                                                                                |
| +----------------------------------------------------------------------------+ |
| | Name             Email                 Target Country      Active Deal       | |
| |----------------------------------------------------------------------------| |
| | Aruzhan Karim    aruzhan@example.com   Canada              Business Canada   | |
| | Nursultan A.     nur@example.com       UK                  Computer Science  | |
| | Dana S.          dana@example.com      USA                 No active deal    | |
| +----------------------------------------------------------------------------+ |
+--------------------------------------------------------------------------------+
```

**Components:** `Button` (New Client), `Input` (search), `Table`, row click → client detail.

**Actions:**

- **New Client** → dialog or `/clients/new` → `POST /api/clients`.

---

## Client Detail

**Route:** `/clients/:clientId`  
**API:** `GET /api/clients/:clientId` (rich: client, conversations, deals, recentActivity)

```
+--------------------------------------------------------------------------------+
| Aruzhan Karim                                      [ New Deal ] [ New Chat ]    |
|--------------------------------------------------------------------------------|
| Email: aruzhan@example.com   Phone: +77000000000   Target: Canada              |
|                                                                                |
| +-----------------------------------+ +----------------------------------------+ |
| | Conversations                     | | Deals                                  | |
| |-----------------------------------| |----------------------------------------| |
| | Admission help            Open    | | Canada business program  Contacted     | |
| | Visa question             Closed  | | MBA pathway              New Lead      | |
| +-----------------------------------+ +----------------------------------------+ |
|                                                                                |
| +----------------------------------------------------------------------------+ |
| | Activity                                                                   | |
| |----------------------------------------------------------------------------| |
| | Deal moved from new_lead to contacted                                      | |
| | Aigerim replied in Admission help                                          | |
| | Deal note added                                                            | |
| +----------------------------------------------------------------------------+ |
+--------------------------------------------------------------------------------+
```

**Components:** `Button`, `Card`, `Badge` (Open/Closed, stage), `Tabs` optional, `Table` or list rows, `ScrollArea` for activity.

**Actions:**

- **New Deal** → `POST /api/deals` with `clientId`.
- **New Chat** → `POST /api/conversations` with `clientId`.
- Conversation row → conversation workspace.
- Deal row → deal detail.

---

## Conversation Workspace

**Route:** `/inbox` or `/conversations` + `/conversations/:threadId`  
**API:** list threads, messages, assign, status, send message. Realtime: `conversation_messages`, `conversation_threads`.

```
+--------------------------------------------------------------------------------+
| Conversations                          [ Unassigned ] [ Mine ] [ All ]          |
|--------------------------------------------------------------------------------|
| +--------------------------------------+ +-------------------------------------+ |
| | Queue                                | | Admission help                Open  | |
| |--------------------------------------| |-------------------------------------| |
| | Admission help        Unassigned     | | Client: I need help with Canada.    | |
| | Visa question         Aigerim        | | Sales: What intake do you want?     | |
| | Tuition fees          Dias           | | Client: Fall 2026.                  | |
| |                                      | |                                     | |
| |                                      | | Owner: Unassigned                   | |
| |                                      | | [ Assign to me ] [ Reassign ]       | |
| |                                      | |                                     | |
| |                                      | | [ Reply...                       ]  | |
| |                                      | |                         [ Send ]     | |
| +--------------------------------------+ +-------------------------------------+ |
+--------------------------------------------------------------------------------+
```

**Components:** filter `Tabs` or `Button` group, `ScrollArea`, message bubbles (custom + `Card`), `Input`/`Textarea`, `Button`, `Badge`, `Select` or `Dialog` for reassign.

**Filters:**

- Unassigned / Mine / All — client-side filter on `GET /api/conversations` or query params if added later.

**Actions:**

- **Assign to me** → `PATCH .../assign` with current user id.
- **Reassign** → `Dialog` + `Select` (sales profiles) → `PATCH .../assign`.
- **Send** → `POST .../messages`.
- Status badge → `PATCH .../status` (open/pending/closed).

---

## Pipeline Board

**Route:** `/deals`  
**API:** `GET /api/deals?stage=&ownerId=&q=`

```
+--------------------------------------------------------------------------------+
| Pipeline                                      Owner [ All v ] Search [       ]  |
|--------------------------------------------------------------------------------|
| New Lead       Contacted      Consultation    Documents      Submitted          |
| +----------+   +----------+   +----------+   +----------+   +----------+       |
| | Aruzhan  |   | Nursultan|   | Dana     |   | Timur    |   | Amina    |       |
| | Canada   |   | UK CS    |   | USA MBA  |   | Canada   |   | UK Law   |       |
| | Aigerim  |   | Dias     |   | Mira     |   | Aigerim  |   | Dias     |       |
| +----------+   +----------+   +----------+   +----------+   +----------+       |
| | Client B |   | Client C |                                                    |
| +----------+   +----------+                                                    |
+--------------------------------------------------------------------------------+
```

**Components:** `Card` per deal (kanban), `Select` (owner filter), `Input` (search), `Badge` (stage column headers), drag-and-drop optional (MVP: click card → detail; stage change on detail).

**Stages:** match `DealStage` enum (new_lead, contacted, consultation_booked, documents_requested, application_started, submitted, won, lost).

**Stage update:** `PATCH /api/deals/:dealId/stage` (+ `lostReason` when lost).

---

## Deal Detail

**Route:** `/deals/:dealId`  
**API:** `GET /api/deals/:dealId` (rich: deal, client, notes, stageHistory)

```
+--------------------------------------------------------------------------------+
| Canada business program                         Stage [ Contacted v ]           |
|--------------------------------------------------------------------------------|
| Client: Aruzhan Karim       Owner: Aigerim       Value: USD 1,200              |
| Intake: Fall 2026                                  [ Reassign Owner ]          |
|                                                                                |
| +-----------------------------------+ +----------------------------------------+ |
| | Notes                             | | Stage History                          | |
| |-----------------------------------| |----------------------------------------| |
| | Client wants Canada or UK.        | | New Lead -> Contacted                  | |
| | Needs scholarship options.        | | Contacted -> Consultation Booked       | |
| | [ Add note...                  ]  | |                                        | |
| |                         [ Add ]   | |                                        | |
| +-----------------------------------+ +----------------------------------------+ |
+--------------------------------------------------------------------------------+
```

**Components:** `Select` (stage), `Button` (Reassign Owner — manager), `Textarea` + `Button` (Add note), `Card`, `ScrollArea`, `Dialog` for lost reason when stage = lost.

**Actions:**

- Stage change → `PATCH .../stage`.
- **Reassign Owner** → `PATCH .../owner` (manager only).
- **Add note** → `POST .../notes`.

---

## Route map (implementation checklist)

| Screen | Path | Primary API |
|--------|------|-------------|
| Login | `/login` | Supabase Auth |
| Dashboard | `/dashboard` | `GET /api/dashboard` |
| Clients | `/clients` | `GET /api/clients` |
| Client detail | `/clients/:clientId` | `GET /api/clients/:clientId` |
| Conversations | `/conversations`, `/conversations/:threadId` | conversations + messages |
| Pipeline | `/deals` | `GET /api/deals` |
| Deal detail | `/deals/:dealId` | `GET /api/deals/:dealId` |

---

## UX rules (all screens)

- Loading: skeleton or spinner inside `Card` / table body.
- Empty: short message + primary action (e.g. “No clients yet” + New Client).
- Errors: toast or inline alert; 401 → redirect to `/login`.
- Staff vs client: hide Pipeline/Dashboard for client role per case study.
- Prefer `ScrollArea` for overflowing lists; keep app shell fixed.

---

## Related docs

- [api-endpoints-guide.md](./api-endpoints-guide.md) — API contract & seed IDs
- [rules.md](./rules.md) — architecture & frontend stack
- [error-mappers-and-helpers.md](./error-mappers-and-helpers.md) — API error shapes (for form validation display)
