import { Pool } from "pg";

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
  created_at: string;
  updated_at: string;
};

export async function listItems(): Promise<Item[]> {
  const rows = await tag`
    select id, name, count, color, step, created_at, updated_at
    from items
    order by created_at asc
  `;
  return rows as Item[];
}

export async function createItem(input: {
  name: string;
  color: string;
  step: number;
}): Promise<Item> {
  const rows = await tag`
    insert into items (name, color, step)
    values (${input.name}, ${input.color}, ${input.step})
    returning id, name, count, color, step, created_at, updated_at
  `;
  return (rows as unknown as Item[])[0];
}

export async function updateItem(
  id: string,
  patch: { name?: string; color?: string; step?: number; delta?: number; count?: number }
): Promise<Item | null> {
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
      updated_at = now()
    where id = ${id}
    returning id, name, count, color, step, created_at, updated_at
  `;
  return ((rows as unknown as Item[])[0] as Item | undefined) ?? null;
}

export async function deleteItem(id: string): Promise<void> {
  await tag`delete from items where id = ${id}`;
}
