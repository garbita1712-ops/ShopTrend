import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import mongoose from 'mongoose';
import crypto from 'crypto';

export async function GET() {
  try {
    await connectToDatabase();
    const products = await ProductModel.find({}).sort({ createdAt: -1 });
    
    // Map _id to id for frontend compatibility
    const formatted = products.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      subcategory: doc.subcategory || '',
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
      subcategory: body.subcategory || '',
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
      subcategory: newProduct.subcategory || '',
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

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, category, subcategory, price, stock, description, image } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required for update' }, { status: 400 });
    }

    await connectToDatabase();
    let updated = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await ProductModel.findByIdAndUpdate(
        id,
        {
          name,
          category,
          subcategory: subcategory || '',
          price: parseFloat(price),
          stock: parseInt(stock),
          description,
          image,
        },
        { new: true }
      );
    }

    if (!updated) {
      updated = await ProductModel.findOneAndUpdate(
        { $or: [{ id: id }, { _id: id }] },
        {
          name,
          category,
          subcategory: subcategory || '',
          price: parseFloat(price),
          stock: parseInt(stock),
          description,
          image,
        },
        { new: true }
      );
    }

    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: updated._id.toString(),
      name: updated.name,
      category: updated.category,
      subcategory: updated.subcategory || '',
      price: updated.price,
      rating: updated.rating,
      reviews: updated.reviews,
      image: updated.image,
      description: updated.description,
      stock: updated.stock,
      isNew: updated.isNewItem,
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
    
    // Find product using ObjectId or custom String ID safely
    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await ProductModel.findById(id);
    }
    if (!product) {
      product = await ProductModel.findOne({ $or: [{ id: id }, { _id: id }] });
    }

    if (product && product.image && product.image.includes('cloudinary.com')) {
      try {
        const urlParts = product.image.split('/upload/');
        if (urlParts.length > 1) {
          let pathAfterUpload = urlParts[1];
          pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
          const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');

          const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'x5yt3kmf';
          const apiKey = process.env.CLOUDINARY_API_KEY || '418773947296572';
          const apiSecret = process.env.CLOUDINARY_API_SECRET || 't9fy1FLeENxp3Iv7ltBLSi8oWJs';

          const timestamp = Math.floor(Date.now() / 1000).toString();
          const strToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
          const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

          const formData = new FormData();
          formData.append('public_id', publicId);
          formData.append('api_key', apiKey);
          formData.append('timestamp', timestamp);
          formData.append('signature', signature);

          await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
            method: 'POST',
            body: formData,
          });
        }
      } catch (cloudErr) {
        console.error('Failed to delete Cloudinary image:', cloudErr);
      }
    }

    // Delete product document from MongoDB safely
    if (mongoose.Types.ObjectId.isValid(id)) {
      await ProductModel.findByIdAndDelete(id);
    }
    await ProductModel.deleteOne({ $or: [{ id: id }, { _id: id }] });

    return NextResponse.json({ message: 'Product deleted successfully', id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
