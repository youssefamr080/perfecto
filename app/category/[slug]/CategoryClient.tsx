'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import SimpleCheeseFilter from '@/components/SimpleCheeseFilter'
import { ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/outline'

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
  subcategory?: string
}

interface CategoryClientProps {
  initialData: {
    type: string
    categoryInfo: {
      name: string
      description: string
      dbValue: string
    }
    products: Product[]
    totalCount: number
    breadcrumb: Array<{ name: string; href: string }>
    subCategories?: Array<{
      id: string
      name: string
      slug: string
      products: Product[]
    }>
  }
}

const CategoryClient: React.FC<CategoryClientProps> = ({ initialData }) => {
  const { categoryInfo, products: initialProducts, totalCount: initialTotalCount, breadcrumb, subCategories } = initialData
  
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [selectedType, setSelectedType] = useState<string>('')
  const [sortBy, setSortBy] = useState('newest')

  // التحقق من كون الفئة تحتاج فلتر الجبن
  const isCheeseCategory = categoryInfo.name.includes('الجبن') || categoryInfo.name.includes('جبن') || 
                          categoryInfo.dbValue === 'CHEESE_BUTTER' || 
                          categoryInfo.dbValue === 'cheese-butter'

  // تطبيق الفلترة
  useEffect(() => {
    let filtered = [...products]

    // فلترة حسب نوع الجبن إذا كانت فئة الجبن
    if (isCheeseCategory && selectedType && selectedType !== 'ALL') {
      filtered = filtered.filter(product => 
        product.subcategory?.includes(selectedType.toLowerCase()) ||
        product.name.toLowerCase().includes(getCheeseTypeArabic(selectedType).toLowerCase()) ||
        product.description?.toLowerCase().includes(getCheeseTypeArabic(selectedType).toLowerCase())
      )
    }

    // ترتيب النتائج
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
        break
      case 'newest':
      default:
        // الترتيب الافتراضي حسب الأحدث
        break
    }

    setFilteredProducts(filtered)
    setTotalCount(filtered.length)
  }, [products, selectedType, sortBy, isCheeseCategory])

  // مساعد الترجمة لأنواع الجبن
  const getCheeseTypeArabic = (type: string): string => {
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

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }

  return (
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

      {/* Category Header */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {categoryInfo.name}
          </h1>
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            {categoryInfo.description}
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full mb-6">
            <span className="text-sm font-medium">
              {totalCount} منتج متاح
            </span>
          </div>

          {/* أزرار الفئات الفرعية للفئة الرئيسية */}
          {subCategories && subCategories.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">الأقسام الفرعية:</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {subCategories.map((subCat: any) => (
                  <Link
                    key={subCat.id}
                    href={`/category/${subCat.slug}`}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <span className="text-sm">{subCat.name}</span>
                    {subCat.products && (
                      <span className="ml-2 bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                        {subCat.products.length}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* فلتر الجبن إذا كانت فئة الجبن */}
      {isCheeseCategory && (
        <SimpleCheeseFilter
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          productsCount={totalCount}
        />
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-8 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <FunnelIcon className="w-5 h-5 text-gray-900" />
          <span className="text-gray-900 font-bold">ترتيب حسب:</span>
          <select 
            value={sortBy}
            onChange={handleSortChange}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 font-semibold focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
          >
            <option value="newest">الأحدث</option>
            <option value="price-low">السعر: من الأقل للأعلى</option>
            <option value="price-high">السعر: من الأعلى للأقل</option>
            <option value="name">الاسم: أ-ي</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-sm text-gray-900 font-semibold">
            {totalCount} منتج
          </span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product: any) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V9a4 4 0 00-4-4H9a4 4 0 00-4 4v4.17"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">
              {isCheeseCategory && selectedType ? 
                'جرب تغيير نوع الجبن أو إزالة الفلتر للحصول على نتائج أكثر.' :
                'لا توجد منتجات متاحة في هذه الفئة حالياً.'
              }
            </p>
          </div>
        </div>
      )}
    </main>
  )
}

export default CategoryClient
