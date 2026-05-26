import { AppRole } from '../enums/AppRole';
import type { Profile } from '../entities/Profile';

/** profiles.role === manager */
export function isManager(actor: Profile): boolean {
  return actor.role === AppRole.Manager;
}

/** profiles.role === sales */
export function isSales(actor: Profile): boolean {
  return actor.role === AppRole.Sales;
}

/** profiles.role === client */
export function isClient(actor: Profile): boolean {
  return actor.role === AppRole.Client;
}
