import type { Profile } from '../../../Crm.Domain/entities/Profile';
import { AppRole } from '../../../Crm.Domain/enums/AppRole';
import type { AppRole as AppRoleType } from '../../../Crm.Domain/enums/AppRole';

/** Row shape returned by Supabase from public.profiles (snake_case columns). */
export type ProfileRow = {
  id: string;
  full_name: string;
  role: string;
  created_at: string;
};

function toAppRole(value: string): AppRoleType {
  const allowed = Object.values(AppRole) as string[];
  if (!allowed.includes(value)) {
    throw new Error(`Invalid profiles.role value: ${value}`);
  }
  return value as AppRoleType;
}

/** Maps a Supabase profiles row to the domain Profile entity. */
export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    role: toAppRole(row.role),
    createdAt: new Date(row.created_at),
  };
}
