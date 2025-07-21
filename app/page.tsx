import React from 'react'
import Link from 'next/link'

import CategoryCard from '@/components/CategoryCard'
import HeroSlider from '@/components/HeroSlider'
import CategoriesSwiper from '@/components/CategoriesSwiper'
import ProductsSwiper from '@/components/ProductsSwiper'
import { Truck, Clock, Shield, Percent } from 'lucide-react'
import { getSubCategoriesWithProductCounts } from '@/lib/categories-with-products'
import { getMostPopularCategories, getBestSellerProducts, getHomeFeaturedProducts } from '@/lib/homepage-data'

// جلب بيانات الصفحة الرئيسية من قاعدة البيانات فقط
async function getHomePageData() {
  try {
    // جلب الفئات الفرعية مع عدد المنتجات من قاعدة البيانات
    const subCategories = await getSubCategoriesWithProductCounts()

    // جلب المنتجات المميزة من قاعدة البيانات
    const featuredProducts = await getHomeFeaturedProducts()

    // جلب الفئات الأكثر طلباً (للسويبر)
    const popularCategories = await getMostPopularCategories()

    // جلب المنتجات الأكثر مبيعاً
    const bestSellerProducts = await getBestSellerProducts()

    return { 
      categories: subCategories, 
      featuredProducts,
      popularCategories,
      bestSellerProducts
    }
  } catch (error) {
    console.error('Error fetching home page data:', error)
    return { 
      categories: [], 
      featuredProducts: [],
      popularCategories: [],
      bestSellerProducts: []
    }
  }
}

const features = [
  {
    icon: Truck,
    title: 'توصيل سريع',
    description: 'توصيل خلال 30 دقيقة'
  },
  {
    icon: Shield,
    title: 'جودة مضمونة',
    description: 'منتجات طازجة 100%'
  },
  {
    icon: Clock,
    title: 'متاح 24/7',
    description: 'خدمة متواصلة'
  },
  {
    icon: Percent,
    title: 'أسعار منافسة',
    description: 'أفضل الأسعار في السوق'
  }
]

// Custom type for categories with product count
interface CategoryCardType {
  id: string;
  name: string;
  icon: string | null;
  slug: string;
  image?: string;
  productsCount?: number;
}

export default async function Home() {
  const { categories, featuredProducts, popularCategories, bestSellerProducts } = await getHomePageData()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-red-50">
      <main>
        {/* Hero Section */}
        <section className="relative rounded-b-3xl overflow-hidden shadow-lg mb-4 md:mb-8">
          <HeroSlider />
        </section>

        {/* الفئات الأكثر طلباً - سويبر ديناميكي */}
        <section className="mb-6 md:mb-10">
          <CategoriesSwiper 
            categories={popularCategories as any} 
            title="الفئات الأكثر طلباً" 
          />
        </section>

        {/* المنتجات الأكثر مبيعاً */}
        {bestSellerProducts.length > 0 && (
          <section className="mb-6 md:mb-10">
            <ProductsSwiper 
              products={bestSellerProducts} 
              title="الأكثر مبيعاً" 
              showBestSellerBadge={true}
            />
          </section>
        )}

        {/* Features Section */}
        <section className="py-8 md:py-14 bg-gradient-to-r from-red-50 via-white to-yellow-50 rounded-2xl shadow-sm mx-2 md:mx-auto mb-6 md:mb-10">
          <div className="container mx-auto px-2 md:px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="text-center p-4 rounded-xl bg-white/80 hover:bg-red-50 shadow transition-colors duration-200 flex flex-col items-center">
                    <div className="w-14 h-14 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-md">
                      <Icon className="w-7 h-7 md:w-10 md:h-10 text-red-600" />
                    </div>
                    <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-gray-900 drop-shadow-sm">{feature.title}</h3>
                    <p className="text-xs md:text-base text-gray-600">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-8 md:py-16 bg-gradient-to-br from-white via-gray-50 to-red-50 rounded-2xl shadow-sm mx-2 md:mx-auto mb-6 md:mb-10">
          <div className="container mx-auto px-2 md:px-4">
            <div className="text-center mb-6 md:mb-12">
              <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4 drop-shadow-sm">
                تسوق حسب القسم
              </h2>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                اختر من مجموعة واسعة من المنتجات الطازجة عالية الجودة
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
              {categories.map((category: any) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>

        {/* المنتجات المميزة */}
        <section className="mb-6 md:mb-10">
          <ProductsSwiper 
            products={featuredProducts} 
            title="المنتجات المميزة" 
            showBestSellerBadge={false}
          />
        </section>

        {/* روابط سريعة */}
        <section className="py-8 md:py-12 bg-gradient-to-l from-red-50 via-white to-yellow-50 rounded-2xl shadow-sm mx-2 md:mx-auto mb-6 md:mb-10">
          <div className="container mx-auto px-4 text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
              <Link 
                href="/categories"
                className="inline-block bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl text-base md:text-lg"
              >
                تصفح الأقسام
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
