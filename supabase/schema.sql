create extension if not exists pgcrypto;
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_type text not null check (event_type in ('Wedding','Birthday','Community event','Other')),
  location text not null default '',
  event_date date,
  guest_count integer not null check (guest_count > 0),
  budget numeric(14,2) not null check (budget > 0),
  currency text not null default 'INR',
  requested_theme text not null default '',
  plan jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_created_at_idx on public.events (created_at desc);
alter table public.events enable row level security;

-- PRIVATE HACKATHON DEMO ONLY. Replace with authenticated user_id policies before public use.
create policy "Demo read events" on public.events for select to anon, authenticated using (true);
create policy "Demo insert events" on public.events for insert to anon, authenticated with check (true);
create policy "Demo update events" on public.events for update to anon, authenticated using (true) with check (true);
create policy "Demo delete events" on public.events for delete to anon, authenticated using (true);