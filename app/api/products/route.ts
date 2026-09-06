import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProductModel from '@/models/Product';

export async function GET() {
  try {
    await connectToDatabase();
    const products = await ProductModel.find({}).sort({ createdAt: -1 });
    
    // Map _id to id for frontend compatibility
    const formatted = products.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      price: doc.price,
      rating: doc.rating,
      reviews: doc.reviews,
      image: doc.image,
      description: doc.description,
      stock: doc.stock,
      isNew: doc.isNewItem,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();

    const newProduct = await ProductModel.create({
      name: body.name || 'New Catalog Item',
      category: body.category || 'Electronics',
      price: parseFloat(body.price) || 99.99,
      rating: 5.0,
      reviews: 1,
      image: body.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
      description: body.description || 'Newly created item',
      stock: parseInt(body.stock) || 15,
      isNewItem: true,
    });

    return NextResponse.json({
      id: newProduct._id.toString(),
      name: newProduct.name,
      category: newProduct.category,
      price: newProduct.price,
      rating: newProduct.rating,
      reviews: newProduct.reviews,
      image: newProduct.image,
      description: newProduct.description,
      stock: newProduct.stock,
      isNew: newProduct.isNewItem,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await connectToDatabase();
    await ProductModel.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Product deleted from MongoDB', id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
