import type { Client } from '../entities/Client';
import type { ConversationThread } from '../entities/ConversationThread';
import type { Profile } from '../entities/Profile';
import { isClient, isManager, isSales } from './helpers';

/**
 * Access: Manager all; Sales assigned or unassigned threads;
 * Client only threads for their own client record.
 */
export function canReadThread(
  actor: Profile,
  thread: ConversationThread,
  client: Client,
): boolean {
  if (isManager(actor)) return true;

  if (isSales(actor)) {
    return thread.assignedTo === null || thread.assignedTo === actor.id;
  }

  if (isClient(actor)) {
    return client.profileId === actor.id && thread.clientId === client.id;
  }

  return false;
}

/** Same visibility as thread list/detail. */
export function canReadMessages(
  actor: Profile,
  thread: ConversationThread,
  client: Client,
): boolean {
  return canReadThread(actor, thread, client);
}

/**
 * Access: Manager assigns any thread; Sales can claim unassigned (assigned_to was null).
 */
export function canAssignThread(actor: Profile, thread: ConversationThread): boolean {
  if (isManager(actor)) return true;
  if (isSales(actor)) return thread.assignedTo === null;
  return false;
}

/**
 * Access: Manager any thread; Sales on unassigned (claim) or assigned-to-self;
 * Client on own thread only.
 */
export function canSendMessage(
  actor: Profile,
  thread: ConversationThread,
  client: Client,
): boolean {
  if (isManager(actor)) return true;

  if (isSales(actor)) {
    return thread.assignedTo === null || thread.assignedTo === actor.id;
  }

  if (isClient(actor)) {
    return client.profileId === actor.id && thread.clientId === client.id;
  }

  return false;
}

/**
 * Access: Manager any; Sales on threads they own; Client cannot change status.
 */
export function canUpdateThreadStatus(
  actor: Profile,
  thread: ConversationThread,
): boolean {
  if (isManager(actor)) return true;
  if (isSales(actor)) return thread.assignedTo === actor.id;
  return false;
}
