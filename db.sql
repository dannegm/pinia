-- db.sql — canonical schema for Guasave (Supabase / PostgreSQL, schema `guasave`)
-- This file is the single source of truth for recreating the database from scratch.
-- It is NOT a migration history — it always reflects the current desired state.
-- Changes go through /migrate (creates migrations/NNN_*.sql AND updates this file).

create schema if not exists guasave;

create extension if not exists pgcrypto;

-- Tablas

create table if not exists guasave.categories (
  id text primary key, -- client-generated nanoid(8)
  name text not null,
  icon jsonb not null,
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists guasave.places (
  id text primary key, -- client-generated nanoid(8)
  name text not null,
  category_id text references guasave.categories(id) on delete cascade,
  address text,
  lat double precision not null,
  lng double precision not null,
  hours text,
  notes text,
  is_favorite boolean not null default false,
  is_beacon boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists guasave.system_places (
  key text primary key,
  place_id text references guasave.places(id) on delete cascade
);

-- Índices

create index if not exists idx_places_category_id on guasave.places (category_id);

-- Row Level Security

alter table guasave.categories enable row level security;
create policy "categories: permitir todo"
  on guasave.categories for all using (true) with check (true);

alter table guasave.places enable row level security;
create policy "places: permitir todo"
  on guasave.places for all using (true) with check (true);

alter table guasave.system_places enable row level security;
create policy "system_places: permitir todo"
  on guasave.system_places for all using (true) with check (true);

-- Grants (sin auth: anon y authenticated tienen acceso completo)

grant usage on schema guasave to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema guasave to anon, authenticated;
grant usage, select on all sequences in schema guasave to anon, authenticated;

alter default privileges in schema guasave
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema guasave
  grant usage, select on sequences to anon, authenticated;
