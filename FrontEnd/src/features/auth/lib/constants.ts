import { AppRole, type AppRole as AppRoleType } from '@/features/auth/types'

/** Default home for sales and manager after login. */
export const STAFF_AUTHENTICATED_HOME = '/dashboard' as const

/** Default home for client role after login. */
export const CLIENT_AUTHENTICATED_HOME = '/my-chats' as const

/** @deprecated Prefer getAuthenticatedHome(role) for role-aware redirects. */
export const AUTHENTICATED_HOME = STAFF_AUTHENTICATED_HOME

/** Post-login destination based on CRM profile role. */
export function getAuthenticatedHome(role: AppRoleType): string {
  if (role === AppRole.Client) return CLIENT_AUTHENTICATED_HOME
  return STAFF_AUTHENTICATED_HOME
}
