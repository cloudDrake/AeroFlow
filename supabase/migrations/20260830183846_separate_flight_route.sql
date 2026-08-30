alter table public.flights
  add column if not exists departure_airport text,
  add column if not exists arrival_airport text;

update public.flights
set
  departure_airport = split_part(route, '→', 1),
  arrival_airport = split_part(route, '→', 2)
where departure_airport is null or arrival_airport is null;

alter table public.flights
  alter column departure_airport set not null,
  alter column arrival_airport set not null;