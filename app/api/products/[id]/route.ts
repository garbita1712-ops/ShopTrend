import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let product = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }

    if (!product) {
      // Search by string id if stored custom
      product = await Product.findOne({ id: id });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const formattedProduct = {
      id: product._id.toString(),
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || '',
      price: product.price,
      rating: product.rating,
      reviews: product.reviews,
      image: product.image,
      description: product.description,
      stock: product.stock,
    };

    return NextResponse.json(formattedProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
