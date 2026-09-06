import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const isConnected = mongoose.connection.readyState === 1;

    return NextResponse.json({
      status: isConnected ? 'online' : 'connecting',
      message: 'MongoDB Atlas is connected and operational!',
      database: mongoose.connection.name || 'shoptrend',
      host: mongoose.connection.host || 'cluster0.ibntvdw.mongodb.net',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Could not connect to MongoDB Atlas',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
