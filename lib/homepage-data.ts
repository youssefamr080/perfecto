// تحويل منتج من قاعدة البيانات إلى النوع المطلوب
function transformProductForUI(product: any) {
  return {
    ...product,
    category: product.subCategory?.name || 'غير محدد'
  }
}

// تحويل قائمة منتجات للواجهة
function transformProductsForUI(products: any[]) {
  return products.map(transformProductForUI)
}

import { prisma } from './prisma'

// جلب المنتجات الأكثر مبيعاً
export async function getBestSellerProducts(limit: number = 8) {
  try {
    const bestSellers = await prisma.product.findMany({
      where: {
        isBestSeller: true,
        isAvailable: true
      },
      include: {
        subCategory: {
          include: {
            mainCategory: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: limit
    })

    // تحويل البيانات للشكل المطلوب
    return transformProductsForUI(bestSellers)
  } catch (error) {
    console.error('Error fetching best seller products:', error)
    return []
  }
}

// جلب الفئات الأكثر طلباً (حسب عدد المنتجات)
export async function getMostPopularCategories(limit: number = 6) {
  try {
    const popularCategories = await prisma.subCategory.findMany({
      where: { isActive: true },
      include: {
        mainCategory: true,
        _count: {
          select: {
            products: {
              where: { isAvailable: true }
            }
          }
        }
      },
      orderBy: {
        products: {
          _count: 'desc'
        }
      },
      take: limit
    })

    return popularCategories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      icon: category.icon,
      mainCategory: category.mainCategory,
      productCount: category._count.products
    }))
  } catch (error) {
    console.error('Error fetching popular categories:', error)
    return []
  }
}

// جلب منتجات مميزة للصفحة الرئيسية
export async function getHomeFeaturedProducts(limit: number = 6) {
  try {
    // الحصول على المنتجات الأكثر مبيعاً أولاً
    const bestSellers = await prisma.product.findMany({
      where: {
        isBestSeller: true,
        isAvailable: true
      },
      include: {
        subCategory: {
          include: {
            mainCategory: true
          }
        }
      },
      orderBy: { name: 'asc' },
      take: Math.ceil(limit * 0.7) // 70% من المنتجات تكون أكثر مبيعاً
    })

    // إذا لم يكن هناك كفاية من المنتجات الأكثر مبيعاً، أضف منتجات حديثة
    let additionalProducts: any[] = []
    if (bestSellers.length < limit) {
      additionalProducts = await prisma.product.findMany({
        where: {
          isAvailable: true,
          isBestSeller: false
        },
        include: {
          subCategory: {
            include: {
              mainCategory: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit - bestSellers.length
      })
    }

    // تحويل البيانات للشكل المطلوب
    const allProducts = [...bestSellers, ...additionalProducts]
    return transformProductsForUI(allProducts)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}
