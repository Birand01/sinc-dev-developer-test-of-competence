-- Student CRM: Row Level Security policies (case study access rules)
-- Prerequisite: 001_initial_schema.sql (tables exist, RLS enabled)

-- ---------------------------------------------------------------------------
-- Helpers (security definer — read role without recursive RLS issues)
-- ---------------------------------------------------------------------------
create or replace function public.current_app_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'manager'::app_role
  );
$$;

create or replace function public.is_sales()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'sales'::app_role
  );
$$;

create or replace function public.is_client()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'client'::app_role
  );
$$;

create or replace function public.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.clients where profile_id = auth.uid() limit 1;
$$;

create or replace function public.can_access_client(p_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_manager()
    or public.is_sales()
    or exists (
      select 1
      from public.clients c
      where c.id = p_client_id and c.profile_id = auth.uid()
    );
$$;

create or replace function public.can_access_thread(p_thread_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_threads t
    where t.id = p_thread_id
      and (
        public.is_manager()
        or (
          public.is_sales()
          and (t.assigned_to is null or t.assigned_to = auth.uid())
        )
        or (
          public.is_client()
          and t.client_id = public.current_client_id()
        )
      )
  );
$$;

create or replace function public.can_access_deal(p_deal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.deals d
    where d.id = p_deal_id
      and (
        public.is_manager()
        or (
          public.is_sales()
          and (d.owner_id is null or d.owner_id = auth.uid())
        )
        or (
          public.is_client()
          and d.client_id = public.current_client_id()
        )
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.current_app_role() in ('manager'::app_role, 'sales'::app_role)
  );

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_manager())
  with check (id = auth.uid() or public.is_manager());

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
create policy clients_select on public.clients
  for select to authenticated
  using (public.can_access_client(id));

create policy clients_insert_staff on public.clients
  for insert to authenticated
  with check (public.is_manager() or public.is_sales());

create policy clients_update_staff on public.clients
  for update to authenticated
  using (public.is_manager() or public.is_sales())
  with check (public.is_manager() or public.is_sales());

-- ---------------------------------------------------------------------------
-- conversation_threads
-- ---------------------------------------------------------------------------
create policy threads_select on public.conversation_threads
  for select to authenticated
  using (public.can_access_thread(id));

create policy threads_insert_staff on public.conversation_threads
  for insert to authenticated
  with check (public.is_manager() or public.is_sales());

create policy threads_update on public.conversation_threads
  for update to authenticated
  using (
    public.is_manager()
    or (public.is_sales() and (assigned_to = auth.uid() or assigned_to is null))
  )
  with check (
    public.is_manager()
    or (public.is_sales() and assigned_to = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- conversation_messages
-- ---------------------------------------------------------------------------
create policy messages_select on public.conversation_messages
  for select to authenticated
  using (public.can_access_thread(thread_id));

create policy messages_insert on public.conversation_messages
  for insert to authenticated
  with check (
    sender_id = auth.uid()
    and public.can_access_thread(thread_id)
  );

-- ---------------------------------------------------------------------------
-- deals
-- ---------------------------------------------------------------------------
create policy deals_select on public.deals
  for select to authenticated
  using (public.can_access_deal(id));

create policy deals_insert_staff on public.deals
  for insert to authenticated
  with check (public.is_manager() or public.is_sales());

create policy deals_update on public.deals
  for update to authenticated
  using (
    public.is_manager()
    or (public.is_sales() and owner_id = auth.uid())
  )
  with check (
    public.is_manager()
    or (public.is_sales() and owner_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- deal_stage_history
-- ---------------------------------------------------------------------------
create policy deal_history_select on public.deal_stage_history
  for select to authenticated
  using (public.can_access_deal(deal_id));

create policy deal_history_insert on public.deal_stage_history
  for insert to authenticated
  with check (
    changed_by = auth.uid()
    and public.can_access_deal(deal_id)
    and (
      public.is_manager()
      or (
        public.is_sales()
        and exists (
          select 1 from public.deals d
          where d.id = deal_id and d.owner_id = auth.uid()
        )
      )
    )
  );

-- ---------------------------------------------------------------------------
-- deal_notes (staff only — clients use chat messages)
-- ---------------------------------------------------------------------------
create policy deal_notes_select on public.deal_notes
  for select to authenticated
  using (
    public.can_access_deal(deal_id)
    and (public.is_manager() or public.is_sales())
  );

create policy deal_notes_insert on public.deal_notes
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.can_access_deal(deal_id)
    and (public.is_manager() or public.is_sales())
  );
