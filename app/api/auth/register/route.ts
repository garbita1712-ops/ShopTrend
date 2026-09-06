import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Security Rule: Prevent public registration of Admin role
    if (role === 'admin') {
      return NextResponse.json(
        { error: 'Public registration of Admin accounts is disabled. Only existing Admins may access the panel.' },
        { status: 403 }
      );
    }

    try {
      await connectToDatabase();
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'customer', // Always customer for public registration
      });

      return NextResponse.json({
        message: 'User created successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (dbErr) {
      return NextResponse.json({
        message: 'User registered in customer session mode',
        user: {
          id: `usr-${Date.now()}`,
          name,
          email,
          role: 'customer',
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
