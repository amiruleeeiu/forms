import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DATABASE_HOST ?? "localhost",
    port: Number(process.env.DATABASE_PORT ?? 5432),
    database: process.env.DATABASE_NAME ?? "form_db",
    user: process.env.DATABASE_USERNAME ?? "postgres",
    password: process.env.DATABASE_PASSWORD ?? "12345",
    ssl: false,
  },
});
