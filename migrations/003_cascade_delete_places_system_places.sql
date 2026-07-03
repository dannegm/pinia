-- Migration 003 — Cascade deletes: places on category delete, system_places on place delete
-- Run in Supabase SQL Editor

alter table guasave.places drop constraint if exists places_category_id_fkey;
alter table guasave.places
  add constraint places_category_id_fkey
  foreign key (category_id) references guasave.categories(id) on delete cascade;

alter table guasave.system_places drop constraint if exists system_places_place_id_fkey;
alter table guasave.system_places
  add constraint system_places_place_id_fkey
  foreign key (place_id) references guasave.places(id) on delete cascade;
