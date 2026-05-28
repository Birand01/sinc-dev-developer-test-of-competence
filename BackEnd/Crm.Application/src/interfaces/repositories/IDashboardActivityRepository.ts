import type { DashboardActivityItem } from '../../dto/dashboard';

/**
 * Port for recent-activity feed (cross-table read model).
 * Implemented by Crm.Infrastructure; consumed by dashboard and client detail use-cases.
 */
export interface IDashboardActivityRepository {
  /** Newest activity first; merged from messages, stage history, and notes. */
  listRecentActivity(limit: number): Promise<DashboardActivityItem[]>;
  /** Same feed shape, scoped to one client (RLS-scoped). */
  listRecentActivityByClientId(clientId: string, limit: number): Promise<DashboardActivityItem[]>;
}
