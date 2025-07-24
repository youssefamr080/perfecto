import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import { prisma } from '@/lib/prisma'
import { AppProduct } from '@/types';
import { notFound } from 'next/navigation';
import ProductDetailsClient from './ProductDetailsClient'

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        subCategory: {
          include: {
            mainCategory: true,
          },
        },
      },
    });

    if (!product) {
      return null
    }

    // Get related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        isAvailable: true,
        NOT: { id: product.id },
      },
      take: 4,
      include: {
        subCategory: {
          include: {
            mainCategory: true,
          },
        },
      },
    });

    return { product, relatedProducts }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}



// Map category codes to Arabic names
const categoryNames: { [key: string]: string } = {
  'DAIRY': 'الألبان والأجبان',
  'MEAT': 'اللحوم والدواجن',
  'HONEY': 'العسل ومنتجاته',
  'EGGS': 'البيض وأنواعه'
}

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const data = await getProduct(params.id)
  
  if (!data) {
    notFound()
  }

          const { product, relatedProducts } = data;

  const categoryName = product.subCategory?.name || (product.category ? (categoryNames[product.category] || product.category) : 'غير محدد');

              const mapToAppProduct = (p: typeof product): AppProduct => {
    return {
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      slug: p.name.toLowerCase().replace(/\s+/g, '-'),
      category: p.subCategory,
      images: p.images || [],
    };
  };

  const productForClient = {
    ...product,
    category: product.subCategory?.name || 'غير محدد',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 rtl:space-x-reverse mb-8">
          <Link href="/" className="text-gray-500 hover:text-red-600">
            الرئيسية
          </Link>
          <ArrowRight className="w-4 h-4 text-gray-400 rtl:rotate-180" />
          <Link href={`/category/${product.category?.toLowerCase() || 'general'}`} className="text-gray-500 hover:text-red-600">
            {categoryName}
          </Link>
          <ArrowRight className="w-4 h-4 text-gray-400 rtl:rotate-180" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.images[0] || '/images/products/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-red-600 font-medium">{categoryName}</span>
                  {!product.isAvailable && (
                    <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      غير متوفر
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-red-600">
                    {product.price} ر.س
                  </span>
                  {product.oldPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      {product.oldPrice} ر.س
                    </span>
                  )}
                  {product.oldPrice && (
                    <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full font-medium">
                      وفر {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">وصف المنتج</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل المنتج</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">نوع الوحدة:</span>
                    <span className="text-gray-600 mr-2">
                      {product.unitType === 'WEIGHT' ? 'بالوزن (كيلو)' : 'بالقطعة'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">الفئة:</span>
                    <span className="text-gray-600 mr-2">{categoryName}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Client Component */}
              <ProductDetailsClient product={productForClient} />
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              منتجات مشابهة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                        {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={mapToAppProduct(p)} />
              ))}
            </div>
          </section>
        )}

        {/* Back to Category */}
        <div className="text-center">
          <Link
            href={`/category/${product.category?.toLowerCase() || 'general'}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            العودة إلى {categoryName}
          </Link>
        </div>
      </main>
    </div>
  )
}
