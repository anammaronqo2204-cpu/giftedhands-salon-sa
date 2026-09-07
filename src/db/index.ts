import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getConnectionString } from "@netlify/database";

// Netlify Database auto-provisions Postgres and wires up the connection
// string per environment (production vs. deploy-preview branches). Falling
// back to a manually-set DATABASE_URL keeps local/non-Netlify dev working.
const databaseUrl = process.env.DATABASE_URL || getConnectionString();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
