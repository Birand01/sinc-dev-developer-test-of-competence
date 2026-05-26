-- 003_seed.sql — step by step
-- FIRST: Supabase → Authentication → Users → create manager@studentcrm.test (see .cursor/SEED.md)

-- Step 1: Manager profile (id matches auth.users)
insert into public.profiles (id, full_name, role)
select u.id, 'Demo Manager', 'manager'::app_role
from auth.users u
where u.email = 'manager@studentcrm.test'
on conflict (id) do update
  set full_name = excluded.full_name,
      role = excluded.role;

-- FIRST: Supabase → Authentication → Users → create sales@studentcrm.test (see .cursor/SEED.md)

-- Step 2: Sales profile (id matches auth.users)
insert into public.profiles (id, full_name, role)
select u.id, 'Demo Sales', 'sales'::app_role
from auth.users u
where u.email = 'sales@studentcrm.test'
on conflict (id) do update
  set full_name = excluded.full_name,
      role = excluded.role;

-- FIRST: Supabase → Authentication → Users → create client@studentcrm.test (see .cursor/SEED.md)

-- Step 3: Client profile (id matches auth.users)
insert into public.profiles (id, full_name, role)
select u.id, 'Demo Client', 'client'::app_role
from auth.users u
where u.email = 'client@studentcrm.test'
on conflict (id) do update
  set full_name = excluded.full_name,
      role = excluded.role;

-- Step 4: CRM client records (requires Steps 1–3 profiles + Auth users)

-- Step 4a: Client linked to Demo Client login (profile_id = client auth user)
insert into public.clients (id, profile_id, full_name, email, phone, country, target_country, created_by)
select
  'a0000000-0000-4000-8000-000000000001'::uuid,
  (select id from auth.users where email = 'client@studentcrm.test'),
  'Demo Client',
  'client@studentcrm.test',
  '+90 555 000 0001',
  'Turkey',
  'Germany',
  (select id from auth.users where email = 'sales@studentcrm.test')
on conflict (id) do nothing;

-- Step 4b: Lead without login (unassigned profile_id)
insert into public.clients (id, profile_id, full_name, email, phone, country, target_country, created_by)
select
  'a0000000-0000-4000-8000-000000000002'::uuid,
  null,
  'Ayşe Yılmaz',
  'ayse.lead@example.com',
  '+90 555 000 0002',
  'Turkey',
  'UK',
  (select id from auth.users where email = 'sales@studentcrm.test')
on conflict (id) do nothing;

-- Step 5: Conversation threads (requires Step 4 clients)

insert into public.conversation_threads (id, client_id, assigned_to, subject, status)
values
  (
    'b0000000-0000-4000-8000-000000000001'::uuid,
    'a0000000-0000-4000-8000-000000000001'::uuid,
    (select id from auth.users where email = 'sales@studentcrm.test'),
    'Germany study visa questions',
    'open'::conversation_status
  ),
  (
    'b0000000-0000-4000-8000-000000000002'::uuid,
    'a0000000-0000-4000-8000-000000000002'::uuid,
    null,
    'New lead — UK intake',
    'open'::conversation_status
  )
on conflict (id) do nothing;

-- Step 6: Chat messages (requires Step 5 threads)

insert into public.conversation_messages (id, thread_id, sender_id, sender_type, body)
select
  'c0000000-0000-4000-8000-000000000001'::uuid,
  'b0000000-0000-4000-8000-000000000001'::uuid,
  (select id from auth.users where email = 'client@studentcrm.test'),
  'client'::message_sender_type,
  'Hi, I need help with my application timeline.'
on conflict (id) do nothing;

insert into public.conversation_messages (id, thread_id, sender_id, sender_type, body)
select
  'c0000000-0000-4000-8000-000000000002'::uuid,
  'b0000000-0000-4000-8000-000000000001'::uuid,
  (select id from auth.users where email = 'sales@studentcrm.test'),
  'team'::message_sender_type,
  'Happy to help — let us review your documents this week.'
on conflict (id) do nothing;

-- Step 7: Deal pipeline sample (requires Step 4a client + sales user)

insert into public.deals (id, client_id, owner_id, title, stage, value_amount, value_currency, expected_intake)
values
  (
    'd0000000-0000-4000-8000-000000000001'::uuid,
    'a0000000-0000-4000-8000-000000000001'::uuid,
    (select id from auth.users where email = 'sales@studentcrm.test'),
    'Germany — Fall 2026 intake',
    'consultation_booked'::deal_stage,
    2500.00,
    'EUR',
    '2026-09'
  )
on conflict (id) do nothing;

insert into public.deal_stage_history (id, deal_id, from_stage, to_stage, changed_by)
select
  'e0000000-0000-4000-8000-000000000001'::uuid,
  'd0000000-0000-4000-8000-000000000001'::uuid,
  'new_lead'::deal_stage,
  'contacted'::deal_stage,
  (select id from auth.users where email = 'sales@studentcrm.test')
on conflict (id) do nothing;

insert into public.deal_stage_history (id, deal_id, from_stage, to_stage, changed_by)
select
  'e0000000-0000-4000-8000-000000000002'::uuid,
  'd0000000-0000-4000-8000-000000000001'::uuid,
  'contacted'::deal_stage,
  'consultation_booked'::deal_stage,
  (select id from auth.users where email = 'sales@studentcrm.test')
on conflict (id) do nothing;

insert into public.deal_notes (id, deal_id, author_id, body)
select
  'f0000000-0000-4000-8000-000000000001'::uuid,
  'd0000000-0000-4000-8000-000000000001'::uuid,
  (select id from auth.users where email = 'sales@studentcrm.test'),
  'Client prefers evening calls. Consultation booked for Thursday.'
on conflict (id) do nothing;
