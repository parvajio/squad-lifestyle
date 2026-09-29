import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  await connectToDatabase();

  // Seed Admin User
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
    console.log('Seeded Admin account: admin@squad-lifestyle.com / admin123');
  }

  // Seed Categories
  const defaultCategories = [
    { name: 'Outerwear', slug: 'outerwear' },
    { name: 'Tops & Tees', slug: 'tops-and-tees' },
    { name: 'Bottoms', slug: 'bottoms' },
    { name: 'Footwear', slug: 'footwear' },
    { name: 'Accessories', slug: 'accessories' },
  ];

  const categoryMap: Record<string, string> = {};

  for (const catData of defaultCategories) {
    let cat = await Category.findOne({ slug: catData.slug });
    if (!cat) {
      cat = await Category.create(catData);
    }
    categoryMap[catData.slug] = String(cat._id);
  }

  // Seed Products if none exist
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const defaultProducts = [
      {
        title: 'Squad Stealth Heavyweight Hoodie',
        slug: 'squad-stealth-heavyweight-hoodie',
        description:
          'Premium 450GSM cotton fleece hoodie featuring a double-lined hood, relaxed dropping shoulder silhouette, and minimalist Squad block insignia on the cuff.',
        category: categoryMap['outerwear'],
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
        category: categoryMap['tops-and-tees'],
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
        category: categoryMap['bottoms'],
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
        category: categoryMap['footwear'],
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
        category: categoryMap['accessories'],
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
        category: categoryMap['accessories'],
        originalPrice: 35,
        discountPrice: 28,
        images: [
          'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=1000&q=80',
        ],
        sizes: ['One Size'],
        inStock: true,
      },
    ];

    await Product.insertMany(defaultProducts);
    console.log('Seeded sample products successfully');
  }

  return { success: true, message: 'Database seeded successfully' };
}
