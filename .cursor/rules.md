# Student CRM – Cursor Rules

## Purpose

- This `rules.md` keeps the **Student CRM** architecture consistent.
- Target stack: **Clean Architecture + Cloudflare Workers (Hono) + Supabase (Auth, Postgres, Realtime) + React UI** (frontend later).
- Goal: maintain clear layer boundaries, correct role permissions, and a production-style MVP aligned with the case study.

---

## Emoji & Visual Richness Rules (Assistant Output)

- Every assistant response should use emojis where helpful.
- Headers, list items, and step-by-step flows should use icons for scannability.
- These rules apply to **assistant explanations only**, not to project source code or commit messages.

---

## Code Generation Guardrail

- The assistant **must not generate implementation code** until the user explicitly says one of:
  - `START CODING`
  - `IMPLEMENT`
  - `UYGULA`
- Until then, the assistant will:
  - Only analyze and explain architecture.
  - Only propose designs, patterns, and structures.
  - Only discuss flows, boundaries, and responsibilities.
- No automatic controller/service/repository/route implementations before explicit permission.

---

## Backend Project Structure

```
backend/
├── Crm.Api/              → Presentation (HTTP / Hono / Worker entry)
├── Crm.Application/      → Use cases, DTOs, interfaces
├── Crm.Domain/           → Entities, enums, domain rules
└── Crm.Infrastructure/   → Supabase, repositories, external services
```

- Build and finish **backend first**; move to **frontend** only after backend tests pass.
- Proceed **step by step**; do not add files or features the user did not request.

---

## High-Level Architecture – Clean Architecture

- Layers:
  - **Presentation** → `Crm.Api` (Hono routes, middleware, request/response mapping)
  - **Application** → `Crm.Application` (use cases, services, DTOs, interfaces)
  - **Domain** → `Crm.Domain` (entities, value objects, enums, business rules)
  - **Infrastructure** → `Crm.Infrastructure` (Supabase client, repositories, auth token validation helpers)
- Dependency direction (**outer → inner**):
  - `Crm.Api` → `Crm.Application` → `Crm.Domain`
  - `Crm.Infrastructure` implements interfaces from `Crm.Application` (or `Crm.Domain` where appropriate).
- `Crm.Domain` **must not** depend on:
  - Supabase SDK or SQL details
  - Hono, Cloudflare Workers, or HTTP frameworks
  - Frontend or UI concerns

---

## 1. Presentation Layer (`Crm.Api`)

- Responsibilities:
  - Define HTTP endpoints under `/api` (case study contract).
  - Validate request shape and required fields.
  - Map application results to HTTP status codes and JSON responses.
  - Apply authentication middleware (Bearer Supabase JWT) before use cases.
  - Enforce role checks at the edge (client, sales, manager) in coordination with Application rules.
- Forbidden:
  - Business rules and ownership logic duplicated only here (must also exist in Application/Domain).
  - Direct Supabase queries bypassing Application services.
  - Raw SQL in route handlers.
- Allowed:
  - DTO ↔ API contract mapping.
  - Correlation IDs, logging, CORS, and Worker-specific concerns.

---

## 2. Application Layer (`Crm.Application`)

- Responsibilities:
  - Implement use cases (e.g. assign conversation, create deal, move pipeline stage, dashboard aggregates).
  - Orchestrate workflows across repositories.
  - Define DTOs and request/response models for the API.
  - Define repository and service interfaces (`IClientRepository`, `IDealService`, etc.).
- Typical contents:
  - Services / use case handlers.
  - DTOs and validators.
  - Interfaces for persistence and auth context.
- Forbidden:
  - Raw Supabase/PostgREST calls (belongs in Infrastructure).
  - HTTP-specific types leaking into every service (keep ports abstract).
- Depends only on:
  - `Crm.Domain` entities, enums, and rules.
  - Abstractions (interfaces), not concrete Infrastructure types.

---

## 3. Domain Layer (`Crm.Domain`)

- Contains:
  - Entities and aggregates (Profile, Client, ConversationThread, Deal, etc.).
  - Enums: `app_role`, `conversation_status`, `deal_stage`, `message_sender_type`.
  - Domain rules (e.g. sales may only update owned deals; manager may update any deal).
  - Value objects where useful (email, stage transitions).
