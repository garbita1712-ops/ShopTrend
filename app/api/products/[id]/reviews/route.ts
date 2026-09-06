import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id: productId } = await params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id: productId } = await params;
    const { rating, comment, userName, userEmail } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and review details are required' }, { status: 400 });
    }

    // Create review directly with rating and comment
    const newReview = await Review.create({
      productId: String(productId),
      userName: userName || 'Customer',
      userEmail: userEmail || 'customer@shoptrend.com',
      rating: Number(rating),
      comment: comment.trim(),
    });

    // Recalculate average rating & total reviews count
    const allReviews = await Review.find({ productId: String(productId) });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((totalRating / allReviews.length).toFixed(1));
    const reviewsCount = allReviews.length;

    // Update Product rating & reviews count in DB
    if (mongoose.Types.ObjectId.isValid(String(productId))) {
      await Product.findByIdAndUpdate(String(productId), {
        rating: avgRating,
        reviews: reviewsCount,
      });
    }

    return NextResponse.json({
      success: true,
      review: newReview,
      newRating: avgRating,
      newReviewsCount: reviewsCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
