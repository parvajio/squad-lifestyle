import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error seeding database:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Error seeding database:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
