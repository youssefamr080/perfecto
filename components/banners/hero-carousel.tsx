"use client"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay, EffectFade } from "swiper/modules"
import "swiper/css/effect-fade"
import "swiper/css"
import "swiper/css/pagination"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroCarousel() {
  return (
    <>
    <Swiper
      spaceBetween={16}
      slidesPerView={1}
      pagination={{ clickable: true }}
      modules={[Pagination, Autoplay, EffectFade]}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      className="hero-swiper rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10"
      loop
      speed={900}
      autoplay={{ delay: 3200, disableOnInteraction: false }}
      style={{ transitionTimingFunction: 'ease-in-out' }}
    >
      {/* ألبان ومنتجات */}
      <SwiperSlide>
        <div className="relative w-full h-[220px] sm:h-56 md:h-80">
          <img
            src="/banner-dairy.jpg"
            alt="منتجات الألبان"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Neutral dark gradient overlay for readability (no color tint) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent text-white flex flex-col justify-center items-start p-4 md:p-8">
            <div className="slide-caption space-y-3 md:space-y-4 max-w-lg">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white bg-transparent mb-1.5 md:mb-2.5 leading-tight">
                <span className="text-white bg-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                  منتجات الألبان
                </span>
                <br />
                <span className="text-lg md:text-3xl lg:text-4xl text-white bg-transparent font-extrabold tracking-tight drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]">
                  الطازجة 🥛
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white bg-transparent font-semibold drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] leading-relaxed">
                أفضل أنواع الجبن، الزبادي، الحليب وأكثر
              </p>
              <Link href="/category/e4ad8949-e0a5-4ae8-85a7-bba348f44a49">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm md:text-lg px-5 md:px-7 py-2.5 md:py-3.5 rounded-full shadow-2xl hover:scale-[1.04] transition-all duration-300 border-2 border-white/30 hover:border-white/50 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  🛒 تسوق الألبان
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SwiperSlide>
      
      {/* لحوم ومصنعات */}
      <SwiperSlide>
        <div className="relative w-full h-[220px] sm:h-56 md:h-80">
          <img
            src="/banner-meat.jpg"
            alt="لحوم ومصنعات"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Neutral dark gradient overlay for readability (no color tint) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent text-white flex flex-col justify-center items-start p-4 md:p-8">
            <div className="slide-caption space-y-3 md:space-y-4 max-w-lg">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white bg-transparent mb-1.5 md:mb-2.5 leading-tight">
                <span className="text-white bg-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                  لحوم ومصنعات
                </span>
                <br />
                <span className="text-lg md:text-3xl lg:text-4xl text-white bg-transparent font-extrabold drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]">
                  عالية الجودة 🥩
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white bg-transparent font-semibold drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] leading-relaxed">
                لحوم طازجة، برجر، سوسيس وأكثر
              </p>
              <Link href="/category/6f61c3b2-a4b7-4a3b-bc49-2c77a8e5bb8f">
                <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm md:text-lg px-5 md:px-7 py-2.5 md:py-3.5 rounded-full shadow-2xl hover:scale-[1.04] transition-all duration-300 border-2 border-white/30 hover:border-white/50 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  🍖 تسوق اللحوم
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SwiperSlide>
      
      {/* منتجات متنوعة */}
      <SwiperSlide>
        <div className="relative w-full h-[220px] sm:h-56 md:h-80">
          <img
            src="/banner-other.jpg"
            alt="منتجات متنوعة"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Neutral dark gradient overlay for readability (no color tint) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent text-white flex flex-col justify-center items-start p-4 md:p-8">
            <div className="slide-caption space-y-3 md:space-y-4 max-w-lg">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white bg-transparent mb-1.5 md:mb-2.5 leading-tight">
                <span className="text-white bg-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                  منتجات متنوعة
                </span>
                <br />
                <span className="text-lg md:text-3xl lg:text-4xl text-white bg-transparent font-extrabold drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]">
                  ومميزة 🍯
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white bg-transparent font-semibold drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] leading-relaxed">
                كل ما تحتاجه من منتجات غذائية أخرى
              </p>
              <Link href="/categories">
                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-sm md:text-lg px-5 md:px-7 py-2.5 md:py-3.5 rounded-full shadow-2xl hover:scale-[1.04] transition-all duration-300 border-2 border-white/30 hover:border-white/50 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  🛍️ تسوق الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SwiperSlide>
      
      {/* توصيل مجاني */}
      <SwiperSlide>
        <div className="relative w-full h-[220px] sm:h-56 md:h-80">
          <img
            src="/banner-delivery.jpg"
            alt="توصيل مجاني"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Neutral dark gradient overlay for readability (no color tint) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent text-white flex flex-col justify-center items-start p-4 md:p-8">
            <div className="slide-caption space-y-3 md:space-y-4 max-w-lg">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white bg-transparent mb-1.5 md:mb-2.5 leading-tight">
                <span className="text-white bg-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                  توصيل مجاني
                </span>
                <br />
                <span className="text-lg md:text-3xl lg:text-4xl text-white bg-transparent font-extrabold drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]">
                  سريع وآمن 🚚
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white bg-transparent font-semibold drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] leading-relaxed">
                للطلبات فوق 300 جنيه
              </p>
              <Link href="/categories">
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold text-sm md:text-lg px-5 md:px-7 py-2.5 md:py-3.5 rounded-full shadow-2xl hover:scale-[1.04] transition-all duration-300 border-2 border-white/30 hover:border-white/50 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  🏃‍♂️ تسوق الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SwiperSlide>
      
      {/* خصومات وعروض */}
      <SwiperSlide>
        <div className="relative w-full h-[220px] sm:h-56 md:h-80">
          <img
            src="/banner-offers.jpg"
            alt="خصومات وعروض"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Neutral dark gradient overlay for readability (no color tint) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent text-white flex flex-col justify-center items-start p-4 md:p-8">
            <div className="slide-caption space-y-3 md:space-y-4 max-w-lg">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white bg-transparent mb-1.5 md:mb-2.5 leading-tight">
                <span className="text-white bg-transparent drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                  خصومات وعروض
                </span>
                <br />
                <span className="text-lg md:text-3xl lg:text-4xl text-white bg-transparent font-extrabold drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)]">
                  حصرية 🔥
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-white bg-transparent font-semibold drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] leading-relaxed">
                استمتع بأفضل الأسعار والعروض على منتجاتنا
              </p>
              <Link href="/offers">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm md:text-lg px-5 md:px-7 py-2.5 md:py-3.5 rounded-full shadow-2xl hover:scale-[1.04] transition-all duration-300 border-2 border-white/30 hover:border-white/50 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
                  🎁 شاهد العروض
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SwiperSlide>
     </Swiper>
     <style jsx global>{`
      .hero-swiper .swiper-pagination {
        bottom: 8px !important;
      }
      .hero-swiper .swiper-pagination-bullet {
        background: rgba(255,255,255,0.65);
        opacity: 1;
        width: 8px;
        height: 8px;
        margin: 0 6px !important;
        transition: transform .25s ease, background-color .25s ease, box-shadow .25s ease;
      }
      .hero-swiper .swiper-pagination-bullet-active {
        background: linear-gradient(90deg, #ffffff, #e5e7eb);
        transform: scale(1.35);
        box-shadow: 0 0 0 2px rgba(255,255,255,0.35);
      }
      @media (min-width: 768px) {
        .hero-swiper .swiper-pagination { bottom: 12px !important; }
        .hero-swiper .swiper-pagination-bullet { width: 9px; height: 9px; }
      }
      /* Force white text inside slide captions regardless of global overrides */
      .hero-swiper .slide-caption,
      .hero-swiper .slide-caption * {
        color: #ffffff !important;
      }
     `}</style>
    </>
  )
}