- Forbidden:
  - Supabase, Hono, or Cloudflare types.
  - API route paths or HTTP status codes.
  - UI or React references.
- Domain must remain:
  - Stable and framework-agnostic.
  - Focused on business invariants and role/ownership rules.

---

## 4. Infrastructure Layer (`Crm.Infrastructure`)

- Responsibilities:
  - Supabase Postgres access (repositories).
  - Supabase Auth token verification helpers.
  - Mapping DB rows ↔ domain entities.
  - Optional: Realtime channel helpers (if not handled only on frontend).
- Implements:
  - Repository interfaces from Application.
  - External integration contracts.
- Forbidden:
  - Pushing HTTP or Hono concerns into repositories.
  - Exposing internal DB shapes directly to `Crm.Api` without Application DTOs.

---

## Data & Auth Rules (Supabase)

- Database: **Supabase Postgres** per case study schema (`profiles`, `clients`, `conversation_threads`, `conversation_messages`, `deals`, `deal_stage_history`, `deal_notes`).
- Auth: **Supabase Auth**; protected API calls use `Authorization: Bearer <access_token>`.
- Access rules (must be enforced in **API + RLS**):
  - **Client**: own client record, conversations, messages, high-level deal status only.
  - **Sales**: assigned + unassigned conversations; create deals; update **owned** deals only.
  - **Manager**: read/update all clients, conversations, deals; reassign owners.
- Never:
  - Log access tokens or service role keys.
  - Commit `.env` or secrets (use `.env.example` only).

---

## API Contract (Case Study)

- Base path: `/api`
- Core groups: `/me`, `/clients`, `/conversations`, `/deals`, `/dashboard`
- Stage changes must write `deal_stage_history`.
- `lost` stage requires `lostReason` when applicable.
- Realtime channels (frontend): `conversation_messages`, `conversation_threads`, `deals`, `deal_stage_history`, `deal_notes`

---

## Realtime & Performance

- Prefer incremental/query-based reads; use indexes from the case study (`clients_email_idx`, thread/message indexes, deal stage indexes).
- Dashboard counts must come from **real database aggregates**, not hardcoded values.
- Realtime subscriptions must be **cleaned up** on unmount / thread change (frontend rule; backend stays stateless).

---

## Security Rules

- Secrets in environment variables only (Worker secrets, Supabase URL/keys).
- Role and ownership checks on **every** mutating endpoint.
- Clients must never read another client’s conversations or messages.
- Return **403** when sales attempts to update a deal they do not own (unless manager).

---

## Frontend (Later Phase)

- Stack: Vite, React, TypeScript, React Router, TanStack Query, shadcn/ui, Tailwind.
- Lives under `frontend/`; starts only after backend is complete and tested.
- UI calls Worker API; Supabase Realtime for chat/pipeline updates.
- Role-aware navigation and loading/empty/error states.

---

## Explanation & Documentation Style

- Explain **why**, not only **what**.
- Show **workflow** between layers (request → middleware → use case → repository → DB).
- Use tables and diagrams when clarifying architecture.
- Recommended format:
  - `## Title`
  - `### Concept`
  - Table for structure
  - Bullet list for steps
  - Key insights and trade-offs

---

## Critical Do & Don’t

- Never:
  - Put Supabase or SQL in **Domain**.
  - Put business rules only in **Api** without Application/Domain backing.
  - Skip role checks on assign, deal update, or message read paths.
  - Add features the user did not ask for in the current step.
- Always:
  - Follow: **Api → Application → Domain** and **Infrastructure implements Application ports**.
  - Record deal stage changes in history.
  - Keep commits and steps small and reviewable.
  - Match case study enums, stages, and endpoint shapes unless the user approves a change.

---

## Project Goal

- Deliver a working MVP:
  - Auth and roles
  - Realtime chat with assignment
  - Deals, pipeline, stage history, notes
  - Manager reassignment
  - Dashboard from real data
  - Deploy frontend and backend to **Cloudflare**
- Priorities: **correct permissions**, **clean layers**, **testable backend**, then frontend.

---

## Final Rule

- This project must remain:
  - **Layered**
  - **Modular**
  - **Testable**
  - **Aligned with the case study**
- When in doubt, add behavior in **Application** and **Infrastructure**, not by coupling **Domain** to Supabase or Hono.
