create extension if not exists "pgcrypto";

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  region text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  flight_number text not null,
  departure_airport text not null,
  arrival_airport text not null,
  route text not null,
  status text not null default 'pending' check (status in ('ready', 'pending', 'alert')),
  eta text not null,
  aircraft text not null,
  created_at timestamptz not null default now()
);

alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.flights enable row level security;

create policy "tenant members can read their tenants"
on public.tenants
for select
using (
  exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = tenants.id
      and tm.user_id = auth.uid()
  )
);

create policy "users can read their own memberships"
on public.tenant_memberships
for select
using (user_id = auth.uid());

create policy "tenant members can read their flights"
on public.flights
for select
using (
  exists (
    select 1
    from public.tenant_memberships tm
    where tm.tenant_id = flights.tenant_id
      and tm.user_id = auth.uid()
  )
);

insert into public.tenants (slug, name, region)
values
  ('northstar', 'Northstar Air', 'North America'),
  ('atlantic', 'Atlantic Air', 'Atlantic'),
  ('pacific', 'Pacific Air', 'Pacific Rim')
on conflict (slug) do nothing;

insert into public.flights (tenant_id, flight_number, departure_airport, arrival_airport, route, status, eta, aircraft)
select t.id, 'F-102', 'SFO', 'JFK', 'SFO → JFK', 'ready', '08:45', 'A320'
from public.tenants t where t.slug = 'northstar'
on conflict do nothing;

insert into public.flights (tenant_id, flight_number, departure_airport, arrival_airport, route, status, eta, aircraft)
select t.id, 'F-204', 'SEA', 'DEN', 'SEA → DEN', 'pending', '11:20', 'B737'
from public.tenants t where t.slug = 'northstar'
on conflict do nothing;

insert into public.flights (tenant_id, flight_number, departure_airport, arrival_airport, route, status, eta, aircraft)
select t.id, 'A-441', 'LHR', 'JFK', 'LHR → JFK', 'ready', '09:10', 'A350'
from public.tenants t where t.slug = 'atlantic'
on conflict do nothing;

insert into public.flights (tenant_id, flight_number, departure_airport, arrival_airport, route, status, eta, aircraft)
select t.id, 'A-772', 'CDG', 'DXB', 'CDG → DXB', 'alert', '12:40', 'A330'
from public.tenants t where t.slug = 'atlantic'
on conflict do nothing;

insert into public.flights (tenant_id, flight_number, departure_airport, arrival_airport, route, status, eta, aircraft)
select t.id, 'P-918', 'HND', 'SFO', 'HND → SFO', 'pending', '10:45', 'A321neo'
from public.tenants t where t.slug = 'pacific'
on conflict do nothing;

insert into public.flights (tenant_id, flight_number, departure_airport, arrival_airport, route, status, eta, aircraft)
select t.id, 'P-315', 'SYD', 'LAX', 'SYD → LAX', 'ready', '14:25', 'B787'
from public.tenants t where t.slug = 'pacific'
on conflict do nothing;
