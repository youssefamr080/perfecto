"use client"

import React from 'react'
import Link from 'next/link'
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  ShoppingBag, 
  Heart, 
  Shield, 
  Clock,
  Star,
  Mail,
  Facebook
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/categories', label: 'المنتجات' },
    { href: '/offers', label: 'العروض' },
    { href: '/about', label: 'من نحن' },
  ]

  const customerLinks = [
    { href: '/profile', label: 'الملف الشخصي' },
    { href: '/orders', label: 'طلباتي' },
    { href: '/loyalty', label: 'نقاط الولاء' },
    { href: '/cart', label: 'السلة' },
  ]

  return (
    <footer className="bg-gradient-to-b from-red-600 via-red-700 to-red-800 text-white relative overflow-hidden">
      {/* تأثير بصري خلفي */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-yellow-300 rounded-full blur-3xl"></div>
      </div>
      
      {/* القسم الرئيسي محسن للموبايل */}
      <div className="container mx-auto px-3 py-8 lg:px-6 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12">
          
          {/* معلومات الشركة - محسنة للموبايل */}
          <div className="space-y-4 lg:col-span-1 text-center lg:text-right">
            <div className="space-y-3">
              <h3 className="text-xl lg:text-3xl font-black text-white flex items-center justify-center lg:justify-start gap-2">
                <div className="p-2 lg:p-3 bg-gradient-to-br from-white/20 to-white/10 rounded-lg lg:rounded-xl backdrop-blur-sm border border-white/20">
                  <ShoppingBag className="h-5 w-5 lg:h-9 lg:w-9 text-white" />
                </div>
                <span className="bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent">
                  بيرفكتو تيب
                </span>
              </h3>
              <div className="w-16 lg:w-20 h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 rounded-full shadow-lg mx-auto lg:mx-0"></div>
            </div>
            
            {/* وصف مبسط للموبايل */}
            <div className="bg-white/5 backdrop-blur-sm p-3 lg:p-4 rounded-lg lg:rounded-xl border border-white/10">
              <p className="text-sm lg:text-lg leading-relaxed font-medium text-red-50">
                <span className="text-yellow-300 font-bold text-base lg:text-xl">🌟</span><br className="lg:hidden" />
                أجود المنتجات الطبيعية 100% بدون مواد حافظة. نوفر لك أفضل اللحوم والأجبان والألبان الطازجة.
              </p>
            </div>
            
            {/* تقييم مبسط للموبايل */}
            <div className="flex items-center justify-center lg:justify-start gap-2 bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-sm rounded-lg lg:rounded-xl p-3 lg:p-4 border border-white/20 shadow-lg">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-400 fill-current drop-shadow-lg" />
                <Star className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-400 fill-current drop-shadow-lg" />
                <Star className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-400 fill-current drop-shadow-lg" />
                <Star className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-400 fill-current drop-shadow-lg" />
                <Star className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-400 fill-current drop-shadow-lg" />
              </div>
              <span className="text-sm lg:text-lg text-white font-black bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">
                +1000 عميل
              </span>
            </div>
          </div>

          {/* روابط سريعة - محسنة للموبايل */}
          <div className="space-y-4 text-center lg:text-right">
            <div className="space-y-2">
              <h4 className="text-lg lg:text-2xl font-black text-white flex items-center justify-center lg:justify-start gap-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                روابط سريعة
              </h4>
              <div className="w-12 lg:w-16 h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 rounded-full shadow-lg mx-auto lg:mx-0"></div>
            </div>
            
            {/* روابط في صفوف للموبايل */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-4">
              {quickLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="text-red-50 hover:text-yellow-300 transition-all duration-300 text-sm lg:text-lg flex items-center justify-center lg:justify-start gap-2 lg:gap-3 group hover:translate-x-1 bg-white/5 hover:bg-white/10 p-2 lg:p-3 rounded-lg border border-transparent hover:border-yellow-400/30"
                >
                  <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full group-hover:w-3 group-hover:h-3 lg:group-hover:w-4 lg:group-hover:h-4 group-hover:from-yellow-300 group-hover:to-yellow-400 transition-all duration-300 shadow-lg"></div>
                  <span className="font-semibold text-center lg:text-right">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* خدمات العملاء - محسنة للموبايل */}
          <div className="space-y-4 text-center lg:text-right">
            <div className="space-y-2">
              <h4 className="text-lg lg:text-2xl font-black text-white flex items-center justify-center lg:justify-start gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                حسابي
              </h4>
              <div className="w-12 lg:w-16 h-1 bg-gradient-to-r from-green-400 via-green-300 to-green-200 rounded-full shadow-lg mx-auto lg:mx-0"></div>
            </div>
            
            {/* روابط في صفوف للموبايل */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-4">
              {customerLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="text-red-50 hover:text-green-300 transition-all duration-300 text-sm lg:text-lg flex items-center justify-center lg:justify-start gap-2 lg:gap-3 group hover:translate-x-1 bg-white/5 hover:bg-white/10 p-2 lg:p-3 rounded-lg border border-transparent hover:border-green-400/30"
                >
                  <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full group-hover:w-3 group-hover:h-3 lg:group-hover:w-4 lg:group-hover:h-4 group-hover:from-green-300 group-hover:to-green-400 transition-all duration-300 shadow-lg"></div>
                  <span className="font-semibold text-center lg:text-right">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* معلومات الاتصال - محسنة للموبايل */}
          <div className="space-y-4 lg:space-y-6">
            <div className="space-y-2 text-center lg:text-right">
              <h4 className="text-lg lg:text-2xl font-black text-white flex items-center justify-center lg:justify-start gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                تواصل معنا
              </h4>
              <div className="w-12 lg:w-16 h-1 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 rounded-full shadow-lg mx-auto lg:mx-0"></div>
            </div>
            
            {/* أزرار التواصل في شبكة للموبايل */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-5">
              
              {/* رقم الهاتف */}
              <a 
                href="tel:01034207175"
                className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 text-red-50 hover:text-yellow-300 transition-all duration-300 group hover:scale-105 transform bg-white/5 hover:bg-white/10 p-3 lg:p-4 rounded-xl border border-white/10 hover:border-green-400/50"
              >
                <div className="p-3 lg:p-4 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-xl lg:rounded-2xl shadow-xl group-hover:shadow-green-500/40 group-hover:from-green-300 group-hover:to-green-500 transition-all duration-300 border-2 border-white/20">
                  <Phone className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-sm lg:text-xl font-black text-white">📞</div>
                  <div className="text-xs lg:text-base text-green-200 font-bold">اتصل</div>
                </div>
              </a>

              {/* واتساب */}
              <a 
                href="https://wa.me/2001034207175"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 text-red-50 hover:text-green-300 transition-all duration-300 group hover:scale-105 transform bg-white/5 hover:bg-white/10 p-3 lg:p-4 rounded-xl border border-white/10 hover:border-green-400/50"
              >
                <div className="p-3 lg:p-4 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-xl lg:rounded-2xl shadow-xl group-hover:shadow-green-500/40 group-hover:from-green-300 group-hover:to-green-500 transition-all duration-300 border-2 border-white/20">
                  <MessageCircle className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-sm lg:text-xl font-black text-white">💬</div>
                  <div className="text-xs lg:text-base text-green-200 font-bold">واتساب</div>
                </div>
              </a>

              {/* فيسبوك */}
              <a 
                href="https://www.facebook.com/profile.php?id=61570486528410"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 text-red-50 hover:text-blue-300 transition-all duration-300 group hover:scale-105 transform bg-white/5 hover:bg-white/10 p-3 lg:p-4 rounded-xl border border-white/10 hover:border-blue-400/50"
              >
                <div className="p-3 lg:p-4 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-xl lg:rounded-2xl shadow-xl group-hover:shadow-blue-500/40 group-hover:from-blue-300 group-hover:to-blue-500 transition-all duration-300 border-2 border-white/20">
                  <Facebook className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-sm lg:text-xl font-black text-white">📘</div>
                  <div className="text-xs lg:text-base text-blue-200 font-bold">فيسبوك</div>
                </div>
              </a>

              {/* الموقع */}
              <a 
                href="https://maps.app.goo.gl/YLuv2rENmiWZUqwA6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 text-red-50 hover:text-purple-300 transition-all duration-300 group hover:scale-105 transform bg-white/5 hover:bg-white/10 p-3 lg:p-4 rounded-xl border border-white/10 hover:border-purple-400/50"
              >
                <div className="p-3 lg:p-4 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-xl lg:rounded-2xl shadow-xl group-hover:shadow-purple-500/40 group-hover:from-purple-300 group-hover:to-purple-500 transition-all duration-300 border-2 border-white/20">
                  <MapPin className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-sm lg:text-xl font-black text-white">📍</div>
                  <div className="text-xs lg:text-base text-purple-200 font-bold">موقعنا</div>
                </div>
              </a>

            </div>
          </div>        </div>

        {/* معلومات إضافية محسنة للموبايل */}
        <div className="mt-8 lg:mt-12 pt-6 lg:pt-10 border-t border-red-500/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 text-center">
            
            {/* التوصيل المجاني */}
            <div className="flex flex-col items-center gap-3 lg:gap-4 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:from-white/20 hover:to-white/10 transition-all duration-300 border border-white/20 hover:border-yellow-400/50 group hover:scale-105 transform">
              <div className="p-3 lg:p-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl group-hover:shadow-yellow-500/40">
                <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h5 className="text-base lg:text-lg font-black text-white mb-1 lg:mb-2">🚚 توصيل مجاني</h5>
                <span className="text-xs lg:text-base text-yellow-100 font-semibold">للطلبات +300 ج.م</span>
              </div>
            </div>

            {/* خدمة العملاء */}
            <div className="flex flex-col items-center gap-3 lg:gap-4 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:from-white/20 hover:to-white/10 transition-all duration-300 border border-white/20 hover:border-green-400/50 group hover:scale-105 transform">
              <div className="p-3 lg:p-4 bg-gradient-to-br from-green-400 to-green-500 rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl group-hover:shadow-green-500/40">
                <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h5 className="text-base lg:text-lg font-black text-white mb-1 lg:mb-2">⏰ خدمة عملاء</h5>
                <span className="text-xs lg:text-base text-green-100 font-semibold">متاحة 24/7</span>
              </div>
            </div>

            {/* ضمان الجودة */}
            <div className="flex flex-col items-center gap-3 lg:gap-4 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-6 hover:from-white/20 hover:to-white/10 transition-all duration-300 border border-white/20 hover:border-orange-400/50 group hover:scale-105 transform">
              <div className="p-3 lg:p-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl lg:rounded-2xl shadow-xl lg:shadow-2xl group-hover:shadow-orange-500/40">
                <Heart className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div>
                <h5 className="text-base lg:text-lg font-black text-white mb-1 lg:mb-2">❤️ ضمان الجودة</h5>
                <span className="text-xs lg:text-base text-orange-100 font-semibold">والطعم الطبيعي</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* القسم السفلي المحسن للموبايل */}
      <div className="bg-gradient-to-r from-red-800 via-red-900 to-red-800 py-4 lg:py-8 relative overflow-hidden">
        {/* تأثير بصري */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-3 lg:px-6 relative z-10">
          <div className="flex flex-col items-center justify-center text-center gap-4 lg:gap-6">
            
            <div>
              <p className="text-white text-sm lg:text-lg font-bold mb-2">
                © {currentYear} بيرفكتو تيب. جميع الحقوق محفوظة.
              </p>
              <p className="text-red-100 text-xs lg:text-base flex items-center justify-center gap-2">
                صُنع بـ <Heart className="h-4 w-4 lg:h-5 lg:w-5 text-red-400 animate-pulse" /> في مصر 🇪🇬
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-8">
              <Link 
                href="/privacy" 
                className="text-white hover:text-yellow-300 text-xs lg:text-base transition-all duration-300 font-semibold hover:underline decoration-yellow-300 underline-offset-4"
              >
                سياسة الخصوصية
              </Link>
              <span className="text-red-300 text-sm lg:text-lg hidden sm:inline">•</span>
              <Link 
                href="/terms" 
                className="text-white hover:text-yellow-300 text-xs lg:text-base transition-all duration-300 font-semibold hover:underline decoration-yellow-300 underline-offset-4"
              >
                الشروط والأحكام
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* زر العودة لأعلى المحسن للموبايل */}
      <div className="md:hidden fixed bottom-20 left-3 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 transform hover:shadow-red-500/40 font-bold border-2 border-white/20"
          aria-label="العودة لأعلى"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

    </footer>
  )
}
