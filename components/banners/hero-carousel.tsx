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
    <Swiper
      spaceBetween={16}
      slidesPerView={1}
      pagination={{ clickable: true }}
      modules={[Pagination, Autoplay, EffectFade]}
      effect="fade"
      fadeEffect={{ crossFade: true }}
      className="rounded-xl overflow-hidden shadow-md"
      loop
      speed={900}
      autoplay={{ delay: 3200, disableOnInteraction: false }}
      style={{ transitionTimingFunction: 'ease-in-out' }}
    >
      {/* ألبان ومنتجات */}
      <SwiperSlide>
        <div className="relative w-full h-56 md:h-80">
          <img
            src="/banner-dairy.jpg"
            alt="منتجات الألبان"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start p-8">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">منتجات الألبان الطازجة</h2>
            <p className="text-white mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">أفضل أنواع الجبن، الزبادي، الحليب وأكثر</p>
            <Link href="/category/e4ad8949-e0a5-4ae8-85a7-bba348f44a49">
              <Button className="bg-white text-green-700 font-bold">تسوق الألبان</Button>
            </Link>
          </div>
        </div>
      </SwiperSlide>
      {/* لحوم ومصنعات */}
      <SwiperSlide>
        <div className="relative w-full h-56 md:h-80">
          <img
            src="/banner-meat.jpg"
            alt="اللحوم والمصنعات"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start p-8">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">لحوم ومصنعات عالية الجودة</h2>
            <p className="text-white mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">لحوم طازجة، برجر، سوسيس وأكثر</p>
            <Link href="/category/48bea0ba-08ac-44e7-9790-46d8a574ae55">
              <Button className="bg-white text-green-700 font-bold">تسوق اللحوم</Button>
            </Link>
          </div>
        </div>
      </SwiperSlide>
      {/* أخرى */}
      <SwiperSlide>
        <div className="relative w-full h-56 md:h-80">
          <img
            src="/banner-other.jpg"
            alt="منتجات أخرى"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start p-8">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">منتجات متنوعة</h2>
            <p className="text-white mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">كل ما تحتاجه من منتجات غذائية أخرى</p>
            <Link href="/category/e035e289-e068-42ba-89ed-1d1cbc409c75">
              <Button className="bg-white text-green-700 font-bold">تسوق الآن</Button>
            </Link>
          </div>
        </div>
      </SwiperSlide>
      {/* توصيل مجاني */}
      <SwiperSlide>
        <div className="relative w-full h-56 md:h-80">
          <img
            src="/banner-delivery.jpg"
            alt="توصيل مجاني"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start p-8">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">توصيل مجاني</h2>
            <p className="text-white mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">للطلبات فوق 300 جنيه</p>
            <Link href="/categories">
              <Button className="bg-white text-green-700 font-bold">تسوق الآن</Button>
            </Link>
          </div>
        </div>
      </SwiperSlide>
      {/* خصومات وعروض */}
      <SwiperSlide>
        <div className="relative w-full h-56 md:h-80">
          <img
            src="/banner-offers.jpg"
            alt="خصومات وعروض"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start p-8">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">خصومات وعروض حصرية</h2>
            <p className="text-white mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">استمتع بأفضل الأسعار والعروض على منتجاتنا</p>
            <Link href="/offers">
              <Button className="bg-white text-red-700 font-bold">شاهد العروض</Button>
            </Link>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  )
}
