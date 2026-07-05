-- Migration 004 — Add is_visible and is_secret to categories
-- Run in Supabase SQL Editor

alter table pinia.categories
  add column if not exists is_visible boolean not null default true,
  add column if not exists is_secret boolean not null default false;
