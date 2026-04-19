import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// ---------------------------------------------------------------------------
// Singleton pattern — safe for Next.js (both dev hot-reload and serverless)
// ---------------------------------------------------------------------------

declare global {
  var __postgres_client: postgres.Sql | undefined;
}

function createClient(): postgres.Sql {
  return postgres({
    host: process.env.DATABASE_HOST ?? "localhost",
    port: Number(process.env.DATABASE_PORT ?? 5432),
    database: process.env.DATABASE_NAME ?? "form_db",
    username: process.env.DATABASE_USERNAME ?? "postgres",
    password: process.env.DATABASE_PASSWORD ?? "12345",
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const sql =
  process.env.NODE_ENV === "production"
    ? createClient()
    : (globalThis.__postgres_client ??= createClient());

export const db = drizzle(sql, { schema });
export { sql as pgClient };
