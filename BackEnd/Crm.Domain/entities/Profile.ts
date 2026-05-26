import type { AppRole } from '../enums/AppRole';

/**
 * User profile (profiles table).
 * Primary key is the Supabase Auth user id (auth.users.id).
 * Holds display name and app role; not the same as a CRM client record.
 */
export interface Profile {
  /** Same as auth.users.id */
  id: string;
  /** profiles.full_name */
  fullName: string;
  /** profiles.role — client | sales | manager */
  role: AppRole;
  /** profiles.created_at */
  createdAt: Date;
}
