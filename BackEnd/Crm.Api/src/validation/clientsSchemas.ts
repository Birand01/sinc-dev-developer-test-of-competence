import { z } from 'zod';

const requiredTrimmedString = z.string().trim().min(1);

const optionalTrimmedString = z
  .union([z.string(), z.undefined()])
  .transform((value) => {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

/** Body schema for POST /api/clients. */
export const createClientBodySchema = z.object({
  fullName: requiredTrimmedString,
  email: requiredTrimmedString,
  phone: optionalTrimmedString,
  country: optionalTrimmedString,
  targetCountry: optionalTrimmedString,
});

export type CreateClientBody = z.infer<typeof createClientBodySchema>;
