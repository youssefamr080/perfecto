import { prisma } from './prisma'

// جلب جميع الفئات الرئيسية مع الفئات الفرعية
export async function getMainCategoriesWithSubs() {
  try {
    const mainCategories = await prisma.mainCategory.findMany({
      where: { isActive: true },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return mainCategories
  } catch (error) {
    console.error('Error fetching main categories:', error)
    return []
  }
}

// جلب الفئات الفرعية مع عدد المنتجات
export async function getSubCategoriesWithProductCounts() {
  try {
    const subCategories = await prisma.subCategory.findMany({
      where: { isActive: true },
      include: {
        mainCategory: true,
        products: {
          where: { isAvailable: true }
        }
      },
      orderBy: [
        { mainCategory: { sortOrder: 'asc' } },
        { sortOrder: 'asc' }
      ]
    })

    // إضافة عدد المنتجات لكل فئة فرعية
    const subCategoriesWithCounts = subCategories.map(subCat => ({
      ...subCat,
      productsCount: subCat.products.length
    }))

    return subCategoriesWithCounts
  } catch (error) {
    console.error('Error fetching sub categories:', error)
    return []
  }
}

// جلب فئة فرعية واحدة بواسطة slug
export async function getSubCategoryBySlug(slug: string) {
  try {
    const subCategory = await prisma.subCategory.findUnique({
      where: { slug },
      include: {
        mainCategory: true
      }
    }) as SubCategory | null

    return subCategory
  } catch (error) {
    console.error('Error fetching sub category:', error)
    return null
  }
}

// جلب فئة رئيسية واحدة بواسطة slug
export async function getMainCategoryBySlug(slug: string) {
  try {
    const mainCategory = await prisma.mainCategory.findUnique({
      where: { slug },
      include: {
        subCategories: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    }) as MainCategory | null

    return mainCategory
  } catch (error) {
    console.error('Error fetching main category:', error)
    return null
  }
}

// جلب المنتجات لفئة فرعية معينة (بالـ slug أو categoryType)
export async function getProductsBySubCategory(identifier: string) {
  try {
    // البحث بالـ slug أولاً
    const subCategory = await prisma.subCategory.findUnique({
      where: { slug: identifier },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    }) as SubCategory | null

    if (subCategory) {
      return transformProductsForUI(subCategory.products)
    }

    // البحث بالـ categoryType إذا لم يتم العثور على slug
    const subCategoryByType = await prisma.subCategory.findUnique({
      where: { categoryType: identifier as string },
      include: {
        products: {
          where: { isAvailable: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    }) as SubCategory | null

    if (subCategoryByType) {
      return transformProductsForUI(subCategoryByType.products)
    }

    // البحث القديم كـ fallback
    const products = await prisma.product.findMany({
      where: { 
        category: identifier as string,
        isAvailable: true 
      },
      orderBy: { createdAt: 'desc' }
    })

    return transformProductsForUI(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

// جلب breadcrumb path للفئة الفرعية - محدث للنظام الجديد
export async function getBreadcrumbForSubCategory(slug: string) {
  return await getFullBreadcrumb('subcategory', slug)
}

// جلب breadcrumb path للفئة الرئيسية - محدث للنظام الجديد  
export async function getBreadcrumbForMainCategory(slug: string) {
  return await getFullBreadcrumb('maincategory', slug)
}

// جلب المنتجات الأكثر مبيعاً
export async function getBestSellerProducts(limit: number = 8) {
  try {
    const bestSellers = await prisma.product.findMany({
      where: {
        isBestSeller: true,
        isAvailable: true
      },
      orderBy: {
        name: 'asc'
      },
      take: limit
    })

    return bestSellers
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

    return popularCategories
  } catch (error) {
    console.error('Error fetching popular categories:', error)
    return []
  }
}

// جلب المنتجات المميزة (محدث)
export async function getFeaturedProducts() {
  try {
    // الحصول على المنتجات الأكثر مبيعاً أولاً
    const bestSellers = await prisma.product.findMany({
      where: {
        isBestSeller: true,
        isAvailable: true
      },
      orderBy: { name: 'asc' },
      take: 6
    })

    // إذا لم يكن هناك كفاية من المنتجات الأكثر مبيعاً، أضف منتجات حديثة
    if (bestSellers.length < 6) {
      const recentProducts = await prisma.product.findMany({
        where: {
          isAvailable: true,
          isBestSeller: false
        },
        orderBy: { createdAt: 'desc' },
        take: 6 - bestSellers.length
      })
      
      return [...bestSellers, ...recentProducts]
    }

    return bestSellers
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

// دالة موحدة لإنشاء breadcrumb كامل دائماً
export async function getFullBreadcrumb(type: 'product' | 'subcategory' | 'maincategory', identifier: string) {
  try {
    const breadcrumb = [{ name: 'الرئيسية', href: '/' }]

    if (type === 'product') {
      // جلب المنتج مع الفئة الفرعية والرئيسية
      const product = await prisma.product.findUnique({
        where: { id: identifier }
      }) as Product | null

      if (product && product.subCategoryId) {
        const subCategory = await prisma.subCategory.findUnique({
          where: { id: product.subCategoryId },
          include: {
            mainCategory: true
          }
        }) as SubCategory | null

        if (subCategory) {
          // إضافة الفئة الرئيسية
          breadcrumb.push({
            name: subCategory.mainCategory.name,
            href: `/category/${subCategory.mainCategory.slug}`
          })

          // إضافة الفئة الفرعية
          breadcrumb.push({
            name: subCategory.name,
            href: `/category/${subCategory.slug}`
          })

          // إضافة المنتج
          breadcrumb.push({
            name: product.name,
            href: `/product/${product.id}`
          })
        }
      }
    } else if (type === 'subcategory') {
      // جلب الفئة الفرعية مع الرئيسية
      const subCategory = await prisma.subCategory.findUnique({
        where: { slug: identifier },
        include: {
          mainCategory: true
        }
      }) as SubCategory | null

      if (subCategory) {
        // إضافة الفئة الرئيسية
        breadcrumb.push({
          name: subCategory.mainCategory.name,
          href: `/category/${subCategory.mainCategory.slug}`
        })

        // إضافة الفئة الفرعية
        breadcrumb.push({
          name: subCategory.name,
          href: `/category/${subCategory.slug}`
        })
      }
    } else if (type === 'maincategory') {
      // جلب الفئة الرئيسية
      const mainCategory = await prisma.mainCategory.findUnique({
        where: { slug: identifier }
      }) as MainCategory | null

      if (mainCategory) {
        // إضافة الفئة الرئيسية
        breadcrumb.push({
          name: mainCategory.name,
          href: `/category/${mainCategory.slug}`
        })
      }
    }

    return breadcrumb
  } catch (error) {
    console.error('Error creating breadcrumb:', error)
    return [{ name: 'الرئيسية', href: '/' }]
  }
}

// جلب معلومات المنتج مع المسار الكامل
export async function getProductWithFullPath(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    }) as Product | null

    if (!product) return null

    const breadcrumb = await getFullBreadcrumb('product', productId)
    
    let mainCategory = null
    let subCategory = null
    
    if (product.subCategoryId) {
      subCategory = await prisma.subCategory.findUnique({
        where: { id: product.subCategoryId },
        include: {
          mainCategory: true
        }
      }) as SubCategory | null
      
      if (subCategory) {
        mainCategory = subCategory.mainCategory
      }
    }
    
    return {
      product,
      breadcrumb,
      mainCategory,
      subCategory
    }
  } catch (error) {
    console.error('Error fetching product with path:', error)
    return null
  }
}

// تحويل منتج من قاعدة البيانات إلى النوع المطلوب
function transformProductForUI(product: Product) {
  return {
    ...product,
    category: product.subCategory?.name || product.category || 'غير محدد'
  }
}

// تحويل قائمة منتجات للواجهة
function transformProductsForUI(products: Product[]) {
  return products.map(transformProductForUI)
}

// تعريف الأنواع الأساسية (يمكنك تعديلها أو استيرادها من prisma إذا كانت متاحة)
interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  images: string[];
  unitType: 'WEIGHT' | 'PIECE';
  isAvailable: boolean;
  category: string;
  description?: string | null;
  subCategoryId?: string | null;
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  mainCategory?: MainCategory;
  products?: Product[];
}

interface MainCategory {
  id: string;
  name: string;
  slug: string;
}
