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

alter table items add column if not exists auto_tally boolean not null default false;
alter table items add column if not exists last_auto_date date;

-- Two personal boards, not a real multi-tenant user system: existing
-- rows (created before this column existed) default to 'pogi'.
alter table items add column if not exists owner text not null default 'pogi';

alter table items add column if not exists position integer;

update items set position = sub.rn
from (
  select id, row_number() over (partition by owner order by created_at asc) - 1 as rn
  from items
) as sub
where items.id = sub.id and items.position is null;

alter table items alter column position set not null;
alter table items alter column position set default 0;

create index if not exists items_created_at_idx on items (created_at);
create index if not exists items_owner_idx on items (owner);
create index if not exists items_owner_position_idx on items (owner, position);

-- Boards replace the old fixed "pogi"/"ganda" pages: any number of
-- named boards can exist now. items.owner stores a board's slug (the
-- column keeps its original name to avoid an unnecessary rename of an
-- already-populated production column, but the app layer presents it
-- as "board" everywhere it's user-facing).
create table if not exists boards (
  slug text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

insert into boards (slug, name) values ('pogi', 'Pogi'), ('ganda', 'Ganda')
on conflict (slug) do nothing;
