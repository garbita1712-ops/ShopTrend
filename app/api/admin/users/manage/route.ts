import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    if (mongoose.Types.ObjectId.isValid(id)) {
      await User.findByIdAndDelete(id);
    }
    await User.deleteOne({ $or: [{ id: id }, { _id: id }] });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, role } = await req.json();

    if (!id || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    await connectToDatabase();
    let updated = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await User.findByIdAndUpdate(id, { role }, { new: true });
    }
    if (!updated) {
      updated = await User.findOneAndUpdate({ $or: [{ id: id }, { _id: id }] }, { role }, { new: true });
    }

    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      user: {
        id: updated._id.toString(),
        role: updated.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
