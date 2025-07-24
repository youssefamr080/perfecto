import React from 'react'
import { Suspense } from 'react'
import ProductCard from '@/components/ProductCard'
import { prisma } from '@/lib/prisma'
import { AppProduct } from '@/types'
import { Search } from 'lucide-react';
import type { Product, SubCategory, MainCategory } from '@prisma/client';

// كاش في الذاكرة لمدة 10 دقائق
const searchSSRCache: Record<string, { data: { products: AppProduct[], total: number }, timestamp: number }> = {};
const SEARCH_SSR_CACHE_DURATION = 10 * 60 * 1000; // 10 دقائق

type ProductWithNestedCategory = Product & {
  subCategory: (SubCategory & {
    mainCategory: MainCategory | null;
  }) | null;
};

async function getSearchResults(query: string) {
  if (!query || query.trim().length < 1) {
    return { products: [], total: 0 }
  }

  const searchTerm = query.trim();
  const cacheKey = searchTerm;
  const now = Date.now();
  if (searchSSRCache[cacheKey] && (now - searchSSRCache[cacheKey].timestamp < SEARCH_SSR_CACHE_DURATION)) {
    return searchSSRCache[cacheKey].data;
  }

  try {
    // في بيئة الخادم، نستخدم Prisma مباشرة لأداء أفضل
    const searchWords = searchTerm.split(' ').filter(word => word.length > 1)
    
    const searchConditions = [
      { name: { equals: searchTerm, mode: 'insensitive' } },
      { name: { startsWith: searchTerm, mode: 'insensitive' } },
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      ...searchWords.map(word => ({ name: { contains: word, mode: 'insensitive' } })),
      ...searchWords.map(word => ({ description: { contains: word, mode: 'insensitive' } })),
    ]

    // الحصول على المنتجات
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isAvailable: true },
          {
            OR: searchConditions as object[]
          }
        ]
      },
      include: {
        subCategory: {
          include: {
            mainCategory: true,
          },
        },
      },
      take: 50,
      orderBy: [
        { name: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // إحصاء النتائج الكامل
    const total = await prisma.product.count({
      where: {
        AND: [
          { isAvailable: true },
          {
            OR: searchConditions as object[]
          }
        ]
      }
    })

    // ترتيب النتائج حسب الصلة
    const sortedProducts = products.sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      const searchLower = searchTerm.toLowerCase()

      // حساب نقاط الصلة
            const getRelevanceScore = (product: ProductWithNestedCategory) => {
        const name = (product.name ?? '').toLowerCase()
        const description = (product.description ?? '').toLowerCase()
        let score = 0

        if (name === searchLower) score += 100
        if (name.startsWith(searchLower)) score += 50
        if (name.includes(searchLower)) score += 30

        const nameIndex = name.indexOf(searchLower)
        if (nameIndex !== -1) {
          score += Math.max(20 - nameIndex, 0)
        }

        searchWords.forEach(word => {
          if (name.includes(word)) score += 15
          if (description.includes(word)) score += 5
        })

        if (description.includes(searchLower)) score += 10
        if (product.isAvailable) score += 5

        return score
      }

      const aScore = getRelevanceScore(a)
      const bScore = getRelevanceScore(b)

      if (aScore !== bScore) return bScore - aScore
      return aName.localeCompare(bName, 'ar')
    })

        const mapToAppProduct = (p: ProductWithNestedCategory): AppProduct => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
            slug: p.name.toLowerCase().replace(/\s+/g, '-'),
      category: p.subCategory ? { ...p.subCategory, mainCategory: p.subCategory.mainCategory || null } : null,
    });

    const appProducts = sortedProducts.map(mapToAppProduct);

    const data = { products: appProducts, total };
    searchSSRCache[cacheKey] = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error('Error fetching search results:', error)
    return { products: [], total: 0 }
  }
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

async function SearchResults({ query }: { query: string }) {
  const { products, total } = await getSearchResults(query)

  if (!query || query.trim().length < 1) {
    return (
      <div className="text-center py-16">
        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">ابحث عن المنتجات</h3>
        <p className="text-gray-500">اكتب ما تبحث عنه في مربع البحث أعلاه</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">لا توجد نتائج</h3>
        <p className="text-gray-500">لم نجد أي منتجات تحتوي على &quot;{query}&quot;</p>
        <p className="text-gray-500 mt-2">جرب البحث بكلمات أخرى أو تصفح الأقسام</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          نتائج البحث عن &quot;{query}&quot;
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-lg">وجدنا <span className="font-semibold text-red-600">{total}</span> منتج</p>
          {total > products.length && (
            <p className="text-sm text-gray-500">عرض أول {products.length} منتج</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="transform transition-all duration-300 hover:scale-105">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}



export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams
  const query = resolvedSearchParams.q || ''

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
              <Search className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">البحث في المنتجات</h1>
            </div>
            <div className="h-1 w-20 bg-red-600 rounded"></div>
          </div>

          {/* Results */}
          <Suspense fallback={
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">جاري البحث...</p>
            </div>
          }>
            <SearchResults query={query} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
