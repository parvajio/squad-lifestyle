import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Settings, { DEFAULT_DELIVERY_CHARGES } from '@/lib/models/Settings';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET delivery charges (Public — needed at checkout)
export async function GET() {
  try {
    await connectToDatabase();
    let doc = await Settings.findOne({ key: 'delivery' });
    if (!doc) {
      doc = await Settings.create({
        key: 'delivery',
        dhakaDeliveryCharge: DEFAULT_DELIVERY_CHARGES.dhaka,
        outsideDhakaDeliveryCharge: DEFAULT_DELIVERY_CHARGES.outside,
      });
    }
    return NextResponse.json({
      success: true,
      data: {
        dhaka: doc.dhakaDeliveryCharge,
        outside: doc.outsideDhakaDeliveryCharge,
      },
    });
  } catch (error: unknown) {
    // Return defaults so checkout never breaks when DB is unreachable
    return NextResponse.json({
      success: true,
      data: { ...DEFAULT_DELIVERY_CHARGES },
      fallback: true,
    });
  }
}

// PUT update delivery charges (Admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const dhaka = Number(body.dhaka);
    const outside = Number(body.outside);

    if (!Number.isFinite(dhaka) || dhaka < 0 || !Number.isFinite(outside) || outside < 0) {
      return NextResponse.json(
        { success: false, error: 'Both charges must be valid non-negative numbers' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const doc = await Settings.findOneAndUpdate(
      { key: 'delivery' },
      { dhakaDeliveryCharge: dhaka, outsideDhakaDeliveryCharge: outside },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        dhaka: doc.dhakaDeliveryCharge,
        outside: doc.outsideDhakaDeliveryCharge,
      },
    });
  } catch (error: unknown) {
    console.error('Failed to update delivery charges:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
