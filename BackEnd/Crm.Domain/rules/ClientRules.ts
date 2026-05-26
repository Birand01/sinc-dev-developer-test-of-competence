import type { Client } from '../entities/Client';
import type { Profile } from '../entities/Profile';
import { isClient, isManager, isSales } from './helpers';

/**
 * Access: Manager and Sales read any client; Client only own record (profile_id match).
 */
export function canReadClient(actor: Profile, client: Client): boolean {
  if (isManager(actor) || isSales(actor)) return true;

  if (isClient(actor)) {
    return client.profileId === actor.id;
  }

  return false;
}

/**
 * Access: Manager and Sales update CRM client fields; Client cannot update CRM record.
 */
export function canUpdateClient(actor: Profile, _client: Client): boolean {
  if (isManager(actor) || isSales(actor)) return true;
  return false;
}

/**
 * Access: Sales and Manager create new client/lead records.
 */
export function canCreateClient(actor: Profile): boolean {
  return isSales(actor) || isManager(actor);
}
