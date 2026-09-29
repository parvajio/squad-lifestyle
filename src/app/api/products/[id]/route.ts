import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

function slugify(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
  return slug || 'product';
}

async function ensureUniqueSlug(base: string, excludeId: string): Promise<string> {
  let slug = base;
  let counter = 1;
  for (;;) {
    const existing = await Product.findOne({ slug, _id: { $ne: excludeId } }).select('_id');
    if (!existing) return slug;
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

function sanitizeImages(images: unknown): string[] | undefined {
  if (images === undefined) return undefined;
  if (!Array.isArray(images)) return [];
  const cleaned = images
    .filter((u): u is string => typeof u === 'string')
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\/.+/.test(u));
  return [...new Set(cleaned)].slice(0, 6);
}

function sanitizeSizes(sizes: unknown): string[] | undefined {
  if (sizes === undefined) return undefined;
  if (!Array.isArray(sizes)) return [];
  return [
    ...new Set(
      sizes
        .filter((s): s is string => typeof s === 'string')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    ),
  ].slice(0, 20);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!OBJECT_ID_RE.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product id' }, { status: 400 });
    }
    await connectToDatabase();

    const product = await Product.findById(id).populate('category', 'name slug');
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: unknown) {
    console.error('Failed to fetch product:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!OBJECT_ID_RE.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product id' }, { status: 400 });
    }

    const body = await req.json();
    const { title, description, category, originalPrice, discountPrice, images, sizes, inStock } = body;

    await connectToDatabase();

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) {
      if (!String(title).trim()) {
        return NextResponse.json({ success: false, error: 'Title cannot be empty' }, { status: 400 });
      }
      updateData.title = String(title).trim();
      updateData.slug = await ensureUniqueSlug(slugify(String(title)), id);
    }

    if (description !== undefined) updateData.description = String(description).trim();

    if (category !== undefined) {
      if (!OBJECT_ID_RE.test(String(category))) {
        return NextResponse.json({ success: false, error: 'Invalid category id' }, { status: 400 });
      }
      const categoryDoc = await Category.findById(category).select('_id');
      if (!categoryDoc) {
        return NextResponse.json({ success: false, error: 'Category not found' }, { status: 400 });
      }
      updateData.category = categoryDoc._id;
    }

    let finalOriginal: number | undefined;
    if (originalPrice !== undefined) {
      finalOriginal = Number(originalPrice);
      if (!Number.isFinite(finalOriginal) || finalOriginal < 0) {
        return NextResponse.json(
          { success: false, error: 'Original price must be a non-negative number' },
          { status: 400 }
        );
      }
      updateData.originalPrice = finalOriginal;
    }

    if (discountPrice !== undefined && discountPrice !== '' && discountPrice !== null) {
      const parsedDiscount = Number(discountPrice);
      if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0) {
        return NextResponse.json(
          { success: false, error: 'Discount price must be a non-negative number' },
          { status: 400 }
        );
      }
      // If original price is also being updated, compare against the new value;
      // otherwise compare against the stored value.
      const compareBase =
        finalOriginal ??
        (await Product.findById(id).select('originalPrice'))?.originalPrice;
      if (compareBase !== undefined && parsedDiscount >= Number(compareBase)) {
        return NextResponse.json(
          { success: false, error: 'Discount price must be less than original price' },
          { status: 400 }
        );
      }
      updateData.discountPrice = parsedDiscount;
    } else if (discountPrice !== undefined) {
      updateData.$unset = { discountPrice: 1 };
    }

    const cleanImages = sanitizeImages(images);
    if (cleanImages !== undefined) updateData.images = cleanImages;

    const cleanSizes = sanitizeSizes(sizes);
    if (cleanSizes !== undefined) updateData.sizes = cleanSizes;

    if (inStock !== undefined) updateData.inStock = Boolean(inStock);

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug');

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: unknown) {
    console.error('Failed to update product:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!OBJECT_ID_RE.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid product id' }, { status: 400 });
    }
    await connectToDatabase();

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: unknown) {
    console.error('Failed to delete product:', error);
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 });
  }
}
