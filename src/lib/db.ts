import { Pool, types } from "pg";
import type { Owner } from "@/lib/owners";

// Return SQL `date` columns as plain "YYYY-MM-DD" strings instead of
// pg's default JS Date objects, which get reinterpreted in the local
// server timezone and can shift the calendar day.
types.setTypeParser(types.builtins.DATE, (value) => value);

let pool: Pool | null = null;

function db() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (see .env.example)."
    );
  }
  pool = new Pool({ connectionString });
  return pool;
}

function tag(strings: TemplateStringsArray, ...values: unknown[]) {
  let text = strings[0];
  const params: unknown[] = [];
  values.forEach((v, i) => {
    params.push(v);
    text += `$${i + 1}` + strings[i + 1];
  });
  return db()
    .query(text, params)
    .then((res) => res.rows);
}

export type Item = {
  id: string;
  name: string;
  count: number;
  color: string;
  step: number;
  auto_tally: boolean;
  last_auto_date: string | null;
  owner: Owner;
  position: number;
  created_at: string;
  updated_at: string;
};

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function listItems(owner: Owner): Promise<Item[]> {
  // Catch up any auto-tally items for days that passed without the app
  // being opened, then return the current state of every item.
  //
  // "Today" is computed here in JS (always UTC) and passed in, rather
  // than using SQL's current_date, because current_date is evaluated in
  // whatever timezone the Postgres session happens to be configured
  // with (UTC on most managed hosts, but often the OS timezone on a
  // local install) — comparing that against a UTC-computed
  // last_auto_date could disagree on what day it is by one day.
  //
  // This runs as two separate statements rather than one `WITH ... AS
  // (UPDATE ... RETURNING ...) SELECT ... FROM items`, because Postgres
  // leaves it unspecified whether a query's main SELECT sees a data-
  // modifying CTE's own writes when it re-reads the same target table
  // directly instead of selecting from the CTE's output.
  const today = todayUTC();
  await tag`
    update items
    set
      count = count + (${today}::date - coalesce(last_auto_date, (created_at at time zone 'utc')::date)) * step,
      last_auto_date = ${today}::date,
      updated_at = now()
    where owner = ${owner}
      and auto_tally = true
      and (last_auto_date is null or last_auto_date < ${today}::date)
  `;
  const rows = await tag`
    select id, name, count, color, step, auto_tally, last_auto_date, owner, position, created_at, updated_at
    from items
    where owner = ${owner}
    order by position asc, created_at asc
  `;
  return rows as Item[];
}

export async function createItem(
  owner: Owner,
  input: {
    name: string;
    color: string;
    step: number;
    autoTally?: boolean;
  }
): Promise<Item> {
  const autoTally = input.autoTally ?? false;
  const lastAutoDate = autoTally ? todayUTC() : null;
  const rows = await tag`
    insert into items (name, color, step, auto_tally, last_auto_date, owner, position)
    values (
      ${input.name}, ${input.color}, ${input.step}, ${autoTally}, ${lastAutoDate}, ${owner},
      (select coalesce(max(position), -1) + 1 from items where owner = ${owner})
    )
    returning id, name, count, color, step, auto_tally, last_auto_date, owner, position, created_at, updated_at
  `;
  return (rows as unknown as Item[])[0];
}

export async function updateItem(
  owner: Owner,
  id: string,
  patch: {
    name?: string;
    color?: string;
    step?: number;
    delta?: number;
    count?: number;
    autoTally?: boolean;
  }
): Promise<Item | null> {
  const today = todayUTC();
  const rows = await tag`
    update items
    set
      name = coalesce(${patch.name ?? null}, name),
      color = coalesce(${patch.color ?? null}, color),
      step = coalesce(${patch.step ?? null}, step),
      count = case
        when ${patch.count ?? null}::int is not null then ${patch.count ?? null}
        when ${patch.delta ?? null}::int is not null then count + ${patch.delta ?? null}
        else count
      end,
      auto_tally = coalesce(${patch.autoTally ?? null}, auto_tally),
      last_auto_date = case
        when ${patch.autoTally ?? null} = true and auto_tally = false then ${today}::date
        else last_auto_date
      end,
      updated_at = now()
    where id = ${id} and owner = ${owner}
    returning id, name, count, color, step, auto_tally, last_auto_date, owner, position, created_at, updated_at
  `;
  return ((rows as unknown as Item[])[0] as Item | undefined) ?? null;
}

export async function deleteItem(owner: Owner, id: string): Promise<void> {
  await tag`delete from items where id = ${id} and owner = ${owner}`;
}

export async function reorderItems(
  owner: Owner,
  orderedIds: string[]
): Promise<void> {
  const positions = orderedIds.map((_, index) => index);
  await tag`
    update items as i
    set position = data.position, updated_at = now()
    from (
      select unnest(${orderedIds}::uuid[]) as id, unnest(${positions}::int[]) as position
    ) as data
    where i.id = data.id and i.owner = ${owner}
  `;
}
