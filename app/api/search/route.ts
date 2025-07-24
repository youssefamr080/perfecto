import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type ProductType = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  images: string[];
  unitType: string;
  isAvailable: boolean;
  category: string | null;
  description?: string | null;
};
type SearchCacheValue = {
  products: ProductType[];
  total: number;
  query: string;
  limit: number;
};
const searchCache: Record<string, { data: SearchCacheValue; timestamp: number }> = {};
const SEARCH_CACHE_DURATION = 10 * 60 * 1000; // 10 دقائق

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = searchParams.get('limit')
    
    if (!query || query.trim().length < 1) {
      return NextResponse.json({ products: [], total: 0 })
    }

    const searchTerm = query.trim()
    const searchLimit = limit ? Math.min(parseInt(limit), 50) : 20
    const cacheKey = `${searchTerm}__${searchLimit}`;
    const now = Date.now();
    if (searchCache[cacheKey] && (now - searchCache[cacheKey].timestamp < SEARCH_CACHE_DURATION)) {
      return NextResponse.json(searchCache[cacheKey].data);
    }

    // بناء شروط البحث بشكل متوافق مع ProductWhereInput
    const searchWords = searchTerm.split(' ').filter(word => word.length > 1);
    const searchConditions = [
      { name: { equals: searchTerm, mode: 'insensitive' as string } },
      { name: { startsWith: searchTerm, mode: 'insensitive' as string } },
      { name: { contains: searchTerm, mode: 'insensitive' as string } },
      { description: { contains: searchTerm, mode: 'insensitive' as string } },
      ...searchWords.map((word: string) => ({ name: { contains: word, mode: 'insensitive' as string } })),
      ...searchWords.map((word: string) => ({ description: { contains: word, mode: 'insensitive' as string } })),
    ];

    // تنفيذ البحث مع الأولويات
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isAvailable: true },
          {
            OR: searchConditions
          }
        ]
      },
      select: {
        id: true,
        name: true,
        price: true,
        oldPrice: true,
        images: true,
        unitType: true,
        isAvailable: true,
        category: true,
        description: true
      },
      take: searchLimit,
      orderBy: [
        { name: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // إحصاء النتائج الكامل
    const total = await prisma.product.count({
      where: {
        AND: [
          { isAvailable: true },
          {
            OR: searchConditions
          }
        ]
      }
    });

    // ترتيب النتائج حسب الصلة مع نظام نقاط متقدم
    const sortedProducts = products.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const searchWords = searchLower.split(' ').filter(word => word.length > 1);

      // حساب نقاط الصلة لكل منتج
      const getRelevanceScore = (product: { name: string; description?: string | null; isAvailable?: boolean }) => {
        const name = product.name.toLowerCase();
        const description = (product.description || '').toLowerCase();
        let score = 0;

        if (name === searchLower) score += 100;
        if (name.startsWith(searchLower)) score += 50;
        if (name.includes(searchLower)) score += 30;
        const nameIndex = name.indexOf(searchLower);
        if (nameIndex !== -1) {
          score += Math.max(20 - nameIndex, 0);
        }
        searchWords.forEach((word: string) => {
          if (name.includes(word)) score += 15;
          if (description.includes(word)) score += 5;
        });
        if (description.includes(searchLower)) score += 10;
        if (product.isAvailable) score += 5;
        return score;
      };

      const aScore = getRelevanceScore(a);
      const bScore = getRelevanceScore(b);
      if (aScore !== bScore) return bScore - aScore;
      return aName.localeCompare(bName, 'ar');
    });

    const responseData = { 
      products: sortedProducts, 
      total,
      query: searchTerm,
      limit: searchLimit
    };
    searchCache[cacheKey] = { data: responseData, timestamp: now };
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في البحث',
      products: [],
      total: 0
    }, { status: 500 })
  }
}
