import { createPool } from '@vercel/postgres';

let pool;

export function getDB() {
  if (!pool) {
    pool = createPool({
      connectionString: process.env.POSTGRES_URL, // set di Vercel env
    });
  }
  return pool;
}
