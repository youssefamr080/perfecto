"use client"

import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import Link from "next/link"
import { ArrowLeft, Star, Truck, Shield, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product-card"
// استبدال الهيرو سيكشن بسلايدر بانر مخصص
import { PullToRefresh } from "@/components/ui/pull-to-refresh"
import { ProductGridSkeleton } from "@/components/loading/product-skeleton"
import { CategoryGridSkeleton } from "@/components/loading/category-skeleton"
import type { Product, Category } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { getCachedProducts } from "@/lib/utils"
import { HeroCarousel } from "@/components/banners/hero-carousel"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      // Fetch all products from cache
      const allProducts = await getCachedProducts()
      // Featured only
      setFeaturedProducts(allProducts.filter(p => p.is_featured).slice(0, 8))

      // Fetch categories
      const { data: categoriesData } = await supabase.from("categories").select("*").limit(6)
      setCategories(categoriesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = async () => {
    await fetchData()
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-6">
          <HeroCarousel />
        </section>

        {/* Features Section */}
        <section className="bg-white py-8 border-y">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center group">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors duration-300">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">توصيل مجاني</h3>
                <p className="text-sm text-gray-600">للطلبات أكثر من 300 ج.م</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors duration-300">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">جودة مضمونة</h3>
                <p className="text-sm text-gray-600">أو استرداد المبلغ</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-yellow-200 transition-colors duration-300">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">منتجات طبيعية</h3>
                <p className="text-sm text-gray-600">100% بدون مواد حافظة</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors duration-300">
                  <Award className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">نقاط ولاء</h3>
                <p className="text-sm text-gray-600">مع كل طلب</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">تسوق حسب الفئة</h2>
            <Link href="/categories">
              <Button variant="outline" className="group bg-transparent">
                عرض الكل
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <CategoryGridSkeleton count={6} />
          ) : (
            <>
              {/* موبايل: سويبر */}
              <div className="block md:hidden">
                <Swiper
                  spaceBetween={12}
                  slidesPerView={2.2}
                  pagination={{ clickable: true }}
                  modules={[Pagination]}
                  className="pb-8"
                >
                  {categories.map((category) => (
                    <SwiperSlide key={category.id}>
                      <Link href={`/category/${category.id}`} className="group block">
                        <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-300 overflow-hidden group-hover:scale-105">
                          <div className="aspect-square bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-2 overflow-hidden">
                            {category.image_url ? (
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className="object-contain w-full h-full rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <img
                                src="/placeholder.svg?height=120&width=120&text=تصنيف"
                                alt="تصنيف"
                                className="object-contain w-full h-full rounded-xl opacity-60"
                              />
                            )}
                          </div>
                          <div className="p-4 text-center">
                            <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors duration-200">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                          </div>
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              {/* ديسكتوب: شبكة */}
              <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <Link key={category.id} href={`/category/${category.id}`} className="group">
                    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-300 overflow-hidden group-hover:scale-105">
                      <div className="aspect-square bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-2 overflow-hidden">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="object-contain w-full h-full rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <img
                            src="/placeholder.svg?height=120&width=120&text=تصنيف"
                            alt="تصنيف"
                            className="object-contain w-full h-full rounded-xl opacity-60"
                          />
                        )}
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors duration-200">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Featured Products Section */}
        <section className="bg-gradient-to-r from-green-50 to-green-100 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">المنتجات المميزة</h2>
                <p className="text-gray-600">أفضل منتجاتنا المختارة خصيصاً لك</p>
              </div>
              <Badge className="bg-yellow-500 text-white animate-pulse">
                <Star className="h-4 w-4 mr-1" />
                مميز
              </Badge>
            </div>

            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="animate-fade-in-up">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            {!loading && featuredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🛍️</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد منتجات مميزة</h3>
                <p className="text-gray-500">سيتم إضافة منتجات مميزة قريباً</p>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">ابدأ التسوق الآن</h2>
              <p className="text-xl text-green-100 mb-8">اكتشف أجود المنتجات الطبيعية واستمتع بالتوصيل المجاني</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/categories">
                  <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 w-full sm:w-auto">
                    تصفح المنتجات
                  </Button>
                </Link>
                <Link href="/offers">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-green-600 w-full sm:w-auto bg-transparent"
                  >
                    العروض الخاصة
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section تم حذفه بناءً على طلب المستخدم */}
      </div>
    </PullToRefresh>
  )
}
