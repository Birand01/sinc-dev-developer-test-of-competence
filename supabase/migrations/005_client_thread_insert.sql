-- Client portal (P-4): allow clients to start new conversation threads on their own record.
-- Prerequisite: 002_rls_policies.sql (current_client_id(), is_client(), threads_insert_staff).
-- API: POST /api/conversations with senderType "client" (Crm.Api conversations route).
-- Run in Supabase: SQL Editor → paste this file → Run (see .cursor/SEED.md § Incremental migrations).

create policy threads_insert_client on public.conversation_threads
  for insert to authenticated
  with check (
    public.is_client()
    and client_id = public.current_client_id()
  );
