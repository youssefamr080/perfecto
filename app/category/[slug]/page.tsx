import React from 'react'
import CategoryClient from './CategoryClient'
import { prisma } from '@/lib/prisma'
import { getFullBreadcrumb } from '@/lib/categories-with-products'
import { notFound } from 'next/navigation'

// احذف تعريف Product إذا لم يكن مستخدمًا
// Map category slugs to database enum values
const categoryMap: { [key: string]: { dbValue: string; name: string; description: string } } = {
  // أقسام اللحوم
  'luncheon': { 
    dbValue: 'LUNCHEON', 
    name: 'اللانشون',
    description: 'لانشون دجاج ولحم بأجود الأنواع'
  },
  'pastrami': { 
    dbValue: 'PASTRAMI', 
    name: 'البسطرمة',
    description: 'بسطرمة لحم بقري ودجاج طازجة'
  },
  'kofta': { 
    dbValue: 'KOFTA', 
    name: 'الكفتة',
    description: 'كفتة لحم بقري وضاني طازجة متبلة'
  },
  'sausage': { 
    dbValue: 'SAUSAGE', 
    name: 'السجق',
    description: 'سجق اسكندراني وحلو طازج'
  },
  'ground-meat': { 
    dbValue: 'GROUND_MEAT', 
    name: 'اللحمة المفرومة',
    description: 'لحمة مفرومة بقري وضاني طازجة'
  },
  'liver': { 
    dbValue: 'LIVER', 
    name: 'الكبدة',
    description: 'كبدة دجاج وبقري طازجة'
  },
  
  // أقسام الألبان
  'yogurt': { 
    dbValue: 'YOGURT', 
    name: 'الزبادي',
    description: 'زبادي طبيعي وبالفواكه'
  },
  'milk': { 
    dbValue: 'MILK', 
    name: 'اللبن',
    description: 'لبن بقري وجاموسي طازج'
  },
  'cheese-butter': { 
    dbValue: 'CHEESE_BUTTER', 
    name: 'الجبن والسمنة',
    description: 'جبن وسمنة طبيعية عالية الجودة'
  },
  
  // أقسام العسل والطحينة
  'honey': { 
    dbValue: 'HONEY', 
    name: 'العسل',
    description: 'عسل طبيعي من أجود الأنواع'
  },
  'tahini': { 
    dbValue: 'TAHINI', 
    name: 'الطحينة',
    description: 'طحينة سمسم طبيعية فاخرة'
  },
  
  // أقسام أخرى
  'eggs': { 
    dbValue: 'EGGS', 
    name: 'البيض',
    description: 'بيض دجاج محلي طازج بأحجام مختلفة'
  },
  'halawa': { 
    dbValue: 'HALAWA', 
    name: 'الحلاوة الطحينية',
    description: 'حلاوة طحينية فاخرة بنكهات مختلفة'
  }
}

// Custom types for this file
interface CategoryInfo {
  name: string;
  description?: string | null;
  dbValue: string;
}
interface ProductLite {
  id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  images: string[];
  unitType: 'WEIGHT' | 'PIECE';
  isAvailable: boolean;
  category: string | null;
  description?: string | null;
  subcategory?: string | null;
}
interface SubCategoryWithProducts {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  products: ProductLite[];
}
interface CategoryProductsResult {
  type: 'subcategory' | 'maincategory' | 'legacy';
  categoryInfo: CategoryInfo;
  products: ProductLite[];
  totalCount: number;
  breadcrumb: { name: string; href: string }[];
  subCategories?: SubCategoryWithProducts[];
}

async function getCategoryProducts(slug: string) {
  try {
    // أولاً، محاولة العثور على فئة فرعية بالـ slug
    const subCategory = await prisma.subCategory.findUnique({
      where: { slug: slug },
      include: {
        mainCategory: true,
        products: {
          where: { isAvailable: true },
          orderBy: { createdAt: 'desc' },
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
        }
      }
    })

    if (subCategory) {
      // جلب breadcrumb الكامل للفئة الفرعية
      const breadcrumb = await getFullBreadcrumb('subcategory', slug)
      
      return {
        type: 'subcategory',
        categoryInfo: {
          name: subCategory.name,
          description: subCategory.description || `منتجات ${subCategory.name} عالية الجودة`,
          dbValue: subCategory.categoryType
        },
        products: subCategory.products as ProductLite[],
        totalCount: (subCategory.products as ProductLite[]).length,
        breadcrumb
      } as CategoryProductsResult
    }

    // ثانياً، محاولة العثور على فئة رئيسية بالـ slug
    const mainCategory = await prisma.mainCategory.findUnique({
      where: { slug: slug },
      include: {
        subCategories: {
          where: { isActive: true },
          include: {
            products: {
              where: { isAvailable: true },
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                name: true,
                price: true,
                oldPrice: true,
                images: true,
                unitType: true,
                isAvailable: true,
                category: true,
                description: true,
                subcategory: true
              }
            }
          }
        }
      }
    })

    if (mainCategory) {
      // جمع جميع المنتجات من الفئات الفرعية
      const allProducts = mainCategory.subCategories.flatMap((sub: SubCategoryWithProducts) => sub.products as ProductLite[])
      
      // جلب breadcrumb الكامل للفئة الرئيسية
      const breadcrumb = await getFullBreadcrumb('maincategory', slug)
      
      return {
        type: 'maincategory',
        categoryInfo: {
          name: mainCategory.name,
          description: mainCategory.description || `منتجات ${mainCategory.name} عالية الجودة`,
          dbValue: slug
        },
        products: allProducts,
        totalCount: allProducts.length,
        breadcrumb,
        subCategories: mainCategory.subCategories as SubCategoryWithProducts[]
      } as CategoryProductsResult
    }

    // إذا لم نجد شيء، استخدم النظام القديم كـ fallback
    const categoryInfo = categoryMap[slug]
    if (!categoryInfo) {
      return null
    }

    const products = await prisma.product.findMany({
      where: {
        category: categoryInfo.dbValue as string,
        isAvailable: true
      },
      orderBy: { createdAt: 'desc' },
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

    return {
      type: 'legacy',
      categoryInfo,
      products: products as ProductLite[],
      totalCount: (products as ProductLite[]).length,
      breadcrumb: [
        { name: 'الرئيسية', href: '/' },
        { name: categoryInfo.name, href: `/category/${slug}` }
      ]
    } as CategoryProductsResult
  } catch (error) {
    console.error('Error fetching category products:', error)
    return null
  }
}

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const data = await getCategoryProducts(slug)
  
  if (!data) {
    notFound()
  }

  const { categoryInfo, products, totalCount, breadcrumb, subCategories } = data

  return (
    <div className="min-h-screen bg-gray-50">
      
      <CategoryClient 
        initialData={{
          type: data.type || 'legacy',
          categoryInfo,
          products,
          totalCount,
          breadcrumb,
          subCategories
        }}
      />
    </div>
  )
}

export async function generateStaticParams() {
  return Object.keys(categoryMap).map((slug) => ({
    slug: slug,
  }))
}
