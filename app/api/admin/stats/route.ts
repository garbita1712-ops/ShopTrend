import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ProductModel from '@/models/Product';
import User from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();

    const totalProducts = await ProductModel.countDocuments();
    const activeCustomers = await User.countDocuments();

    const products = await ProductModel.find({});
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 1), 0);

    return NextResponse.json({
      totalProducts,
      grossSales: totalInventoryValue > 0 ? totalInventoryValue : 0,
      activeCustomers: activeCustomers > 0 ? activeCustomers : 1,
    });
  } catch (error: any) {
    return NextResponse.json({
      totalProducts: 0,
      grossSales: 0,
      activeCustomers: 0,
    });
  }
}
