import mongoose from 'mongoose';
import User from '@/lib/models/User';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/squad_lifestyle';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var mongoMemoryInstance: unknown;
  // eslint-disable-next-line no-var
  var isSeededAuto: boolean | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

// Auto-seed admin user and default categories if empty
async function autoSeedIfEmpty() {
  if (global.isSeededAuto) return;
  try {
    const adminEmail = 'admin@squad-lifestyle.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        name: 'Squad Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      });
      console.log('Auto-seeded Admin account: admin@squad-lifestyle.com / admin123');
    }

    // Check categories
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      const defaultCategories = [
        { name: 'Outerwear', slug: 'outerwear' },
        { name: 'Tops & Tees', slug: 'tops-and-tees' },
        { name: 'Bottoms', slug: 'bottoms' },
        { name: 'Footwear', slug: 'footwear' },
        { name: 'Accessories', slug: 'accessories' },
      ];
      const createdCats = await Category.insertMany(defaultCategories);
      const catMap = createdCats.reduce((acc, cat) => {
        acc[cat.slug] = String(cat._id);
        return acc;
      }, {} as Record<string, string>);

      const prodCount = await Product.countDocuments();
      if (prodCount === 0) {
        await Product.insertMany([
          {
            title: 'Squad Stealth Heavyweight Hoodie',
            slug: 'squad-stealth-heavyweight-hoodie',
            description:
              'Premium 450GSM cotton fleece hoodie featuring a double-lined hood, relaxed dropping shoulder silhouette, and minimalist Squad block insignia on the cuff.',
            category: catMap['outerwear'],
            originalPrice: 120,
            discountPrice: 89,
            images: [
              'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1000&q=80',
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL'],
            inStock: true,
          },
          {
            title: 'Minimalist Oversized Graphic Tee',
            slug: 'minimalist-oversized-graphic-tee',
            description:
              'Crafted from 100% organic comb cotton. Breathable, ultra-soft handfeel with custom monochrome typographic print across the back.',
            category: catMap['tops-and-tees'],
            originalPrice: 55,
            discountPrice: 42,
            images: [
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            inStock: true,
          },
          {
            title: 'Squad Urban Cargo Trousers',
            slug: 'squad-urban-cargo-trousers',
            description:
              'Durable ripstop cotton cargo pants with custom hardware, adjustable ankles, and multiple utility pockets designed for urban mobility.',
            category: catMap['bottoms'],
            originalPrice: 110,
            discountPrice: 95,
            images: [
              'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80',
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            inStock: true,
          },
          {
            title: 'Monochrome Matrix Sneakers',
            slug: 'monochrome-matrix-sneakers',
            description:
              'Sleek futuristic low-top trainers with responsive foam cushioning and high-grip rubber outsole.',
            category: catMap['footwear'],
            originalPrice: 160,
            discountPrice: 135,
            images: [
              'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
            ],
            sizes: ['39', '40', '41', '42', '43', '44'],
            inStock: true,
          },
          {
            title: 'Tactical Matte Black Backpack',
            slug: 'tactical-matte-black-backpack',
            description:
              'Water-resistant matte coated nylon daypack with padded 16-inch laptop compartment and modular attachment straps.',
            category: catMap['accessories'],
            originalPrice: 90,
            images: [
              'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
            ],
            sizes: [],
            inStock: true,
          },
          {
            title: 'Squad Signature Beanie',
            slug: 'squad-signature-beanie',
            description:
              'Rib-knit wool blend beanie with fold-over cuff and embroidered monochrome badge.',
            category: catMap['accessories'],
            originalPrice: 35,
            discountPrice: 28,
            images: [
              'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1000&q=80',
            ],
            sizes: ['One Size'],
            inStock: true,
          },
        ]);
        console.log('Auto-seeded default products and categories');
      }
    }
    global.isSeededAuto = true;
  } catch (e) {
    console.error('Auto seed failed:', e);
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    await autoSeedIfEmpty();
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log('Connected to Primary MongoDB successfully');
        return m;
      })
      .catch(async (primaryError) => {
        console.warn(
          'Primary MongoDB connection failed (likely IP whitelist restriction). Initializing fallback in-memory MongoDB...'
        );

        try {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          let mongoServer = global.mongoMemoryInstance as InstanceType<typeof MongoMemoryServer>;
          if (!mongoServer) {
            mongoServer = await MongoMemoryServer.create();
            global.mongoMemoryInstance = mongoServer;
          }
          const mongoUri = mongoServer.getUri();
          console.log('Connected to Fallback In-Memory MongoDB Server:', mongoUri);
          return await mongoose.connect(mongoUri, { bufferCommands: false });
        } catch (fallbackError) {
          console.error('Fallback MongoDB also failed:', fallbackError);
          throw primaryError;
        }
      });
  }

  try {
    cached.conn = await cached.promise;
    await autoSeedIfEmpty();
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
