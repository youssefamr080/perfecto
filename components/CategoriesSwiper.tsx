'use client'

import React from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  productCount?: number
}

interface CategoriesSwiperProps {
  categories: Category[]
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
          spaceBetween={10}
          slidesPerView={3.5}
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
              slidesPerView: 3,
              spaceBetween: 8,
              navigation: false,
            },
            380: {
              slidesPerView: 3.5,
              spaceBetween: 10,
              navigation: false,
            },
            480: {
              slidesPerView: 4,
              spaceBetween: 12,
              navigation: false,
            },
            640: {
              slidesPerView: 5,
              spaceBetween: 15,
              navigation: true,
            },
            768: {
              slidesPerView: 6,
              spaceBetween: 20,
              navigation: true,
            },
            1024: {
              slidesPerView: 7,
              spaceBetween: 25,
              navigation: true,
            },
            1280: {
              slidesPerView: 8,
              spaceBetween: 30,
              navigation: true,
            },
          }}
          className="categories-swiper"
        >
          {categories.map((category) => (
            <SwiperSlide key={category.id}>
              <Link
                href={`/category/${category.slug}`}
                className="group flex flex-col items-center p-2 md:p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-105 min-h-[90px] md:min-h-[110px]"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-red-100 rounded-full flex items-center justify-center mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                  <span className="text-lg md:text-2xl lg:text-3xl">{category.icon || '🛒'}</span>
                </div>
                <span className="text-xs md:text-sm font-bold text-gray-900 text-center group-hover:text-red-600 transition-colors duration-200 leading-tight">
                  {category.name}
                </span>
                {category.productCount && (
                  <span className="text-xs text-gray-500 mt-0.5 hidden md:block">
                    {category.productCount} منتج
                  </span>
                )}
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
