import { neon } from '@neondatabase/serverless';

export interface Registration {
  id: number;
  name: string;
  whatsapp: string;
  email: string | null;
  city: string;
  format: 'Live + Recorded Classes' | 'Live Classes' | 'Recorded' | string;
  transaction_id: string;
  screenshot_url: string | null;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
}

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not configured.');
  }
  return neon(databaseUrl);
}

/**
 * Ensures the registrations table exists in Neon Postgres.
 */
export async function initDb() {
  try {
    const sql = getDb();
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        email TEXT,
        city TEXT NOT NULL,
        format TEXT NOT NULL,
        transaction_id TEXT NOT NULL,
        screenshot_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return { success: true };
  } catch (error: any) {
    console.error('Failed to initialize database table:', error);
    return { success: false, error: error.message };
  }
}
