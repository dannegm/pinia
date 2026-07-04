-- Migration 001 — Create initial schema (pinia, categories, places, system_places)
-- Run in Supabase SQL Editor

create schema if not exists pinia;

create extension if not exists pgcrypto;

-- Tablas

create table if not exists pinia.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon jsonb not null,
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists pinia.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references pinia.categories(id),
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

create table if not exists pinia.system_places (
  key text primary key,
  place_id uuid references pinia.places(id)
);

-- Índices

create index if not exists idx_places_category_id on pinia.places (category_id);

-- Row Level Security

alter table pinia.categories enable row level security;
create policy "categories: permitir todo"
  on pinia.categories for all using (true) with check (true);

alter table pinia.places enable row level security;
create policy "places: permitir todo"
  on pinia.places for all using (true) with check (true);

alter table pinia.system_places enable row level security;
create policy "system_places: permitir todo"
  on pinia.system_places for all using (true) with check (true);

-- Grants (sin auth: anon y authenticated tienen acceso completo)

grant usage on schema pinia to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema pinia to anon, authenticated;
grant usage, select on all sequences in schema pinia to anon, authenticated;

alter default privileges in schema pinia
  grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema pinia
  grant usage, select on sequences to anon, authenticated;
