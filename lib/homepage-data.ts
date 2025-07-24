import { prisma } from './prisma';
import type { Product as PrismaProduct, SubCategory as PrismaSubCategory, MainCategory as PrismaMainCategory } from '@prisma/client';
import type { AppProduct, AppCategory } from '@/types';

// النوع الموسع للمنتج مع الفئة الفرعية
type ProductWithSubCategory = PrismaProduct & {
  subCategory: (PrismaSubCategory & { mainCategory: PrismaMainCategory | null }) | null;
};

/**
 * دالة مساعدة لتحويل بيانات المنتج من Prisma إلى الشكل المطلوب للواجهة
 * @param p - كائن المنتج من Prisma
 * @returns كائن المنتج المحوَّل
 */
// Helper to generate a URL-friendly slug
const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

function transformProduct(p: ProductWithSubCategory): AppProduct {
  const { ...rest } = p;
  return {
    ...rest,
    slug: generateSlug(p.name), // Generate slug from product name
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    category: p.subCategory as AppCategory | null, // The subCategory from Prisma is compatible with our AppCategory type
  };
}


/**
 * جلب المنتجات الأكثر مبيعاً
 * @param limit - عدد المنتجات المراد جلبها
 */
export async function getBestSellerProducts(limit: number = 8) {
  try {
    const bestSellers = await prisma.product.findMany({
      where: { isBestSeller: true, isAvailable: true },
      include: {
        subCategory: {
          include: {
            mainCategory: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      take: limit,
    });
    return bestSellers.map(transformProduct);
  } catch (error) {
    console.error('Error fetching best seller products:', error);
    return [];
  }
}

/**
 * جلب الفئات الفرعية الأكثر طلباً مع عدد المنتجات فيها
 * @param limit - عدد الفئات المراد جلبها
 */
export async function getMostPopularCategories(): Promise<AppCategory[]> {
  try {
    const popularCategories = await prisma.subCategory.findMany({
      where: { isActive: true },
      include: {
        mainCategory: true,
        _count: { select: { products: { where: { isAvailable: true } } } },
      },
      orderBy: { products: { _count: 'desc' } },
    });

    return popularCategories.map((category) => ({
      ...category,
      productCount: category._count.products,
    })) as AppCategory[];
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    return [];
  }
}

/**
 * جلب المنتجات المميزة للصفحة الرئيسية (مزيج من الأكثر مبيعًا والجديدة)
 * @param limit - العدد الإجمالي للمنتجات
 */
export async function getNewProducts(limit: number = 8) {
  try {
    // Workaround for TypeScript/Turbopack cache issue
    const newProducts: ProductWithSubCategory[] = await prisma.product.findMany({
      where: { 
        isNew: true, 
        isAvailable: true 
      },
      include: { 
        subCategory: {
          include: {
            mainCategory: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return newProducts.map(transformProduct);
  } catch (error) {
    console.error('Error fetching new products:', error);
    // If the above fails due to type errors, let's try to regenerate and restart.
    // For now, returning empty array to avoid crash.
    return [];
  }
}

/**
 * جلب المنتجات المميزة للصفحة الرئيسية (مزيج من الأكثر مبيعًا والجديدة)
 * @param limit - العدد الإجمالي للمنتجات
 */
export async function getHomeFeaturedProducts(limit: number = 6) {
  try {
    const bestSellers = await prisma.product.findMany({
      where: { isBestSeller: true, isAvailable: true },
      include: { subCategory: { include: { mainCategory: true } } },
      orderBy: { name: 'asc' },
      take: Math.ceil(limit * 0.7),
    });

    let additionalProducts: ProductWithSubCategory[] = [];
    if (bestSellers.length < limit) {
      const existingIds = bestSellers.map(p => p.id);
      additionalProducts = await prisma.product.findMany({
        where: {
          isAvailable: true,
          id: { notIn: existingIds }, // تجنب تكرار المنتجات
        },
        include: { subCategory: { include: { mainCategory: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit - bestSellers.length,
      });
    }

    const allProducts = [...bestSellers, ...additionalProducts];
    return allProducts.map(transformProduct);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

/**
 * جلب جميع المنتجات المخفضة
 */
export async function getDiscountedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        oldPrice: {
          not: null,
        },
        isAvailable: true,
      },
      include: {
        subCategory: {
          include: {
            mainCategory: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return products.map(transformProduct);
  } catch (error) {
    console.error('Error fetching discounted products:', error);
    return [];
  }
}
