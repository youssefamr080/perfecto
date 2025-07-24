'use client'

import React from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { AppCategory } from '@/types'; // <-- 1. استيراد النوع الصحيح

// <-- 2. إزالة الواجهة المحلية

interface CategoriesSwiperProps {
  categories: AppCategory[] // <-- 3. استخدام النوع الصحيح
  title?: string
}

export default function CategoriesSwiper({ categories, title = "الفئات الأكثر طلباً" }: CategoriesSwiperProps) {
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <section className="py-6 md:py-8 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
          {title}
        </h2>
        
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={3.2}
          navigation={false}
          pagination={{ 
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 3
          }}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={categories.length > 6}
          centeredSlides={false}
          grabCursor={true}
          touchRatio={1}
          touchAngle={45}
          simulateTouch={true}
          allowTouchMove={true}
          breakpoints={{
            320: {
              slidesPerView: 2.5,
              spaceBetween: 12,
              navigation: false,
            },
            380: {
              slidesPerView: 3.2,
              spaceBetween: 16,
              navigation: false,
            },
            480: {
              slidesPerView: 4,
              spaceBetween: 18,
              navigation: false,
            },
            640: {
              slidesPerView: 5,
              spaceBetween: 20,
              navigation: true,
            },
            768: {
              slidesPerView: 6,
              spaceBetween: 24,
              navigation: true,
            },
            1024: {
              slidesPerView: 7,
              spaceBetween: 28,
              navigation: true,
            },
            1280: {
              slidesPerView: 8,
              spaceBetween: 32,
              navigation: true,
            },
          }}
          className="categories-swiper"
        >
          {categories.map((category) => (
            <SwiperSlide key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className="block rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-300 bg-white"
              >
                <div className="flex flex-col items-center justify-center py-4">
                  {category.icon && (
                    <span className="text-3xl md:text-4xl mb-2 drop-shadow-lg">{category.icon}</span>
                  )}
                  <span className="text-xs md:text-base font-bold text-gray-900 text-center drop-shadow-sm">
                    {category.name}
                  </span>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .categories-swiper {
          padding-bottom: 45px;
        }
        
        .categories-swiper .swiper-button-next,
        .categories-swiper .swiper-button-prev {
          color: #dc2626;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          width: 35px;
          height: 35px;
          margin-top: -17px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          border: 1px solid #f3f4f6;
        }
        
        .categories-swiper .swiper-pagination {
          bottom: 10px;
        }
        
        .categories-swiper .swiper-pagination-bullet {
          background-color: #dc2626;
          opacity: 0.4;
          width: 8px;
          height: 8px;
          margin: 0 3px;
        }
        
        .categories-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          transform: scale(1.3);
        }
        
        .categories-swiper .swiper-button-next:after,
        .categories-swiper .swiper-button-prev:after {
          font-size: 14px;
          font-weight: bold;
        }
        
        .categories-swiper .swiper-button-next:hover,
        .categories-swiper .swiper-button-prev:hover {
          background: rgba(255, 255, 255, 1);
          transform: scale(1.1);
        }
        
        /* إخفاء الأسهم على الشاشات الصغيرة */
        @media (max-width: 640px) {
          .categories-swiper .swiper-button-next,
          .categories-swiper .swiper-button-prev {
            display: none !important;
          }
          
          .categories-swiper {
            padding-bottom: 40px;
          }
          
          .categories-swiper .swiper-pagination {
            bottom: 5px;
          }
        }
        
        /* تحسين السويبر للأجهزة المحمولة */
        @media (max-width: 480px) {
          .categories-swiper .swiper-pagination-bullet {
            width: 6px;
            height: 6px;
            margin: 0 2px;
          }
        }
      `}</style>
    </section>
  )
}
