import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function GET() {
  const result = await initDb();
  if (result.success) {
    return NextResponse.json({ message: 'Database initialized successfully' });
  } else {
    return NextResponse.json(
      { error: 'Failed to initialize database', details: result.error },
      { status: 500 }
    );
  }
}
