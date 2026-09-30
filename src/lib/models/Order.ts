import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type OrderStatus = 'IN_REVIEW' | 'IN_PROGRESS' | 'CANCELLED' | 'SUCCESSFUL';

export type DeliveryType = 'dhaka' | 'outside';

export interface IOrderItem {
  product: Types.ObjectId | Record<string, unknown>;
  quantity: number;
  selectedSize?: string;
  priceAtPurchase?: number;
}

export interface ICustomerDetails {
  name: string;
  number: string;
  address: string;
  email: string;
}

export interface IOrder extends Document {
  userId?: Types.ObjectId;
  customerDetails: ICustomerDetails;
  items: IOrderItem[];
  subtotalAmount: number;
  deliveryType: DeliveryType;
  deliveryCharge: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    customerDetails: {
      name: { type: String, required: true },
      number: { type: String, required: true },
      address: { type: String, required: true },
      email: { type: String, required: true },
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        selectedSize: { type: String },
        priceAtPurchase: { type: Number },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    subtotalAmount: { type: Number, default: 0, min: 0 },
    deliveryType: { type: String, enum: ['dhaka', 'outside'], default: 'dhaka' },
    deliveryCharge: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['IN_REVIEW', 'IN_PROGRESS', 'CANCELLED', 'SUCCESSFUL'],
      default: 'IN_REVIEW',
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
