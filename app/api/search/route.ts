import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // بحث متقدم مع أولويات مختلفة ونظام تسجيل نقاط
    const searchWords = searchTerm.split(' ').filter(word => word.length > 1)
    
    const searchConditions = [
      // بحث دقيق في الاسم (أولوية عالية جداً)
      { name: { equals: searchTerm, mode: 'insensitive' } },
      // بحث يبدأ بالكلمة في الاسم (أولوية عالية)
      { name: { startsWith: searchTerm, mode: 'insensitive' } },
      // بحث يحتوي على الكلمة في الاسم (أولوية متوسطة عالية)
      { name: { contains: searchTerm, mode: 'insensitive' } },
      // بحث في الوصف (أولوية متوسطة)
      { description: { contains: searchTerm, mode: 'insensitive' } },
      // بحث بالكلمات المنفصلة في الاسم
      ...searchWords.map(word => ({
        name: { contains: word, mode: 'insensitive' }
      })),
      // بحث بالكلمات المنفصلة في الوصف
      ...searchWords.map(word => ({
        description: { contains: word, mode: 'insensitive' }
      }))
    ]

    // تنفيذ البحث مع الأولويات
    const products = await prisma.product.findMany({
      where: {
        AND: [
          { isAvailable: true },
          {
            OR: searchConditions as { name: { equals: string; mode: 'insensitive' } | { name: { startsWith: string; mode: 'insensitive' } } | { name: { contains: string; mode: 'insensitive' } } | { description: { contains: string; mode: 'insensitive' } } | { name: { contains: string; mode: 'insensitive' } } | { description: { contains: string; mode: 'insensitive' } } }[]
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
        // ترتيب حسب الأولوية (اسم دقيق أولاً)
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
            OR: searchConditions as { name: { equals: string; mode: 'insensitive' } | { name: { startsWith: string; mode: 'insensitive' } } | { name: { contains: string; mode: 'insensitive' } } | { description: { contains: string; mode: 'insensitive' } } | { name: { contains: string; mode: 'insensitive' } } | { description: { contains: string; mode: 'insensitive' } } }[]
          }
        ]
      }
    })

    // ترتيب النتائج حسب الصلة مع نظام نقاط متقدم
    const sortedProducts = products.sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      const searchLower = searchTerm.toLowerCase()
      const searchWords = searchLower.split(' ').filter(word => word.length > 1)

      // حساب نقاط الصلة لكل منتج
      const getRelevanceScore = (product: { name: string; description?: string }) => {
        const name = product.name.toLowerCase()
        const description = (product.description || '').toLowerCase()
        let score = 0

        // مطابقة دقيقة كاملة (100 نقطة)
        if (name === searchLower) score += 100

        // يبدأ بالنص المطلوب (50 نقطة)
        if (name.startsWith(searchLower)) score += 50

        // يحتوي على النص المطلوب في الاسم (30 نقطة)
        if (name.includes(searchLower)) score += 30

        // موقع الكلمة في الاسم (كلما كانت أقرب للبداية، نقاط أكثر)
        const nameIndex = name.indexOf(searchLower)
        if (nameIndex !== -1) {
          score += Math.max(20 - nameIndex, 0)
        }

        // النقاط من الكلمات المنفصلة
        searchWords.forEach(word => {
          if (name.includes(word)) score += 15
          if (description.includes(word)) score += 5
        })

        // يحتوي على النص المطلوب في الوصف (10 نقاط)
        if (description.includes(searchLower)) score += 10

        // منتجات متوفرة تحصل على نقاط إضافية
        if (product.isAvailable) score += 5

        return score
      }

      const aScore = getRelevanceScore(a)
      const bScore = getRelevanceScore(b)

      // ترتيب حسب النقاط أولاً
      if (aScore !== bScore) return bScore - aScore

      // إذا تساوت النقاط، ترتيب أبجدي
      return aName.localeCompare(bName, 'ar')
    })

    return NextResponse.json({ 
      products: sortedProducts, 
      total,
      query: searchTerm,
      limit: searchLimit
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ 
      error: 'حدث خطأ في البحث',
      products: [],
      total: 0
    }, { status: 500 })
  }
}
