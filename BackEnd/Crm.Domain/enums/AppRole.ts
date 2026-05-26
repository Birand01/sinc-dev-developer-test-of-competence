/**
 * Application role stored on profiles.role (Postgres app_role enum).
 * Drives authorization in API middleware and domain policies.
 */
export const AppRole = {
  Client: 'client',
  Sales: 'sales',
  Manager: 'manager',
} as const;

export type AppRole = (typeof AppRole)[keyof typeof AppRole];
