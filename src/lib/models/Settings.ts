import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  dhakaDeliveryCharge: number;
  outsideDhakaDeliveryCharge: number;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true, unique: true, default: 'delivery' },
    dhakaDeliveryCharge: { type: Number, required: true, default: 70, min: 0 },
    outsideDhakaDeliveryCharge: { type: Number, required: true, default: 130, min: 0 },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export const DEFAULT_DELIVERY_CHARGES = {
  dhaka: 70,
  outside: 130,
};

export async function getDeliveryCharges(): Promise<{ dhaka: number; outside: number }> {
  try {
    const doc = await Settings.findOne({ key: 'delivery' }).lean();
    if (doc) {
      return {
        dhaka: doc.dhakaDeliveryCharge ?? DEFAULT_DELIVERY_CHARGES.dhaka,
        outside: doc.outsideDhakaDeliveryCharge ?? DEFAULT_DELIVERY_CHARGES.outside,
      };
    }
  } catch {
    // fall through to defaults (e.g. during build without DB)
  }
  return { ...DEFAULT_DELIVERY_CHARGES };
}

export default Settings;
