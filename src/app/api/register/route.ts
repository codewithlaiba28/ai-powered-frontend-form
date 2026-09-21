import { NextRequest, NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const name = (formData.get('name') as string)?.trim();
    const whatsapp = (formData.get('whatsapp') as string)?.trim();
    const email = (formData.get('email') as string)?.trim() || null;
    const city = (formData.get('city') as string)?.trim();
    const format = (formData.get('format') as string)?.trim();
    const transactionId = (formData.get('transaction_id') as string)?.trim();
    const screenshotFile = formData.get('screenshot') as File | null;

    // Server-side validation
    if (!name) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }
    if (!whatsapp) {
      return NextResponse.json({ error: 'WhatsApp number is required.' }, { status: 400 });
    }
    // Numeric check for WhatsApp
    const digitsOnly = whatsapp.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 9) {
      return NextResponse.json({ error: 'Please enter a valid WhatsApp number (at least 9 digits).' }, { status: 400 });
    }

    if (!city) {
      return NextResponse.json({ error: 'City is required.' }, { status: 400 });
    }
    if (!format || (format !== 'Live + Recorded Classes' && format !== 'Live Classes' && format !== 'Recorded')) {
      return NextResponse.json({ error: 'Please select a valid course format.' }, { status: 400 });
    }
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID / Reference Number is required.' }, { status: 400 });
    }

    let screenshotUrl: string | null = null;

    // Handle Screenshot File Upload (max 5MB, image only)
    if (screenshotFile && screenshotFile.size > 0) {
      if (screenshotFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Screenshot file size exceeds 5MB limit.' }, { status: 400 });
      }

      if (!screenshotFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Uploaded file must be an image.' }, { status: 400 });
      }

      const bytes = await screenshotFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });
        
        const ext = screenshotFile.name.split('.').pop() || 'jpg';
        const sanitizedExt = ext.replace(/[^a-zA-Z0-9]/g, '');
        const filename = `screenshot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${sanitizedExt}`;
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);
        screenshotUrl = `/uploads/${filename}`;
      } catch (fileErr) {
        console.warn('Local disk file write failed, converting to Data URI fallback:', fileErr);
        const base64 = buffer.toString('base64');
        screenshotUrl = `data:${screenshotFile.type};base64,${base64}`;
      }
    }

    // Ensure database table exists
    await initDb();

    // Insert registration into Neon Postgres
    const sql = getDb();
    const result = await sql`
      INSERT INTO registrations (
        name,
        whatsapp,
        email,
        city,
        format,
        transaction_id,
        screenshot_url,
        status
      ) VALUES (
        ${name},
        ${whatsapp},
        ${email},
        ${city},
        ${format},
        ${transactionId},
        ${screenshotUrl},
        'pending'
      )
      RETURNING id, created_at;
    `;

    return NextResponse.json({
      success: true,
      registrationId: result[0]?.id,
      name,
      message: 'Registration submitted successfully'
    });

  } catch (error: any) {
    console.error('Registration processing error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while processing your registration. Please try again.' },
      { status: 500 }
    );
  }
}
