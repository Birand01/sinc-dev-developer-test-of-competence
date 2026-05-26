/**
 * CRM client / student record (clients table).
 * May link to a Profile when the client logs in (profile_id).
 * Separate from Profile: a sales user has a Profile but not a Client row.
 */
export interface Client {
  id: string;
  /** profiles.id when this client has a login; null for lead-only records */
  profileId: string | null;
  /** clients.full_name */
  fullName: string;
  /** clients.email — unique index in DB */
  email: string;
  phone: string | null;
  country: string | null;
  targetCountry: string | null;
  /** profiles.id of sales/manager who created the record */
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
