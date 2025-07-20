'use client'

import React, { useState, useMemo } from 'react'
import ProductCard from '@/components/ProductCard'
import { UnitType } from '@prisma/client'

interface CheeseProduct {
  id: string
  name: string
  price: number
  oldPrice?: number
  images: string[]
  unitType: UnitType
  isAvailable: boolean
  category: string
  description?: string
  subcategory?: string
  isBestSeller: boolean
  inStock: number
  createdAt: Date
  updatedAt: Date
  subCategoryId?: string | null
  minOrder?: number | null
  maxOrder?: number | null
}

interface CheesePageClientProps {
  initialProducts: CheeseProduct[]
  totalCount: number
}

const CHEESE_FILTERS = {
  CHEDDAR: 'شيدر',
  ROMY: 'رومي',
  KERRY: 'كيري',
  CREAMY: 'كريمي',
  BRAMILI: 'براميلي',
  QAREESH: 'قريش',
  FETA: 'فيتا',
  MOZZARELLA: 'موزاريلا',
  WHITE_CHEESE: 'جبنة بيضاء',
  PROCESSED: 'مطبوخة'
}

const BRAND_FILTERS = {
  DOMTY: 'دومتي',
  LABANITA: 'لبنيتا',
  JUHAYNA: 'جهينة',
  ELLE_NASR: 'العلاء والنصر',
  PRESIDENT: 'بريزيدنت',
  KIRI: 'كيري',
  PANDA: 'باندا'
}

export default function CheesePageClient({ initialProducts, totalCount }: CheesePageClientProps) {
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('newest')

  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts]

    // تصفية حسب النوع
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(product => product.subcategory === selectedType)
    }

    // تصفية حسب الماركة
    if (selectedBrand !== 'ALL') {
      filtered = filtered.filter(product => {
        const productName = product.name.toLowerCase()
        const brandName = selectedBrand.toLowerCase()
        return productName.includes(brandName) || 
               productName.includes(BRAND_FILTERS[selectedBrand as keyof typeof BRAND_FILTERS]?.toLowerCase() || '')
      })
    }

    // ترتيب النتائج
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'))
        break
      case 'newest':
      default:
        // المنتجات مرتبة بالفعل حسب التاريخ
        break
    }

    return filtered
  }, [initialProducts, selectedType, selectedBrand, sortBy])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* العنوان */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الجبن والسمنة</h1>
          <p className="text-gray-600">تشكيلة متنوعة من أجود أنواع الجبن المحلي والمستورد</p>
        </div>

        {/* الفلاتر */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* فلتر النوع */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الجبن
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ALL">جميع الأنواع</option>
                {Object.entries(CHEESE_FILTERS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            {/* فلتر الماركة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الماركة
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="ALL">جميع الماركات</option>
                {Object.entries(BRAND_FILTERS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            {/* فلتر الترتيب */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ترتيب حسب
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="newest">الأحدث</option>
                <option value="price_low">السعر من الأقل للأعلى</option>
                <option value="price_high">السعر من الأعلى للأقل</option>
                <option value="name">الاسم أبجدياً</option>
              </select>
            </div>
          </div>

          {/* عدد النتائج */}
          <div className="mt-4 text-sm text-gray-600">
            عرض {filteredProducts.length} من أصل {totalCount} منتج
          </div>
        </div>

        {/* قائمة المنتجات */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.9-6.1-2.4M15 13.5v6m0 0l3-3m-3 3l-3-3" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">لم نجد أي منتجات تطابق المعايير المحددة</p>
          </div>
        )}
      </div>
    </div>
  )
}
