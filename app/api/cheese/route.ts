import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma, Category } from '@prisma/client'

let cheeseCache: Record<string, { data: any, timestamp: number }> = {};
const CHEESE_CACHE_DURATION = 10 * 60 * 1000; // 10 دقائق

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const types = searchParams.get('types')?.split(',').filter(Boolean) || []
    const priceRange = searchParams.get('price')?.split(',').filter(Boolean) || []
    const brands = searchParams.get('brands')?.split(',').filter(Boolean) || []
    const sortBy = searchParams.get('sort') || 'newest'

    // مفتاح الكاش بناءً على كل باراميتر
    const cacheKey = `${query}__${types.join(',')}__${priceRange.join(',')}__${brands.join(',')}__${sortBy}`;
    const now = Date.now();
    if (cheeseCache[cacheKey] && (now - cheeseCache[cacheKey].timestamp < CHEESE_CACHE_DURATION)) {
      return NextResponse.json(cheeseCache[cacheKey].data);
    }
    
    // بناء شروط البحث
    const whereClause: Prisma.ProductWhereInput = {
      category: Category.CHEESE, // If this fails, try Category.CHEESE or Category.CHEESEBUTTER
      isAvailable: true
    }

    // إضافة البحث النصي
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    }

    // جلب المنتجات من قاعدة البيانات
    let products = await prisma.product.findMany({
      where: whereClause,
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
      }
    })

    // تطبيق الفلاتر المتقدمة في JavaScript
    if (types.length > 0) {
      products = products.filter(product => {
        const text = `${product.name} ${product.description || ''}`.toLowerCase()
        return types.some(type => {
          const arabicType = getCheeseTypeArabic(type)
          return text.includes(arabicType.toLowerCase())
        })
      })
    }

    if (priceRange.length > 0) {
      products = products.filter(product => {
        return priceRange.some(range => {
          switch (range) {
            case 'under-50':
              return product.price < 50
            case '50-100':
              return product.price >= 50 && product.price <= 100
            case '100-200':
              return product.price >= 100 && product.price <= 200
            case 'over-200':
              return product.price > 200
            default:
              return true
          }
        })
      })
    }

    if (brands.length > 0) {
      products = products.filter(product => {
        const text = `${product.name} ${product.description || ''}`.toLowerCase()
        return brands.some(brand => {
          const arabicBrand = getBrandArabic(brand)
          return text.includes(arabicBrand.toLowerCase())
        })
      })
    }

    // ترتيب النتائج
    switch (sortBy) {
      case 'price-low':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        products.sort((a, b) => b.price - a.price)
        break
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
        break
      case 'newest':
      default:
        // الترتيب الافتراضي
        break
    }

    // تحويل النتائج للصيغة المطلوبة
    const formattedProducts = products.map(product => ({
      ...product,
      category: product.category as string,
      oldPrice: product.oldPrice ?? undefined,
      description: product.description ?? undefined,
      subcategory: product.description ? extractCheeseType(product.description, product.name) : undefined
    }))

    const responseData = {
      products: formattedProducts,
      total: formattedProducts.length,
      filters: {
        types: types,
        priceRange: priceRange,
        brands: brands
      }
    };
    cheeseCache[cacheKey] = { data: responseData, timestamp: now };
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in cheese API:', error)
    return NextResponse.json(
      { error: 'خطأ في جلب منتجات الجبن' },
      { status: 500 }
    )
  }
}

// استخراج نوع الجبن من الوصف أو الاسم
function extractCheeseType(description: string, name: string): string | undefined {
  const text = `${name} ${description}`.toLowerCase()
  
  if (text.includes('شيدر') || text.includes('cheddar')) return 'CHEDDAR'
  if (text.includes('رومي') || text.includes('romy')) return 'ROMY'
  if (text.includes('كيري') || text.includes('kiri')) return 'KERRY'
  if (text.includes('كريمي') || text.includes('cream')) return 'CREAMY'
  if (text.includes('براميلي') || text.includes('bramili')) return 'BRAMILI'
  if (text.includes('قريش') || text.includes('qareesh')) return 'QAREESH'
  if (text.includes('فيتا') || text.includes('feta')) return 'FETA'
  if (text.includes('موزاريلا') || text.includes('mozzarella')) return 'MOZZARELLA'
  if (text.includes('بيضاء') || text.includes('white')) return 'WHITE_CHEESE'
  if (text.includes('مطبوخة') || text.includes('processed')) return 'PROCESSED'
  
  return undefined
}

function getCheeseTypeArabic(type: string): string {
  const types: Record<string, string> = {
    'CHEDDAR': 'شيدر',
    'ROMY': 'رومي',
    'KERRY': 'كيري',
    'CREAMY': 'كريمي',
    'BRAMILI': 'براميلي',
    'QAREESH': 'قريش',
    'FETA': 'فيتا',
    'MOZZARELLA': 'موزاريلا',
    'WHITE_CHEESE': 'بيضاء',
    'PROCESSED': 'مطبوخة'
  }
  return types[type] || type
}

function getBrandArabic(brand: string): string {
  const brands: Record<string, string> = {
    'domty': 'دومتي',
    'juhayna': 'جهينة',
    'almarai': 'المراعي',
    'president': 'بريزيدنت',
    'kiri': 'كيري',
    'local': 'محلي'
  }
  return brands[brand] || brand
}
