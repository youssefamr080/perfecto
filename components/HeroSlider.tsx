'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

interface SlideData {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  discount?: string
  backgroundColor: string
  textColor: string
}

const slidesData: SlideData[] = [
  {
    id: 1,
    title: 'عروض حصرية على الجبن',
    subtitle: 'خصم يصل إلى 30%',
    description: 'أفضل أنواع الجبن بأسعار لا تُقاوم - عرض لفترة محدودة',
    image: '/images/cheese-banner.jpg',
    buttonText: 'تسوق الجبن الآن',
    buttonLink: '/category/cheese',
    discount: '30%',
    backgroundColor: 'from-yellow-400 via-amber-500 to-orange-600',
    textColor: 'text-white'
  },
  {
    id: 2,
    title: 'لانشون طازج ولذيذ',
    subtitle: 'جودة مضمونة',
    description: 'لانشون دجاج ولحم طازج من أفضل المصادر - توصيل خلال 30 دقيقة',
    image: '/images/luncheon-banner.jpg',
    buttonText: 'اطلب لانشون',
    buttonLink: '/category/luncheon',
    backgroundColor: 'from-red-500 via-pink-600 to-red-700',
    textColor: 'text-white'
  },
  {
    id: 3,
    title: 'عسل طبيعي 100%',
    subtitle: 'من أجود الأنواع',
    description: 'عسل طبيعي أصلي من أفضل المناحل المصرية - فوائد صحية مذهلة',
    image: '/images/honey-banner.jpg',
    buttonText: 'اشتري عسل',
    buttonLink: '/category/honey',
    backgroundColor: 'from-amber-400 via-yellow-500 to-orange-500',
    textColor: 'text-white'
  },
  {
    id: 4,
    title: 'كفتة وسجق طازج',
    subtitle: 'مُتبل ومُحضر بعناية',
    description: 'كفتة وسجق طازج محضر يومياً بأفضل التوابل والخلطات السرية',
    image: '/images/meat-banner.jpg',
    buttonText: 'اطلب الآن',
    buttonLink: '/category/kofta',
    backgroundColor: 'from-red-600 via-red-700 to-red-800',
    textColor: 'text-white'
  },
  {
    id: 5,
    title: 'منتجات الألبان الطازجة',
    subtitle: 'لبن وزبادي طبيعي',
    description: 'منتجات ألبان طازجة يومياً من أفضل المزارع المصرية',
    image: '/images/dairy-banner.jpg',
    buttonText: 'تسوق الألبان',
    buttonLink: '/category/yogurt',
    backgroundColor: 'from-blue-400 via-cyan-500 to-blue-700',
    textColor: 'text-white'
  }
]

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isDragging) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length)
    }, 5000) // تغيير كل 5 ثواني

    return () => clearInterval(interval)
  }, [isAutoPlaying, isDragging])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    // إعادة تشغيل الـ auto-play بعد 10 ثوانٍ
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX)
    setIsAutoPlaying(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX
    const walk = (x - startX) * 2
    if (Math.abs(walk) > 50) {
      if (walk > 0) {
        // سحب لليمين - الشريحة السابقة
        const newSlide = currentSlide === 0 ? slidesData.length - 1 : currentSlide - 1
        setCurrentSlide(newSlide)
      } else {
        // سحب لليسار - الشريحة التالية
        const newSlide = (currentSlide + 1) % slidesData.length
        setCurrentSlide(newSlide)
      }
      setIsDragging(false)
      setTimeout(() => setIsAutoPlaying(true), 10000)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setTimeout(() => setIsAutoPlaying(true), 3000)
  }

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setIsAutoPlaying(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const x = e.touches[0].clientX
    const walk = x - startX
    if (Math.abs(walk) > 50) {
      if (walk > 0) {
        // سحب لليمين - الشريحة السابقة
        const newSlide = currentSlide === 0 ? slidesData.length - 1 : currentSlide - 1
        setCurrentSlide(newSlide)
      } else {
        // سحب لليسار - الشريحة التالية
        const newSlide = (currentSlide + 1) % slidesData.length
        setCurrentSlide(newSlide)
      }
      setIsDragging(false)
      setTimeout(() => setIsAutoPlaying(true), 10000)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setTimeout(() => setIsAutoPlaying(true), 3000)
  }

  const currentSlideData = slidesData[currentSlide]

  return (
    <section 
      ref={sliderRef}
      className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ userSelect: 'none' }}
    >
      {/* Background Slider */}
      <div className="absolute inset-0">
        {slidesData.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover object-center"
                priority={index === 0}
                quality={90}
                sizes="100vw"
                onError={(e) => {
                  // Fallback to gradient background if image fails
                  console.log('Image failed to load:', slide.image)
                  const target = e.target as HTMLElement
                  target.style.display = 'none'
                }}
              />
              {/* Colorful gradient overlay for each category */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.backgroundColor} mix-blend-overlay opacity-60`} />
              {/* Fallback gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.backgroundColor} opacity-30`} />
            </div>
            
            {/* Light overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Discount Badge */}
            {currentSlideData.discount && (
              <div className="inline-block mb-4 md:mb-6">
                <div className="bg-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-lg md:text-xl shadow-lg animate-pulse">
                  خصم {currentSlideData.discount}
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 ${currentSlideData.textColor} drop-shadow-lg`}>
              {currentSlideData.title}
            </h1>

            {/* Subtitle */}
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 ${currentSlideData.textColor} opacity-90 drop-shadow-md`}>
              {currentSlideData.subtitle}
            </h2>

            {/* Description */}
            <p className={`text-base sm:text-lg md:text-xl mb-6 md:mb-8 ${currentSlideData.textColor} opacity-80 max-w-3xl mx-auto leading-relaxed drop-shadow-sm`}>
              {currentSlideData.description}
            </p>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
              <Link
                href={currentSlideData.buttonLink}
                className="bg-white text-red-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl text-base md:text-lg transform hover:scale-105"
              >
                {currentSlideData.buttonText}
              </Link>
              <Link
                href="/categories"
                className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-white hover:text-red-600 transition-all duration-200 text-base md:text-lg"
              >
                عرض جميع الأقسام
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide Counter - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20 md:hidden">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="text-white text-sm font-medium">
            {currentSlide + 1} / {slidesData.length}
          </div>
        </div>
      </div>

      {/* Mobile Play/Pause - Bottom Right */}
      <div className="absolute bottom-4 right-4 z-20 md:hidden">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-lg p-3 transition-all duration-200 hover:scale-110"
          aria-label={isAutoPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل تلقائي'}
        >
          {isAutoPlaying ? (
            <PauseIcon className="w-5 h-5 text-white" />
          ) : (
            <PlayIcon className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Desktop Controls - Bottom Center */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden md:block">
        <div className="flex items-center space-x-3 rtl:space-x-reverse bg-black/30 backdrop-blur-sm rounded-full px-4 py-2">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 hover:scale-110"
            aria-label={isAutoPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل تلقائي'}
          >
            {isAutoPlaying ? (
              <PauseIcon className="w-4 h-4 text-white" />
            ) : (
              <PlayIcon className="w-4 h-4 text-white" />
            )}
          </button>

          {/* Slide Counter */}
          <div className="text-white text-sm font-medium">
            {currentSlide + 1} / {slidesData.length}
          </div>

          {/* Swipe Indicator */}
          <div className="text-white/70 text-xs hidden lg:block">
            👆 اسحب للتبديل
          </div>
        </div>
      </div>

      {/* Enhanced Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className={`h-full bg-gradient-to-r ${currentSlideData.backgroundColor} transition-all duration-300 ease-linear`}
          style={{
            width: isAutoPlaying ? '100%' : '0%',
            transition: isAutoPlaying ? 'width 5s linear' : 'width 0.3s ease'
          }}
        />
      </div>
    </section>
  )
}

export default HeroSlider
