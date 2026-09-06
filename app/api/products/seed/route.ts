import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Auto-seeding disabled. Catalog starts empty for Admin management.' });
}
