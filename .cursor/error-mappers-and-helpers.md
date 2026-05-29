# Error Mappers and Helpers (Quick Reference)

This note explains where API error semantics and shared helper logic live, and what each file is responsible for.

## 1) API error layer (`BackEnd/Crm.Api/src/errors`)

- `ApiError.ts`
  - Standard HTTP-facing error type used by routes and middleware.
  - Carries `code`, `status`, `message`, optional `details`.

- `ErrorCode.ts`
  - Central union type of allowed API error codes.
  - Keeps JSON error responses consistent across endpoints.

- `index.ts`
  - Barrel export for `ApiError` and all mapper functions.
  - Routes import from one place instead of many file paths.

### Mapper files (Application error -> HTTP error)

- `mapAssignConversationError.ts`
  - Maps assign-thread use-case failures.
  - Typical mapping: not found -> `404`, forbidden -> `403`, assignee validation -> `400`.

- `mapUpdateConversationStatusError.ts`
  - Maps conversation status update failures.
  - Typical mapping: thread missing -> `404`, unauthorized action -> `403`, invalid status -> `400`.

- `mapCreateDealError.ts`
  - Maps deal creation failures.
  - Typical mapping: forbidden -> `403`, client/owner not found -> `404`, owner role issue -> `400`.

- `mapUpdateDealStageError.ts`
  - Maps deal stage update failures.
  - Typical mapping: deal missing -> `404`, forbidden -> `403`, missing `lostReason` for `lost` -> `400`.

- `mapUpdateDealOwnerError.ts`
  - Maps manager-only owner reassignment failures.
  - Typical mapping: deal/owner missing -> `404`, forbidden -> `403`, owner-not-sales -> `400`.

## 2) Validation helpers (`BackEnd/Crm.Api/src/validation`)

- `parseHelpers.ts`
  - `parseBodyOrThrow(schema, body)`, `parseQueryOrThrow(schema, query)`, and `parseParamsOrThrow(schema, params)`.
  - Converts Zod validation failures into `ApiError` with:
    - `code: VALIDATION_FAILED`
    - `status: 400`
    - `details.issues` from Zod.
  - This is the main boundary between malformed input and business errors.

- `commonSchemas.ts`
  - Shared Zod helpers (`requiredTrimmedUuid`, `nullableTrimmedUuid`, trim helpers).
  - Body/query UUID fields use these so malformed IDs return `400` before repository access.

- `dealsSchemas.ts` / `conversationsSchemas.ts` / `clientsSchemas.ts`
  - Zod schemas for endpoint request body/query contracts.
  - Example: `createDealBodySchema.clientId`, `createConversationBodySchema.clientId`, `assignConversationBodySchema.assignedTo`.

- `pathSchemas.ts`
  - Zod schemas for URL path params (`clientId`, `dealId`, `threadId`).
  - Invalid path UUIDs return `400 VALIDATION_FAILED` instead of being treated as `404 Not Found`.

## 3) Infrastructure repository helpers (`BackEnd/Crm.Infrastructure/src/helpers`)

- `repositoryHelpers.ts`
  - `throwIfSupabaseError(error, context)`: throws contextual error when Supabase returns an error.
  - `mapRowsOrEmpty(rows, mapper)`: maps row lists and returns `[]` when null/empty.
  - `mapMaybeSingle(row, mapper)`: maps one row or returns `null`.
  - Goal: avoid repeating null/error/list mapping boilerplate in every repository.

## 4) Error classification used in this project

- Validation error (malformed input, schema mismatch) -> `400`
- Business/use-case error (forbidden, not found, domain rule) -> `403/404/400`
- Internal error (unexpected runtime/infra failure) -> `500`

Keeping these categories separate makes endpoint behavior predictable and easier to review.
