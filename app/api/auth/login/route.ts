import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Query user in MongoDB database
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'No account found with this email address.' },
        { status: 404 }
      );
    }

    // Verify hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid password. Access denied.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Authentication successful!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role || 'customer',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Database authentication notice', details: error.message },
      { status: 500 }
    );
  }
}
