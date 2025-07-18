import React from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { notFound } from 'next/navigation'
import { 
  getSubCategoryBySlug, 
  getMainCategoryBySlug, 
  getProductsBySubCategory,
  getBreadcrumbForSubCategory,
  getBreadcrumbForMainCategory 
} from '@/lib/categories-with-products'

interface Product {
  id: string
  name: string
  price: number
  oldPrice?: number | null
  images: string[]
  unitType: 'WEIGHT' | 'PIECE'
  isAvailable: boolean
  category: string
  description?: string | null
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

// جلب بيانات الفئة والمنتجات من قاعدة البيانات
async function getCategoryData(slug: string) {
  try {
    // البحث في الفئات الفرعية أولاً
    const subCategory = await getSubCategoryBySlug(slug)
    
    if (subCategory) {
      // إذا كانت فئة فرعية
      const products = await getProductsBySubCategory(subCategory.categoryType)
      const breadcrumb = await getBreadcrumbForSubCategory(slug)
      
      return {
        type: 'subcategory',
        category: subCategory,
        products,
        breadcrumb
      }
    }

    // البحث في الفئات الرئيسية
    const mainCategory = await getMainCategoryBySlug(slug)
    
    if (mainCategory) {
      // إذا كانت فئة رئيسية، جمع المنتجات من جميع الفئات الفرعية
      const allProducts = []
      for (const subCat of mainCategory.subCategories) {
        const products = await getProductsBySubCategory(subCat.categoryType)
        allProducts.push(...products)
      }
      
      const breadcrumb = await getBreadcrumbForMainCategory(slug)
      
      return {
        type: 'maincategory',
        category: mainCategory,
        products: allProducts,
        breadcrumb,
        subCategories: mainCategory.subCategories
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching category data:', error)
    return null
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const categoryData = await getCategoryData(slug)

  if (!categoryData) {
    notFound()
  }

  const { type, category, products, breadcrumb, subCategories } = categoryData

  return (
    <div className="min-h-screen bg-white">
      
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-1 text-sm md:text-base mb-6 md:mb-8">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
              )}
              {index === breadcrumb.length - 1 ? (
                <span className="text-gray-600 font-medium">{item.name}</span>
              ) : (
                <Link 
                  href={item.href}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  {item.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Category Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 md:p-8 mb-8 text-white text-center">
          <div className="flex items-center justify-center mb-4">
            {category.image && (
              <img 
                src={category.image} 
                alt={category.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-lg"
              />
            )}
            {!category.image && category.icon && (
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-4xl md:text-5xl">{category.icon}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">{category.name}</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            {category.description}
          </p>
          <div className="mt-4 inline-flex items-center bg-white bg-opacity-20 rounded-full px-4 py-2">
            <span className="text-sm md:text-base font-medium">
              {products.length} منتج متاح
            </span>
          </div>
        </div>

        {/* Sub Categories for Main Category */}
        {type === 'maincategory' && subCategories && subCategories.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
              الفئات الفرعية
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {subCategories.map((subCat: any) => (
                <Link
                  key={subCat.id}
                  href={`/category/${subCat.slug}`}
                  className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    {subCat.image && (
                      <img 
                        src={subCat.image} 
                        alt={subCat.name}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover mb-3"
                      />
                    )}
                    {!subCat.image && subCat.icon && (
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-red-200 transition-colors">
                        <span className="text-2xl md:text-3xl">{subCat.icon}</span>
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">
                      {subCat.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      {subCat.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm md:text-base text-gray-600">فلترة المنتجات</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm md:text-base font-medium">
              الكل
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm md:text-base font-medium hover:bg-gray-200 transition-colors">
              متوفر
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm md:text-base font-medium hover:bg-gray-200 transition-colors">
              عروض
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 md:w-20 md:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a2 2 0 00-2-2H7a2 2 0 00-2 2v1m2-1h12" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-600 mb-6">لم يتم العثور على منتجات في هذا القسم حالياً</p>
            <Link 
              href="/"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              العودة للرئيسية
            </Link>
          </div>
        )}

        {/* Load More Button */}
        {products.length > 0 && (
          <div className="text-center mt-8 md:mt-12">
            <button className="bg-gray-100 text-gray-700 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 text-base md:text-lg">
              عرض المزيد
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
