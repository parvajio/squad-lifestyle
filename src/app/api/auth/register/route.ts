import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/lib/models/User';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Allows +, digits, spaces, dashes, parentheses — 7 to 15 digits total.
const PHONE_RE = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const phone = String(body?.phone ?? '').trim();
    const password = String(body?.password ?? '');
    const confirmPassword = String(body?.confirmPassword ?? body?.confirm_password ?? '');

    if (!name) {
      return NextResponse.json({ error: 'Please provide your name' }, { status: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: 'Please provide your phone number' }, { status: 400 });
    }
    const digitCount = phone.replace(/\D/g, '').length;
    if (!PHONE_RE.test(phone) || digitCount < 7 || digitCount > 15) {
      return NextResponse.json({ error: 'Please provide a valid phone number' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: 'USER',
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: { id: String(user._id), name: user.name, email: user.email, phone: user.phone },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Register failed:', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
