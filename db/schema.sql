-- Tally app schema (Postgres / Neon)

create extension if not exists pgcrypto;

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  count integer not null default 0,
  color text not null default '#c98a3f',
  step integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_created_at_idx on items (created_at);
