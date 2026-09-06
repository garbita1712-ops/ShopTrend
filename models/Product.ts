import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  stock: number;
  isNewItem?: boolean;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: '' },
    price: { type: Number, required: true },
    rating: { type: Number, default: 5.0 },
    reviews: { type: Number, default: 1 },
    image: { type: String, required: true },
    description: { type: String, required: true },
    stock: { type: Number, default: 10 },
    isNewItem: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductModel: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default ProductModel;
