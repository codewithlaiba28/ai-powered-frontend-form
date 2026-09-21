import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb, Registration } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication header or cookie
    const authHeader = req.headers.get('x-admin-password');
    const authCookie = req.cookies.get('admin_auth')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (authHeader !== adminPassword && authCookie !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    await initDb();
    const sql = getDb();

    // Query all registrations, newest first
    const registrations = await sql`
      SELECT id, name, whatsapp, email, city, format, transaction_id, screenshot_url, status, created_at
      FROM registrations
      ORDER BY created_at DESC;
    ` as Registration[];

    return NextResponse.json({ success: true, registrations });
  } catch (error: any) {
    console.error('Failed to fetch registrations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch registrations.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('x-admin-password');
    const authCookie = req.cookies.get('admin_auth')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (authHeader !== adminPassword && authCookie !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !['pending', 'confirmed', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid id or status value.' }, { status: 400 });
    }

    const sql = getDb();
    const updated = await sql`
      UPDATE registrations
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id, status;
    `;

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Registration record not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, registration: updated[0] });
  } catch (error: any) {
    console.error('Failed to update status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update registration status.' },
      { status: 500 }
    );
  }
}
