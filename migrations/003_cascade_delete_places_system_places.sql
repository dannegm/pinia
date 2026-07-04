-- Migration 003 — Cascade deletes: places on category delete, system_places on place delete
-- Run in Supabase SQL Editor

alter table pinia.places drop constraint if exists places_category_id_fkey;
alter table pinia.places
  add constraint places_category_id_fkey
  foreign key (category_id) references pinia.categories(id) on delete cascade;

alter table pinia.system_places drop constraint if exists system_places_place_id_fkey;
alter table pinia.system_places
  add constraint system_places_place_id_fkey
  foreign key (place_id) references pinia.places(id) on delete cascade;
