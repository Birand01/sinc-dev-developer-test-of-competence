import type { Client } from '../../../../Crm.Domain/entities/Client';
import type { ConversationThread } from '../../../../Crm.Domain/entities/ConversationThread';
import type { Deal } from '../../../../Crm.Domain/entities/Deal';
import type { DashboardActivityItem } from '../dashboard/DashboardSummary';

/**
 * Rich payload contract for GET /api/clients/:clientId.
 * Assembled by GetClientDetailService; HTTP mapping stays in Crm.Api.
 */
export interface ClientDetail {
  client: Client;
  conversations: ConversationThread[];
  deals: Deal[];
  recentActivity: DashboardActivityItem[];
}
