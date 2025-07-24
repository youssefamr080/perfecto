import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Tag, Package } from 'lucide-react';
import { Product as PrismaProduct, SubCategory as PrismaSubCategory } from '@prisma/client';
import { AppProduct, UnitType } from '@/types';

// Static data for main categories
const categoryData = {
  meat: {
    name: 'اللحوم والمصنعات',
    description: 'أفضل أنواع اللحوم والمصنعات الطازجة',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    subcategories: [
      { id: 'luncheon', name: 'اللانشون', href: '/category/luncheon' },
      { id: 'pastrami', name: 'البسطرمة', href: '/category/pastrami' },
      { id: 'kofta', name: 'الكفتة', href: '/category/kofta' },
      { id: 'sausage', name: 'السجق', href: '/category/sausage' },
      { id: 'ground-meat', name: 'اللحمة المفرومة', href: '/category/ground-meat' },
      { id: 'liver', name: 'الكبدة', href: '/category/liver' },
      { id: 'burger', name: 'البرجر', href: '/category/burger' }
    ]
  },
  dairy: {
    name: 'الألبان ومنتجاتها',
    description: 'منتجات الألبان الطازجة والصحية',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    subcategories: [
      { id: 'yogurt', name: 'الزبادي', href: '/category/yogurt' },
      { id: 'milk', name: 'اللبن', href: '/category/milk' },
      { id: 'cheese-butter', name: 'الجبن والسمنة', href: '/category/cheese-butter' },
    ]
  },
  honey: {
    name: 'العسل والطحينة',
    description: 'عسل طبيعي وطحينة فاخرة',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    subcategories: [
      { id: 'honey', name: 'العسل', href: '/category/honey' },
      { id: 'tahini', name: 'الطحينة', href: '/category/tahini' },
    ]
  },
  other: {
    name: 'أقسام أخرى',
    description: 'منتجات متنوعة عالية الجودة',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    subcategories: [
      { id: 'eggs', name: 'البيض', href: '/category/eggs' },
      { id: 'halawa', name: 'الحلاوة الطحينية', href: '/category/halawa' },
    ]
  }
};

// Helper function to map Prisma Product to AppProduct
const mapPrismaProductToAppProduct = (product: PrismaProduct & { subCategory: PrismaSubCategory | null }): AppProduct => ({
  ...product,
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
  images: product.images || [],
  slug: product.name.toLowerCase().replace(/\s+/g, '-'),
  unitType: product.unitType as UnitType,
  isAvailable: product.isAvailable || false,
  isBestSeller: product.isBestSeller || false,
  inStock: product.inStock || 0,
  category: product.subCategory ? { ...product.subCategory, productCount: 0, mainCategory: null, icon: product.subCategory.icon || null } : null,
});

async function getCategoryProducts(categorySlug: string): Promise<AppProduct[]> {
  const categoryInfo = categoryData[categorySlug as keyof typeof categoryData];
  if (!categoryInfo) return [];

  try {
    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        subCategory: {
          slug: { in: categoryInfo.subcategories.map(s => s.id) }
        }
      },
      include: { subCategory: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return products.map(mapPrismaProductToAppProduct);
  } catch (error) {
    console.error(`Error fetching products for category ${categorySlug}:`, error);
    return [];
  }
}

async function getDiscountedProducts(categorySlug: string): Promise<AppProduct[]> {
  const categoryInfo = categoryData[categorySlug as keyof typeof categoryData];
  if (!categoryInfo) return [];

  try {
    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        subCategory: {
          slug: { in: categoryInfo.subcategories.map(s => s.id) }
        },
        oldPrice: { not: null },
        price: { lt: prisma.product.fields.oldPrice },
      },
      include: { subCategory: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    return products.map(mapPrismaProductToAppProduct);
  } catch (error) {
    console.error(`Error fetching discounted products for category ${categorySlug}:`, error);
    return [];
  }
}

interface CategoryPageProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  const category = categoryData[slug as keyof typeof categoryData];

  if (!category) {
    notFound();
  }

  const [products, discountedProducts] = await Promise.all([
    getCategoryProducts(slug),
    getDiscountedProducts(slug),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Category Header */}
          <div className={`${category.bgColor} rounded-2xl p-8 mb-8`}>
            <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
              <Package className={`w-12 h-12 ${category.textColor}`} />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
                <p className="text-lg text-gray-600 mt-2">{category.description}</p>
              </div>
            </div>
          </div>

          {/* Subcategories */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">الأقسام الفرعية</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={sub.href}
                  className="group bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border hover:border-red-200"
                >
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className={`w-12 h-12 ${category.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Tag className={`w-6 h-6 ${category.textColor}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-sm text-gray-500">اضغط للعرض</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Discounted Products */}
          {discountedProducts.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
                <Tag className="w-8 h-8 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">المنتجات المخفضة</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {discountedProducts.map((product: AppProduct) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* All Products */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              جميع منتجات {category.name}
            </h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product: AppProduct) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">لا توجد منتجات حالياً</h3>
                <p className="text-gray-500">سيتم إضافة منتجات جديدة قريباً</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
               