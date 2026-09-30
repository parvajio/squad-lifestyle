import { NextResponse } from 'next/server';
import connectToDatabase, { getDbInfo } from '@/lib/db';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';

export async function GET() {
  try {
    await connectToDatabase();
    const info = getDbInfo();
    const [productCount, categoryCount] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
    ]);
    return NextResponse.json({
      success: true,
      ...info,
      productCount,
      categoryCount,
      allowMemoryFallback: process.env.ALLOW_MEMORY_FALLBACK === '1',
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        success: false,
        error: errMessage,
        hint: 'Atlas > Network Access > add 0.0.0.0/0 for Vercel; whitelist your IP locally. Verify MONGODB_URI includes /squad_lifestyle.',
      },
      { status: 500 }
    );
  }
}
