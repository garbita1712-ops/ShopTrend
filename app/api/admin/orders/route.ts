import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
    }

    let updatedOrder = null;
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
    }

    if (!updatedOrder) {
      updatedOrder = await Order.findOneAndUpdate(
        { $or: [{ id: orderId }, { _id: orderId }, { orderId: orderId }] },
        { status },
        { new: true }
      );
    }

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    await connectToDatabase();
    
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Order.findByIdAndDelete(id);
    }
    await Order.deleteOne({ $or: [{ id: id }, { _id: id }, { orderId: id }] });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
