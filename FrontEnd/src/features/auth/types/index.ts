/**
 * Types for CRM profile data from the Worker (not Supabase Auth user metadata).
 *
 * Source of truth: GET /api/me → profiles row (see BackEnd Crm.Api routes/users.ts).
 * Supabase session (AuthContext) only proves login; MeResponse is "who am I in the CRM".
 */

/** Matches Postgres `app_role` and BackEnd Crm.Domain AppRole string values. */
export const AppRole = {
  Client: 'client',
  Sales: 'sales',
  Manager: 'manager',
} as const

export type AppRole = (typeof AppRole)[keyof typeof AppRole]

/**
 * JSON body for GET /api/me (200).
 * Dates are ISO strings over HTTP; map to Date in UI only if needed.
 */
export type MeResponse = {
  /** profiles.id — same as Supabase auth.users.id when profile exists */
  id: string
  /** profiles.full_name */
  fullName: string
  /** profiles.role — used for UI visibility; Worker re-checks on every mutating API */
  role: AppRole
  /** profiles.created_at */
  createdAt: string
}
