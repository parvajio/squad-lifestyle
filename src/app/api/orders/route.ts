import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/db';
import Order from '@/lib/models/Order';
import Product from '@/lib/models/Product';
import Settings, { DEFAULT_DELIVERY_CHARGES } from '@/lib/models/Settings';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET orders:
// - ADMIN: all orders with optional status filter
// - USER (normal user): only their own orders (matched by userId, fallback to account email)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    const filter: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== 'ALL') {
      filter.status = statusFilter;
    }

    if (session.user.role !== 'ADMIN') {
      // Normal users can only see their own order information.
      const orConditions: Record<string, unknown>[] = [];
      if (session.user.id && Types.ObjectId.isValid(session.user.id)) {
        orConditions.push({ userId: session.user.id });
      }
      if (session.user.email) {
        orConditions.push({ 'customerDetails.email': session.user.email.toLowerCase() });
      }
      if (orConditions.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }
      filter.$or = orConditions;
    }

    const orders = await Order.find(filter)
      .populate({
        path: 'items.product',
        model: Product,
        select: 'title images originalPrice discountPrice',
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: unknown) {
    console.error('Failed to fetch orders:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

// POST create order (Public Checkout, linked to account when logged in)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { customerDetails, items, deliveryType } = body;

    if (!customerDetails || !customerDetails.name || !customerDetails.number || !customerDetails.address || !customerDetails.email) {
      return NextResponse.json({ success: false, error: 'Complete customer details are required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must contain at least one item' }, { status: 400 });
    }

    await connectToDatabase();

    // Resolve delivery charge from admin-managed settings (never trust client amount)
    const normalizedDeliveryType: 'dhaka' | 'outside' =
      deliveryType === 'outside' ? 'outside' : 'dhaka';
    let dhakaCharge = DEFAULT_DELIVERY_CHARGES.dhaka;
    let outsideCharge = DEFAULT_DELIVERY_CHARGES.outside;
    try {
      const settingsDoc = await Settings.findOne({ key: 'delivery' }).lean();
      if (settingsDoc) {
        dhakaCharge = settingsDoc.dhakaDeliveryCharge ?? dhakaCharge;
        outsideCharge = settingsDoc.outsideDhakaDeliveryCharge ?? outsideCharge;
      }
    } catch {
      // use defaults
    }
    const deliveryCharge =
      normalizedDeliveryType === 'dhaka' ? dhakaCharge : outsideCharge;

    // Verify products & calculate subtotal
    let subtotalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const productDoc = await Product.findById(item.product);
      if (!productDoc) {
        return NextResponse.json({ success: false, error: `Product not found: ${item.product}` }, { status: 404 });
      }

      const activePrice = productDoc.discountPrice ?? productDoc.originalPrice;
      const quantity = Math.max(1, Number(item.quantity) || 1);
      subtotalAmount += activePrice * quantity;

      orderItems.push({
        product: productDoc._id,
        quantity,
        selectedSize: item.selectedSize || undefined,
        priceAtPurchase: activePrice,
      });
    }

    const totalAmount = subtotalAmount + deliveryCharge;

    const order = await Order.create({
      ...(session?.user?.id && Types.ObjectId.isValid(session.user.id)
        ? { userId: session.user.id }
        : {}),
      customerDetails: {
        name: customerDetails.name,
        number: customerDetails.number,
        address: customerDetails.address,
        email: customerDetails.email.toLowerCase(),
      },
      items: orderItems,
      subtotalAmount,
      deliveryType: normalizedDeliveryType,
      deliveryCharge,
      totalAmount,
      status: 'IN_REVIEW', // Default status as requested
    });

    const populatedOrder = await Order.findById(order._id).populate({
      path: 'items.product',
      model: Product,
      select: 'title images',
    });

    return NextResponse.json({ success: true, data: populatedOrder }, { status: 201 });
  } catch (error: unknown) {
    console.error('Failed to place order:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
