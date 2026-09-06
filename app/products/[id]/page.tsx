'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface ProductDetail {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  stock: number;
}

interface ReviewRecord {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ProductDetailPage() {
  const routeParams = useParams();
  const id = routeParams?.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviewsList, setReviewsList] = useState<ReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Simple Review Form State: Only Rating & Writing Details
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('shoptrend_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.user) {
          setUserSession(parsed.user);
        }
      } catch (e) {}
    }
  }, []);

  const loadProductAndReviews = () => {
    if (!id) return;
    setIsLoading(true);

    Promise.all([
      fetch(`/api/products/${id}`).then((res) => res.json()),
      fetch(`/api/products/${id}/reviews`).then((res) => res.json()),
    ])
      .then(([prodData, revData]) => {
        if (prodData && !prodData.error) {
          setProduct(prodData);
        }
        if (Array.isArray(revData)) {
          setReviewsList(revData);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProductAndReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const existing = localStorage.getItem('shoptrend_cart');
    let cart = existing ? JSON.parse(existing) : [];
    const index = cart.findIndex((i: any) => (i.id || i.product?.id) === product.id);
    if (index > -1) {
      cart[index].quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity,
      });
    }
    localStorage.setItem('shoptrend_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('shoptrend_cart_updated'));
    window.dispatchEvent(new Event('shoptrend_open_cart'));
    toast.success(`Added ${quantity} x ${product.name} to cart!`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      toast.error('Please enter your review details');
      return;
    }

    setIsSubmittingReview(true);
    const toastId = toast.loading('Posting review...');

    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: ratingInput,
          comment: commentInput,
          userName: userSession?.name || 'Customer',
          userEmail: userSession?.email || 'customer@shoptrend.com',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Review submitted!', { id: toastId });
        setCommentInput('');
        loadProductAndReviews();
      } else {
        toast.error(data.error || 'Failed to submit review', { id: toastId });
      }
    } catch (e) {
      toast.error('Error submitting review', { id: toastId });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-24 text-center">
        <p className="text-xs text-slate-500 font-medium">Loading product details...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-base font-bold text-slate-900 mb-2">Product Not Found</h1>
        <p className="text-xs text-slate-500 mb-6">The requested product could not be located in the catalog.</p>
        <Link
          href="/"
          className="px-4 py-2 rounded border border-slate-300 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
        >
          ← Back to Catalog
        </Link>
      </main>
    );
  }

  const hasReviews = product.reviews && product.reviews > 0;

  return (
    <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 max-w-5xl">
      <div className="mb-6">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← Back to Catalog
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-12">
        {/* Product Image Preview */}
        <div className="bg-slate-100 border border-slate-200 rounded overflow-hidden aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info & Actions */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {product.category} {product.subcategory ? `· ${product.subcategory}` : ''}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
              {/* Only show rating if reviews exist */}
              {hasReviews ? (
                <span className="text-xs font-bold text-slate-900 px-2 py-0.5 rounded border border-slate-200 bg-slate-50">
                  ★ {product.rating} / 5.0 ({product.reviews} {product.reviews === 1 ? 'review' : 'reviews'})
                </span>
              ) : null}
            </div>
          </div>

          <div className="border-t border-b border-slate-200 py-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description || 'No detailed specifications provided for this product.'}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700">Quantity:</label>
              <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-1 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 rounded border border-slate-300 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all cursor-pointer"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="border-t border-slate-200 pt-8 space-y-6">
        <h2 className="text-base font-bold text-slate-900">
          Customer Reviews ({reviewsList.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Form: Rating & Review Details ONLY */}
          <div className="border border-slate-200 rounded p-4 space-y-3 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Write a Review
            </h3>

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rating</label>
                <select
                  value={ratingInput}
                  onChange={(e) => setRatingInput(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-slate-500 cursor-pointer font-bold"
                >
                  <option value={5}>★★★★★ (5/5)</option>
                  <option value={4}>★★★★☆ (4/5)</option>
                  <option value={3}>★★★☆☆ (3/5)</option>
                  <option value={2}>★★☆☆☆ (2/5)</option>
                  <option value={1}>★☆☆☆☆ (1/5)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Review Details</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your review comments here..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-1.5 text-slate-900 focus:outline-none focus:border-slate-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer transition-all"
              >
                Submit Review
              </button>
            </form>
          </div>

          {/* List of Posted Reviews */}
          <div className="space-y-3">
            {reviewsList.length === 0 ? (
              <div className="py-6 text-center border border-slate-200 rounded p-4 bg-white text-xs text-slate-400">
                No reviews written yet.
              </div>
            ) : (
              reviewsList.map((rev) => (
                <div key={rev._id} className="bg-white border border-slate-200 rounded p-3 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{rev.userName}</span>
                    <span className="font-bold text-slate-900">★ {rev.rating} / 5</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
