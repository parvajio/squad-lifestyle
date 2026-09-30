import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectToDatabase();

    const order = await Order.findById(id).populate({
      path: 'items.product',
      model: Product,
      select: 'title images originalPrice discountPrice',
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Admin can see any order; normal users can only see their own.
    if (session.user.role !== 'ADMIN') {
      const ownsById =
        !!session.user.id && order.userId && String(order.userId) === String(session.user.id);
      const ownsByEmail =
        !!session.user.email &&
        order.customerDetails?.email &&
        String(order.customerDetails.email).toLowerCase() ===
          String(session.user.email).toLowerCase();
      if (!ownsById && !ownsByEmail) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: unknown) {
    console.error('Failed to fetch order:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ['IN_REVIEW', 'IN_PROGRESS', 'CANCELLED', 'SUCCESSFUL'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid order status' }, { status: 400 });
    }

    await connectToDatabase();

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate({
      path: 'items.product',
      model: Product,
      select: 'title images originalPrice discountPrice',
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: unknown) {
    console.error('Failed to update order status:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
