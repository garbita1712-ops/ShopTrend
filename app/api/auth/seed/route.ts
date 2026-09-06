import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();

    const adminEmail = 'admin@shoptrend.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      return NextResponse.json({
        message: 'Admin account already exists in MongoDB',
        admin: {
          email: adminEmail,
          role: 'admin',
        },
      });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const newAdmin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    return NextResponse.json({
      message: 'Admin account successfully created in MongoDB!',
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Admin seed notice', details: error.message },
      { status: 500 }
    );
  }
}
