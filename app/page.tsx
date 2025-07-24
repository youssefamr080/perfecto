import React from 'react'
import Link from 'next/link'

import CategoryCard from '@/components/CategoryCard'
import HeroSlider from '@/components/HeroSlider'
import CategoriesSwiper from '@/components/CategoriesSwiper'
import ProductsCarousel from '@/components/ProductsCarousel'
import { Truck, Shield, Clock, Percent } from 'lucide-react'; // <-- 1. إضافة الاستيرادات
import { AppCategory, AppProduct } from '@/types';
import { getNewProducts, getMostPopularCategories, getBestSellerProducts } from '@/lib/homepage-data';

// جلب بيانات الصفحة الرئيسية من قاعدة البيانات فقط
async function getData() {
  try {
    // جلب جميع البيانات بشكل متوازٍ لتحسين الأداء
    const [newProducts, popularCategories, bestSellerProducts] = await Promise.all([
      getNewProducts(10),
      getMostPopularCategories(),
      getBestSellerProducts(10),
    ]);

    return { popularCategories, newProducts, bestSellerProducts };

  } catch (error) {
    console.error('Error fetching home page data:', error);
    return {
      popularCategories: [],
      newProducts: [],
      bestSellerProducts: [],
    };
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

export default async function Home() {

  const { popularCategories, newProducts, bestSellerProducts } = await getData()


  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-red-50">
      <main>
        {/* Hero Section */}
        <section className="relative rounded-b-3xl overflow-hidden shadow-lg mb-4 md:mb-8">
          <HeroSlider />
        </section>

        {/* الأكثر طلبا - Categories */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">الأكثر طلباً</h2>

            </div>
            <div>
              <CategoriesSwiper categories={popularCategories as AppCategory[]} title="الفئات الأكثر طلباً" />
            </div>
          </div>
        </section>

        {/* الأكثر مبيعًا - Products */}
        <section className="py-12 bg-white">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">الأكثر مبيعًا</h2>

            </div>
            <div>
              <ProductsCarousel products={bestSellerProducts as AppProduct[]} title="المنتجات الأكثر مبيعًا" />
            </div>
          </div>
        </section>

        {/* وصل حديثا - Products */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">وصل حديثاً</h2>

            </div>
            <div>
              <ProductsCarousel products={newProducts as AppProduct[]} title="منتجات جديدة" />
            </div>
          </div>
        </section>

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
              {popularCategories.map((category: AppCategory) => ( // <-- 3. تصحيح النوع
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>
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
