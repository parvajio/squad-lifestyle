import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  slug?: string;
  description: string;
  category: Types.ObjectId | Record<string, unknown>;
  originalPrice: number;
  discountPrice?: number;
  images: string[];
  sizes?: string[];
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    originalPrice: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
