import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
const schema = readFileSync(schemaPath, "utf8");

const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

const client = new Client({ connectionString });
await client.connect();

try {
  for (const statement of statements) {
    await client.query(statement);
    console.log("Ran:", statement.split("\n")[0]);
  }
  console.log("Migration complete.");
} finally {
  await client.end();
}
