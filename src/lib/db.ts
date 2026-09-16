import { Pool, types } from "pg";
import { slugify } from "@/lib/boards";

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

const POSTGRES_UNIQUE_VIOLATION = "23505";

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === POSTGRES_UNIQUE_VIOLATION
  );
}

export type Board = {
  slug: string;
  name: string;
  position: number;
  created_at: string;
};

export type Item = {
  id: string;
  name: string;
  count: number;
  color: string;
  step: number;
  auto_tally: boolean;
  last_auto_date: string | null;
  board: string;
  position: number;
  created_at: string;
  updated_at: string;
};

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function listBoards(): Promise<Board[]> {
  const rows = await tag`
    select slug, name, position, created_at
    from boards
    order by position asc, created_at asc
  `;
  return rows as Board[];
}

export async function getBoard(slug: string): Promise<Board | null> {
  const rows = await tag`
    select slug, name, position, created_at
    from boards
    where slug = ${slug}
  `;
  return ((rows as unknown as Board[])[0] as Board | undefined) ?? null;
}

export async function createBoard(name: string): Promise<Board> {
  const trimmed = name.trim();
  const baseSlug = slugify(trimmed) || "board";

  let slug = baseSlug;
  for (let attempt = 2; attempt <= 21; attempt++) {
    try {
      const rows = await tag`
        insert into boards (slug, name, position)
        values (${slug}, ${trimmed}, (select coalesce(max(position), -1) + 1 from boards))
        returning slug, name, position, created_at
      `;
      return (rows as unknown as Board[])[0];
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      slug = `${baseSlug}-${attempt}`;
    }
  }
  throw new Error("Could not generate a unique board slug");
}

export async function renameBoard(
  slug: string,
  name: string
): Promise<Board | null> {
  const trimmed = name.trim();
  const rows = await tag`
    update boards
    set name = ${trimmed}
    where slug = ${slug}
    returning slug, name, position, created_at
  `;
  return ((rows as unknown as Board[])[0] as Board | undefined) ?? null;
}

export async function deleteBoard(slug: string): Promise<void> {
  await tag`delete from items where owner = ${slug}`;
  await tag`delete from boards where slug = ${slug}`;
}

export async function reorderBoards(orderedSlugs: string[]): Promise<void> {
  const positions = orderedSlugs.map((_, index) => index);
  await tag`
    update boards as b
    set position = data.position
    from (
      select unnest(${orderedSlugs}::text[]) as slug, unnest(${positions}::int[]) as position
    ) as data
    where b.slug = data.slug
  `;
}

export async function listItems(board: string): Promise<Item[]> {
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
    where owner = ${board}
      and auto_tally = true
      and (last_auto_date is null or last_auto_date < ${today}::date)
  `;
  const rows = await tag`
    select id, name, count, color, step, auto_tally, last_auto_date, owner as board, position, created_at, updated_at
    from items
    where owner = ${board}
    order by position asc, created_at asc
  `;
  return rows as Item[];
}

export async function createItem(
  board: string,
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
      ${input.name}, ${input.color}, ${input.step}, ${autoTally}, ${lastAutoDate}, ${board},
      (select coalesce(max(position), -1) + 1 from items where owner = ${board})
    )
    returning id, name, count, color, step, auto_tally, last_auto_date, owner as board, position, created_at, updated_at
  `;
  return (rows as unknown as Item[])[0];
}

export async function updateItem(
  board: string,
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
    where id = ${id} and owner = ${board}
    returning id, name, count, color, step, auto_tally, last_auto_date, owner as board, position, created_at, updated_at
  `;
  return ((rows as unknown as Item[])[0] as Item | undefined) ?? null;
}

export async function deleteItem(board: string, id: string): Promise<void> {
  await tag`delete from items where id = ${id} and owner = ${board}`;
}

export async function reorderItems(
  board: string,
  orderedIds: string[]
): Promise<void> {
  const positions = orderedIds.map((_, index) => index);
  await tag`
    update items as i
    set position = data.position, updated_at = now()
    from (
      select unnest(${orderedIds}::uuid[]) as id, unnest(${positions}::int[]) as position
    ) as data
    where i.id = data.id and i.owner = ${board}
  `;
}
