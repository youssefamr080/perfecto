'use client'

import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import ProductCard from '@/components/ProductCard'
import { Star } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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
  isBestSeller?: boolean
}

interface ProductsSwiperProps {
  products: Product[]
  title?: string
  showBestSellerBadge?: boolean
}

export default function ProductsSwiper({ 
  products, 
  title = "المنتجات المميزة",
  showBestSellerBadge = false 
}: ProductsSwiperProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            {showBestSellerBadge && (
              <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 fill-current" />
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {title}
            </h2>
            {showBestSellerBadge && (
              <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-500 fill-current" />
            )}
          </div>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            {showBestSellerBadge 
              ? "اكتشف أكثر منتجاتنا مبيعاً والأعلى تقييماً من العملاء"
              : "اكتشف أفضل منتجاتنا وأكثرها طلباً من العملاء"
            }
          </p>
        </div>
        
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={14}
          slidesPerView={2}
          navigation={false}
          pagination={{ 
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 3
          }}
          autoplay={{
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={products.length > 3}
          grabCursor={true}
          touchRatio={1}
          touchAngle={45}
          simulateTouch={true}
          allowTouchMove={true}
          breakpoints={{
            320: {
              slidesPerView: 2,
              spaceBetween: 10,
              navigation: false,
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 14,
              navigation: false,
            },
            640: {
              slidesPerView: 2.5,
              spaceBetween: 18,
              navigation: true,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 22,
              navigation: true,
            },
            1024: {
              slidesPerView: 3.5,
              spaceBetween: 28,
              navigation: true,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 32,
              navigation: true,
            },
          }}
          className="products-swiper"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="relative">
                {showBestSellerBadge && product.isBestSeller && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      <span>الأكثر مبيعاً</span>
                    </div>
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .products-swiper {
          padding-bottom: 50px;
        }
        
        .products-swiper .swiper-button-next,
        .products-swiper .swiper-button-prev {
          color: #dc2626;
          font-size: 18px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin-top: -20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #f3f4f6;
        }
        
        .products-swiper .swiper-pagination {
          bottom: 15px;
        }
        
        .products-swiper .swiper-pagination-bullet {
          background-color: #dc2626;
          opacity: 0.4;
          width: 10px;
          height: 10px;
          margin: 0 4px;
        }
        
        .products-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.3);
        }
        
        .products-swiper .swiper-button-next:after,
        .products-swiper .swiper-button-prev:after {
          font-size: 16px;
          font-weight: bold;
        }
        
        .products-swiper .swiper-button-next:hover,
        .products-swiper .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.1);
        }
        
        /* إخفاء الأسهم على الشاشات الصغيرة */
        @media (max-width: 640px) {
          .products-swiper .swiper-button-next,
          .products-swiper .swiper-button-prev {
            display: none !important;
          }
          
          .products-swiper {
            padding-bottom: 45px;
          }
          
          .products-swiper .swiper-pagination {
            bottom: 10px;
          }
        }
        
        /* تحسين للأجهزة المحمولة الصغيرة */
        @media (max-width: 480px) {
          .products-swiper .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
            margin: 0 3px;
          }
        }
      `}</style>
    </section>
  )
}
