import type { ComponentType } from 'react'

import { ClientsPage } from '@/app/pages/clients/ClientsPage'
import { ConversationsPage } from '@/app/pages/conversations/ConversationsPage'
import { DashboardPage } from '@/app/pages/dashboard/DashboardPage'
import { PipelinePage } from '@/app/pages/deals/PipelinePage'

/**
 * Single source for staff nav + routes (DRY).
 * - router.tsx: path + page → child <Route element={…} />
 * - AppLayout: path + label → <NavLink />
 */
export type StaffRoute = {
  path: string
  label: string
  page: ComponentType
}

export const staffRoutes: StaffRoute[] = [
  { path: '/dashboard', label: 'Dashboard', page: DashboardPage },
  { path: '/clients', label: 'Clients', page: ClientsPage },
  { path: '/conversations', label: 'Conversations', page: ConversationsPage },
  { path: '/deals', label: 'Pipeline', page: PipelinePage },
]
