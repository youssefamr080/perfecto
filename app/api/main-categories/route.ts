import { NextResponse } from 'next/server'
import { getMainCategoriesWithSubs } from '@/lib/categories-with-products'

let mainCategoriesCache: any = null;
let mainCategoriesCacheTimestamp = 0;
const MAIN_CATEGORIES_CACHE_DURATION = 10 * 60 * 1000; // 10 دقائق

export async function GET() {
  try {
    const now = Date.now();
    if (mainCategoriesCache && (now - mainCategoriesCacheTimestamp < MAIN_CATEGORIES_CACHE_DURATION)) {
      return NextResponse.json(mainCategoriesCache);
    }
    const mainCategories = await getMainCategoriesWithSubs();
    mainCategoriesCache = mainCategories;
    mainCategoriesCacheTimestamp = now;
    return NextResponse.json(mainCategories);
  } catch (error) {
    console.error('Error fetching main categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch main categories' },
      { status: 500 }
    );
  }
}
