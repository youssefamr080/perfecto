"use client"

import { useState, useEffect } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart, Star, Truck } from "lucide-react"

const banners = [
  {
    id: 1,
    title: "منتجات طبيعية 100%",
    subtitle: "بدون مواد حافظة أو إضافات صناعية",
    description: "اكتشف مجموعتنا المتنوعة من المنتجات الطبيعية الطازجة",
    buttonText: "تسوق الآن",
    buttonLink: "/categories",
    bgColor: "from-red-500 to-red-600",
    icon: "🌱",
  },
  {
    id: 2,
    title: "توصيل مجاني",
    subtitle: "للطلبات أكثر من 300 جنيه",
    description: "استمتع بالتوصيل السريع والمجاني لجميع أنحاء القاهرة",
    buttonText: "اطلب الآن",
    buttonLink: "/categories",
    bgColor: "from-green-500 to-green-600",
    icon: "🚚",
  },
  {
    id: 3,
    title: "جودة مضمونة",
    subtitle: "أو استرداد المبلغ كاملاً",
    description: "نضمن لك أعلى مستويات الجودة في جميع منتجاتنا",
    buttonText: "اعرف المزيد",
    buttonLink: "/about",
    bgColor: "from-blue-500 to-blue-600",
    icon: "⭐",
  },
]

export function HeroCarousel() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-64 md:h-80 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-400">جاري التحميل...</div>
      </div>
    )
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-0">
                <div
                  className={`relative h-64 md:h-80 bg-gradient-to-r ${banner.bgColor} flex items-center justify-center text-white`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 text-center px-6 md:px-12 max-w-4xl">
                    <div className="text-6xl md:text-8xl mb-4 animate-bounce">{banner.icon}</div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-3 animate-fade-in">{banner.title}</h1>
                    <h2 className="text-xl md:text-2xl mb-4 opacity-90 animate-fade-in">{banner.subtitle}</h2>
                    <p className="text-lg md:text-xl mb-8 opacity-80 max-w-2xl mx-auto animate-fade-in">
                      {banner.description}
                    </p>
                    <Link href={banner.buttonLink}>
                      <Button
                        size="lg"
                        className="bg-white text-gray-800 hover:bg-gray-100 font-bold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce-in"
                      >
                        <ShoppingCart className="ml-2 h-5 w-5" />
                        {banner.buttonText}
                      </Button>
                    </Link>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 opacity-20">
                    <Star className="h-8 w-8" />
                  </div>
                  <div className="absolute bottom-4 left-4 opacity-20">
                    <Truck className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  )
}
