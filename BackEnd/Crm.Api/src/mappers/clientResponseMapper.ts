import type { ClientDetail } from '../../../Crm.Application/src/dto/clients/ClientDetail';
import type { Client } from '../../../Crm.Domain/entities/Client';
import { toConversationThreadResponse } from './conversationResponseMapper';
import { toDealResponse } from './dealResponseMapper';

/** API response mapper for client resources. */
export function toClientResponse(client: Client) {
  return {
    id: client.id,
    profileId: client.profileId,
    fullName: client.fullName,
    email: client.email,
    phone: client.phone,
    country: client.country,
    targetCountry: client.targetCountry,
    createdBy: client.createdBy,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };
}

/** API response mapper for rich client detail resources. */
export function toClientDetailResponse(detail: ClientDetail) {
  return {
    client: toClientResponse(detail.client),
    conversations: detail.conversations.map(toConversationThreadResponse),
    deals: detail.deals.map(toDealResponse),
    recentActivity: detail.recentActivity.map((item) => ({
      type: item.type,
      occurredAt: item.occurredAt.toISOString(),
      summary: item.summary,
      ...(item.threadId ? { threadId: item.threadId } : {}),
      ...(item.dealId ? { dealId: item.dealId } : {}),
      ...(item.clientId ? { clientId: item.clientId } : {}),
    })),
  };
}
