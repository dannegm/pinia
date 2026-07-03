-- Migration 002 — Change id columns from uuid to text (client-generated nanoid(8) ids)
-- Run in Supabase SQL Editor
-- Assumes categories, places, and system_places are already empty — data is
-- re-imported separately with new nanoid(8) ids after this runs.

alter table guasave.places drop constraint if exists places_category_id_fkey;
alter table guasave.system_places drop constraint if exists system_places_place_id_fkey;

alter table guasave.categories alter column id type text;
alter table guasave.categories alter column id drop default;

alter table guasave.places alter column id type text;
alter table guasave.places alter column id drop default;
alter table guasave.places alter column category_id type text;

alter table guasave.system_places alter column place_id type text;

alter table guasave.places
  add constraint places_category_id_fkey foreign key (category_id) references guasave.categories(id);
alter table guasave.system_places
  add constraint system_places_place_id_fkey foreign key (place_id) references guasave.places(id);
