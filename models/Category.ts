import mongoose, { Schema, Document } from 'mongoose';

export interface ISubcategory {
  id: string;
  name: string;
  slug: string;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  subcategories: ISubcategory[];
  createdAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  subcategories: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      slug: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
