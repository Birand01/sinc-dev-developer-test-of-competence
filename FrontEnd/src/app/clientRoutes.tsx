import type { ComponentType } from 'react'

import { ClientChatsPage } from '@/app/pages/client/ClientChatsPage'

/**
 * Single source for client-portal nav + routes (mirrors staffRoutes.tsx).
 *
 * Consumers (wired in later P-1 steps):
 * - router.tsx  → path + page → child <Route element={…} />
 * - AppLayout.tsx → path + label → client <NavLink /> tabs
 *
 * Staff URLs (/dashboard, /clients, …) stay in staffRoutes — client paths must not overlap.
 */
export type ClientRoute = {
  /** URL segment under AppLayout, e.g. `/my-chats`. */
  path: string
  /** Top nav label shown when me.role === client. */
  label: string
  /** Page component rendered inside AppLayout's <Outlet />. */
  page: ComponentType
}

/**
 * Client-only routes. Start with one entry; My Applications etc. can be appended later.
 * Default post-login home for client role: `/my-chats` (see auth constants, step 4).
 */
export const clientRoutes: ClientRoute[] = [
  { path: '/my-chats', label: 'My Chats', page: ClientChatsPage },
]
