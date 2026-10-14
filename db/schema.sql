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

alter table boards add column if not exists position integer;

update boards set position = sub.rn
from (
  select slug, row_number() over (order by created_at asc) - 1 as rn
  from boards
) as sub
where boards.slug = sub.slug and boards.position is null;

alter table boards alter column position set not null;
alter table boards alter column position set default 0;

create index if not exists boards_position_idx on boards (position);

-- "counter" items use count/step/auto_tally as before. "calendar"
-- items instead track which specific days were marked, in item_marks;
-- their count is kept in sync as a denormalized total (number of
-- marks) so every other part of the app that reads count (board
-- totals, CSV export) keeps working unchanged.
alter table items add column if not exists type text not null default 'counter';

create table if not exists item_marks (
  item_id uuid not null references items (id) on delete cascade,
  mark_date date not null,
  primary key (item_id, mark_date)
);

-- A day can carry a note without being marked (e.g. "sick, skipped
-- today"), so a row's existence no longer means "marked" on its own —
-- `marked` says whether the day counts toward the total, `note` is
-- independent of it. Existing rows predate this and were only ever
-- created because a day was marked, so they default to marked = true.
alter table item_marks add column if not exists marked boolean not null default true;
alter table item_marks add column if not exists note text;
