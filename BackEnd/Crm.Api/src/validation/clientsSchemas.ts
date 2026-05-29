import { z } from 'zod';
import { optionalTrimmedString, requiredTrimmedString } from './commonSchemas';

/** Body schema for POST /api/clients. */
export const createClientBodySchema = z.object({
  fullName: requiredTrimmedString,
  email: requiredTrimmedString,
  phone: optionalTrimmedString,
  country: optionalTrimmedString,
  targetCountry: optionalTrimmedString,
});

export type CreateClientBody = z.infer<typeof createClientBodySchema>;
