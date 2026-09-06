import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const orderId = searchParams.get('orderId');

    let query: any = {};

    if (orderId && orderId.trim()) {
      const cleanId = orderId.trim();
      if (mongoose.Types.ObjectId.isValid(cleanId)) {
        query._id = cleanId;
      } else {
        return NextResponse.json([]);
      }
    } else if (email && email.trim()) {
      query.customerEmail = email.trim().toLowerCase();
    } else {
      return NextResponse.json({ error: 'Provide email or orderId' }, { status: 400 });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
