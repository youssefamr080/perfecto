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
    <footer className="bg-gradient-to-b from-red-600 via-red-700 to-red-800 text-white">
      {/* القسم الرئيسي */}
      <div className="container mx-auto px-4 py-8 lg:px-6 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* معلومات الشركة */}
          <div className="space-y-4 lg:space-y-5">
            <h3 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 lg:h-8 lg:w-8" />
              بيرفكتو تيب
            </h3>
            <p className="text-red-50 text-base lg:text-lg leading-relaxed">
              أجود المنتجات الطبيعية 100% بدون مواد حافظة. نوفر لك أفضل اللحوم والأجبان والألبان الطازجة مع التوصيل السريع لباب بيتك.
            </p>
            <div className="flex items-center gap-2 text-yellow-300">
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <span className="text-base text-white mr-2">عملاء راضيين</span>
            </div>
          </div>

          {/* روابط سريعة */}
          <div className="space-y-4 lg:space-y-5">
            <h4 className="text-lg lg:text-xl font-semibold text-white">روابط سريعة</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-red-50 hover:text-yellow-300 transition-colors text-base lg:text-lg flex items-center gap-3 group"
                  >
                    <span className="w-2 h-2 bg-yellow-300 rounded-full group-hover:w-3 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* خدمات العملاء */}
          <div className="space-y-4 lg:space-y-5">
            <h4 className="text-lg lg:text-xl font-semibold text-white">حسابي</h4>
            <ul className="space-y-3">
              {customerLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-red-50 hover:text-yellow-300 transition-colors text-base lg:text-lg flex items-center gap-3 group"
                  >
                    <span className="w-2 h-2 bg-yellow-300 rounded-full group-hover:w-3 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* معلومات الاتصال */}
          <div className="space-y-4 lg:space-y-5">
            <h4 className="text-lg lg:text-xl font-semibold text-white">تواصل معنا</h4>
            <div className="space-y-4">
              
              {/* رقم الهاتف */}
              <a 
                href="tel:01034207175"
                className="flex items-center gap-4 text-red-50 hover:text-yellow-300 transition-colors group"
              >
                <div className="p-3 bg-green-600 rounded-full group-hover:bg-green-500 transition-colors">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-base lg:text-lg font-medium">اتصل بنا</div>
                  <div className="text-sm lg:text-base text-white">01034207175</div>
                </div>
              </a>

              {/* واتساب */}
              <a 
                href="https://wa.me/2001034207175"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-red-50 hover:text-green-300 transition-colors group"
              >
                <div className="p-3 bg-green-600 rounded-full group-hover:bg-green-500 transition-colors">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-base lg:text-lg font-medium">واتساب</div>
                  <div className="text-sm lg:text-base text-white">راسلنا فوراً</div>
                </div>
              </a>

              {/* فيسبوك */}
              <a 
                href="https://www.facebook.com/profile.php?id=61570486528410"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-red-50 hover:text-blue-300 transition-colors group"
              >
                <div className="p-3 bg-blue-600 rounded-full group-hover:bg-blue-500 transition-colors">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-base lg:text-lg font-medium">فيسبوك</div>
                  <div className="text-sm lg:text-base text-white">تابعنا</div>
                </div>
              </a>

              {/* الموقع */}
              <a 
                href="https://maps.app.goo.gl/YLuv2rENmiWZUqwA6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 text-red-50 hover:text-yellow-300 transition-colors group"
              >
                <div className="p-3 bg-orange-600 rounded-full group-hover:bg-orange-500 transition-colors flex-shrink-0">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-base lg:text-lg font-medium">موقعنا</div>
                  <div className="text-sm lg:text-base text-white leading-relaxed">خلف ماكدونالز أمام محلات الشيخ للاكسسوارات</div>
                </div>
              </a>
              
            </div>
          </div>

        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 pt-6 lg:mt-10 lg:pt-8 border-t border-red-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 text-center md:text-right">
            
            {/* التوصيل المجاني */}
            <div className="flex items-center justify-center md:justify-start gap-3 text-yellow-300">
              <Shield className="h-5 w-5 lg:h-6 lg:w-6" />
              <span className="text-sm lg:text-base">توصيل مجاني للطلبات أكثر من 300 ج.م</span>
            </div>

            {/* خدمة العملاء */}
            <div className="flex items-center justify-center md:justify-start gap-3 text-green-300">
              <Clock className="h-5 w-5 lg:h-6 lg:w-6" />
              <span className="text-sm lg:text-base">خدمة عملاء 24/7</span>
            </div>

            {/* ضمان الجودة */}
            <div className="flex items-center justify-center md:justify-start gap-3 text-orange-300">
              <Heart className="h-5 w-5 lg:h-6 lg:w-6" />
              <span className="text-sm lg:text-base">ضمان الجودة والطعم الطبيعي</span>
            </div>

          </div>
        </div>
      </div>

      {/* القسم السفلي */}
      <div className="bg-red-800 py-4 lg:py-5">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
            
            <div className="text-center md:text-right">
              <p className="text-white text-sm lg:text-base">
                © {currentYear} بيرفكتو تيب. جميع الحقوق محفوظة.
              </p>
              <p className="text-red-100 text-sm lg:text-base mt-1">
                صُنع بـ <Heart className="h-4 w-4 text-yellow-400 inline mx-1" /> في مصر
              </p>
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
              <Link 
                href="/privacy" 
                className="text-white hover:text-yellow-300 text-sm lg:text-base transition-colors"
              >
                سياسة الخصوصية
              </Link>
              <Link 
                href="/terms" 
                className="text-white hover:text-yellow-300 text-sm lg:text-base transition-colors"
              >
                الشروط والأحكام
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* زر العودة لأعلى - يظهر فقط على الموبايل */}
      <div className="md:hidden fixed bottom-20 left-4 z-40">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 font-bold"
          aria-label="العودة لأعلى"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

    </footer>
  )
}
