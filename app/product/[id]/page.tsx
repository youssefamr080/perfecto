import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ShoppingCart, Heart, Share2 } from 'lucide-react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import ProductCard from '@/components/ProductCard'
import { getProductWithFullPath } from '@/lib/categories-with-products'
import { notFound } from 'next/navigation'
import ProductDetailsClient from './ProductDetailsClient'

interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  oldPrice?: number | null
  images: string[]
  unitType: 'WEIGHT' | 'PIECE'
  isAvailable: boolean
  category: string
}

async function getProduct(id: string) {
  try {
    // استخدام النظام الجديد للحصول على المنتج مع المسار الكامل
    const data = await getProductWithFullPath(id)
    
    if (!data) return null

    const { product, breadcrumb, subCategory } = data

    // جلب المنتجات المشابهة من نفس الفئة الفرعية إذا توفرت
    let relatedProducts: any[] = []
    if (subCategory) {
      // استخدام العلاقة الجديدة لجلب المنتجات
      try {
        const subCategoryWithProducts = await require('@/lib/prisma').prisma.subCategory.findUnique({
          where: { id: subCategory.id },
          include: {
            products: {
              where: {
                isAvailable: true,
                id: { not: product.id }
              },
              take: 4,
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
        
        if (subCategoryWithProducts) {
          relatedProducts = subCategoryWithProducts.products
        }
      } catch (err) {
        console.warn('Error fetching related products, using fallback')
      }
    }

    return { 
      product, 
      relatedProducts,
      breadcrumb,
      subCategory
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

// Map category codes to Arabic names
const categoryNames: { [key: string]: string } = {
  'DAIRY': 'الألبان والأجبان',
  'MEAT': 'اللحوم والمصنعات',
  'HONEY': 'عسل وطحينة',
  'EGGS': 'البيض'
}

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const data = await getProduct(id)
  
  if (!data) {
    notFound()
  }

  const { product, relatedProducts, breadcrumb, subCategory } = data

  // تحديد اسم الفئة للعرض
  const categoryName = subCategory?.name || categoryNames[product.category] || 'منتجات'

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb الكامل الجديد */}
        <nav className="flex items-center space-x-1 text-sm md:text-base mb-6 md:mb-8 overflow-x-auto">
          {breadcrumb.map((item: any, index: number) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2 flex-shrink-0" />
              )}
              {index === breadcrumb.length - 1 ? (
                <span className="text-gray-600 font-medium whitespace-nowrap">{item.name}</span>
              ) : (
                <Link 
                  href={item.href}
                  className="text-red-600 hover:text-red-700 font-medium whitespace-nowrap hover:underline"
                >
                  {item.name}
                </Link>
              )}
            </React.Fragment>
          ))}
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
                  {product.images.slice(1, 5).map((image: string, index: number) => (
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
                    {product.price} ج.م
                  </span>
                  {product.oldPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      {product.oldPrice} ج.م
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">نوع الوحدة:</span>
                    <span className="text-gray-600 mr-2">
                      {product.unitType === 'WEIGHT' 
                        ? (product.category === 'EGGS' 
                          ? 'بالكرتونة (ثلث، نصف، كاملة)' 
                          : product.category === 'YOGURT'
                          ? 'بالعلبة'
                          : 'بالوزن (تمن، ربع، نصف، كيلو)')
                        : 'بالقطعة'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">الفئة:</span>
                    <span className="text-gray-600 mr-2">{categoryName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">حالة التوفر:</span>
                    <span className={`mr-2 ${product.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      {product.isAvailable ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">السعر:</span>
                    <span className="text-gray-600 mr-2">
                      {product.unitType === 'WEIGHT' 
                        ? (product.category === 'EGGS' 
                          ? 'حسب نوع الكرتونة' 
                          : product.category === 'YOGURT'
                          ? 'للعلبة الواحدة'
                          : 'للكيلوجرام')
                        : 'للقطعة الواحدة'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Client Component */}
              <ProductDetailsClient product={product} />
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
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}

        {/* Back to Category */}
        <div className="text-center">
          <Link
            href={`/category/${product.category.toLowerCase()}`}
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
