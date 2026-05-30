import { DealStage } from '../enums/DealStage';
import type { Client } from '../entities/Client';
import type { Deal } from '../entities/Deal';
import type { Profile } from '../entities/Profile';
import { isClient, isManager, isSales } from './helpers';

/**
 * Access: Sales can create deals; Manager can create deals.
 */
export function canCreateDeal(actor: Profile): boolean {
  return isSales(actor) || isManager(actor);
}

/**
 * Access: Manager can update all deals; Sales only owned deals.
 */
export function canUpdateDeal(actor: Profile, deal: Deal): boolean {
  if (isManager(actor)) return true;
  if (isSales(actor)) return deal.ownerId === actor.id;
  return false;
}

/**
 * Access: Manager reads all; Sales reads owned or unassigned pipeline deals;
 * Client reads own client's deals (high-level visibility in Application/DTO).
 */
export function canReadDeal(actor: Profile, deal: Deal, client: Client): boolean {
  if (isManager(actor)) return true;

  if (isSales(actor)) {
    return deal.ownerId === null || deal.ownerId === actor.id;
  }

  if (isClient(actor)) {
    return client.profileId === actor.id && deal.clientId === client.id;
  }

  return false;
}

/** Manager-only: reassign deal owner_id. */
export function canReassignDealOwner(actor: Profile): boolean {
  return isManager(actor);
}

/**
 * Access: Sales can claim unassigned deals (owner_id was null).
 * Manager reassigns via canReassignDealOwner instead of claiming.
 */
export function canClaimDeal(actor: Profile, deal: Deal): boolean {
  if (isSales(actor)) return deal.ownerId === null;
  return false;
}

/**
 * Case study: moving to lost requires a non-empty lost_reason.
 */
export function requiresLostReason(
  toStage: DealStage,
  lostReason: string | null | undefined,
): boolean {
  if (toStage !== DealStage.Lost) return true;
  return typeof lostReason === 'string' && lostReason.trim().length > 0;
}

/**
 * Application should insert deal_stage_history when stage actually changes.
 */
export function shouldRecordStageHistory(
  fromStage: DealStage | null,
  toStage: DealStage,
): boolean {
  return fromStage !== toStage;
}
