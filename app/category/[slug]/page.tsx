import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getFullBreadcrumb } from '@/lib/categories-with-products';
import CategoryClient from './CategoryClient';
import { Category as PrismaCategoryEnum } from '@prisma/client';

// --- START: Local Type Definitions ---

// Types that align with what CategoryClient.tsx expects
interface CategoryInfo {
  name: string;
  description: string; // Must be a string
  dbValue: string;
}

interface UIProduct {
  id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  images: string[];
  unitType: 'WEIGHT' | 'PIECE';
  isAvailable: boolean;
  description?: string | null;
  subcategory?: string; // string or undefined
  category: string; // Required by the original Product type
}

interface SubCategoryWithProductsUI {
  id: string;
  name: string;
  slug: string;
  products: UIProduct[];
}

// The final result shape that will be passed to the client component's initialData prop
interface CategoryProductsResult {
  type: 'main' | 'subcategory' | 'legacy';
  categoryInfo: CategoryInfo;
  products: UIProduct[];
  totalCount: number;
  breadcrumb: Array<{ name: string; href: string }>;
  subCategories?: SubCategoryWithProductsUI[];
}

// Raw product data structure from Prisma queries
interface ProductFromDB {
  id: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  images: string | string[];
  unitType: 'WEIGHT' | 'PIECE';
  isAvailable: boolean;
  subcategory: string | null;
  category: PrismaCategoryEnum | null;
  createdAt: Date;
  updatedAt: Date;
}

// --- END: Local Type Definitions ---

// This transformer function ensures the data from DB matches the UI type expectations
function transformProductForUI(p: ProductFromDB, defaultCategory: string): UIProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    oldPrice: p.oldPrice,
    isAvailable: p.isAvailable,
    unitType: p.unitType,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [],
    subcategory: p.subcategory ?? undefined, // Ensures null becomes undefined
    category: p.category ?? defaultCategory,
  };
}

const getCategoryProducts = async (slug: string): Promise<CategoryProductsResult | null> => {
  // Common select statement for products to ensure consistency
  const productSelect = {
    id: true, name: true, description: true, price: true, oldPrice: true, images: true, unitType: true, isAvailable: true, subcategory: true, category: true, createdAt: true, updatedAt: true,
  };

  // 1. Check if it's a SubCategory
  const subCategory = await prisma.subCategory.findUnique({
    where: { slug },
    include: { products: { where: { isAvailable: true }, select: productSelect } },
  });

  if (subCategory) {
    const breadcrumb = await getFullBreadcrumb('subcategory', slug);
    return {
      type: 'subcategory',
      categoryInfo: {
        name: subCategory.name,
        description: subCategory.description || '',
        dbValue: subCategory.categoryType,
      },
      products: (subCategory.products as ProductFromDB[]).map(p => transformProductForUI(p, subCategory.name)),
      totalCount: subCategory.products.length,
      breadcrumb,
      subCategories: undefined,
    };
  }

  // 2. Check if it's a MainCategory
  const mainCategory = await prisma.mainCategory.findUnique({
    where: { slug },
    include: {
      subCategories: { 
        where: { isActive: true },
        select: { id: true, name: true, slug: true }, // Select only what's needed
      }, 
    },
  });

  if (mainCategory) {
    const subCategoryIds = mainCategory.subCategories.map(sc => sc.id);

    // Fetch all products that belong to the subcategories of this main category
    const products = await prisma.product.findMany({
      where: {
        subCategoryId: {
          in: subCategoryIds,
        },
        isAvailable: true,
      },
      select: productSelect,
    });

    const breadcrumb = await getFullBreadcrumb('maincategory', slug);
    return {
      type: 'main',
      categoryInfo: {
        name: mainCategory.name,
        description: mainCategory.description || '',
        dbValue: slug,
      },
      products: (products as ProductFromDB[]).map(p => transformProductForUI(p, mainCategory.name)),
      totalCount: products.length,
      breadcrumb,
      subCategories: mainCategory.subCategories.map(sc => ({ ...sc, products: [] })),
    };
  }

  // 3. Fallback to legacy Category enum
  const categoryKey = slug.toUpperCase().replace(/-/g, '_') as keyof typeof PrismaCategoryEnum;
    if (Object.values(PrismaCategoryEnum).includes(categoryKey as PrismaCategoryEnum)) {
    const products = await prisma.product.findMany({
      where: { category: { equals: categoryKey } , isAvailable: true },
      select: productSelect,
    });
    const categoryName = categoryMap[slug] || categoryKey;
    return {
      type: 'legacy',
      categoryInfo: {
        name: categoryName,
        description: `منتجات قسم ${categoryName}`,
        dbValue: slug,
      },
      products: (products as ProductFromDB[]).map(p => transformProductForUI(p, categoryName)),
      totalCount: products.length,
      breadcrumb: [{ name: 'الرئيسية', href: '/' }, { name: categoryName, href: `/category/${slug}` }],
      subCategories: undefined,
    };
  }

  return null; // If nothing is found
};

interface CategoryPageProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const result = await getCategoryProducts(slug);

  if (!result) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryClient initialData={result} />
    </div>
  );
}

// Map for displaying friendly names for legacy categories
export const categoryMap: Record<string, string> = {
  'cheese-butter': 'الجبن والزبدة',
  'milk-yoghurt-dessert': 'حليب وزبادي وحلويات',
  'juice-drinks': 'عصائر ومشروبات',
  'bakery-pastries': 'مخبوزات ومعجنات',
  'canned-food': 'أغذية معلبة',
  'spices-sauces': 'بهارات وصلصات',
  'pasta-rice-grains': 'مكرونة وأرز وحبوب',
  'oils-ghee': 'زيوت وسمن',
  'jams-honey-spreads': 'مربى وعسل',
  'snacks-sweets': 'مقرمشات وحلويات',
  'cleaning-products': 'منظفات',
  'paper-products': 'منتجات ورقية',
  'personal-care': 'عناية شخصية',
  'baby-care': 'عناية بالطفل',
  'pets-food': 'طعام حيوانات أليفة',
  'offers': 'عروض',
  'eggs': 'البيض',
  'halawa': 'الحلاوة الطحينية',
  'olive-oil': 'زيت الزيتون',
  'luncheon': 'اللانشون',
  'pastrami': 'البسطرمة',
  'kofta': 'الكفتة',
  'sausage': 'السجق',
  'ground-meat': 'اللحمة المفرومة',
  'liver': 'الكبدة',
  'yogurt': 'الزبادي',
  'milk': 'اللبن',
  'honey': 'العسل',
  'tahini': 'الطحينة',
};
