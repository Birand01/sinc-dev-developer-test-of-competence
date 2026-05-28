import type { DashboardActivityItem } from '../../dto/dashboard';

/**
 * Port for dashboard recent-activity feed (cross-table read model).
 * Implemented by Crm.Infrastructure; consumed by GetDashboardService.
 */
export interface IDashboardActivityRepository {
  /** Newest activity first; merged from messages, stage history, and notes. */
  listRecentActivity(limit: number): Promise<DashboardActivityItem[]>;
}
