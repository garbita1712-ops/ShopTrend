import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProductModel from '@/models/Product';

export async function GET() {
  try {
    await connectToDatabase();
    await ProductModel.deleteMany({});
    return NextResponse.json({ message: 'All products removed from MongoDB database! Catalog is now empty.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
