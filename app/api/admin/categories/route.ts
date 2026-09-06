import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectToDatabase();
    let categories = await Category.find({}).sort({ createdAt: -1 });

    // Seed default categories if database is empty
    if (categories.length === 0) {
      const initial = [
        {
          name: 'Electronics',
          slug: 'electronics',
          subcategories: [
            { id: 'sub-1', name: 'Smartphones', slug: 'smartphones' },
            { id: 'sub-2', name: 'Laptops & Computers', slug: 'laptops' },
            { id: 'sub-3', name: 'Headphones & Audio', slug: 'audio' },
          ],
        },
        {
          name: 'Wearables',
          slug: 'wearables',
          subcategories: [
            { id: 'sub-4', name: 'Smartwatches', slug: 'smartwatches' },
            { id: 'sub-5', name: 'Fitness Bands', slug: 'fitness-bands' },
          ],
        },
        {
          name: 'Home & Living',
          slug: 'home-living',
          subcategories: [
            { id: 'sub-6', name: 'Lighting & Lamps', slug: 'lighting' },
            { id: 'sub-7', name: 'Desk Accessories', slug: 'desk-acc' },
          ],
        },
      ];
      categories = await Category.insertMany(initial);
    }

    const formatted = categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      subcategories: c.subcategories || [],
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { type, name, parentCategoryId } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await connectToDatabase();
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (type === 'subcategory') {
      if (!parentCategoryId) {
        return NextResponse.json({ error: 'Parent Category ID is required for subcategory' }, { status: 400 });
      }

      const category = await Category.findById(parentCategoryId);
      if (!category) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
      }

      const newSub = {
        id: `sub-${Date.now()}`,
        name: name.trim(),
        slug,
      };

      category.subcategories.push(newSub);
      await category.save();

      return NextResponse.json({
        message: 'Subcategory added successfully',
        category: {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          subcategories: category.subcategories,
        },
      });
    } else {
      // Main Category creation
      const existing = await Category.findOne({ slug });
      if (existing) {
        return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
      }

      const newCategory = await Category.create({
        name: name.trim(),
        slug,
        subcategories: [],
      });

      return NextResponse.json({
        message: 'Category created successfully',
        category: {
          id: newCategory._id.toString(),
          name: newCategory.name,
          slug: newCategory.slug,
          subcategories: [],
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const subId = searchParams.get('subId');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    if (subId) {
      // Delete subcategory from parent
      const category = await Category.findById(id);
      if (category) {
        category.subcategories = category.subcategories.filter((s: any) => s.id !== subId);
        await category.save();
      }
      return NextResponse.json({ message: 'Subcategory removed successfully' });
    } else {
      // Delete entire main category
      await Category.findByIdAndDelete(id);
      return NextResponse.json({ message: 'Category deleted successfully' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
