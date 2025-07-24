import { NextResponse } from 'next/server'
import { getSubCategoriesWithProductCounts } from '@/lib/categories-with-products'

let cachedCategories: unknown[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 دقائق

export async function GET() {
  try {
    const now = Date.now();
    if (cachedCategories && (now - cacheTimestamp < CACHE_DURATION)) {
      return NextResponse.json(cachedCategories);
    }
    const categories = await getSubCategoriesWithProductCounts();
    cachedCategories = categories;
    cacheTimestamp = now;
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
