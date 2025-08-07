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
  Mail
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
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      {/* القسم الرئيسي */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* معلومات الشركة */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
              <ShoppingBag className="h-6 w-6" />
              بيرفكتو تيب
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              أجود المنتجات الطبيعية 100% بدون مواد حافظة. نوفر لك أفضل اللحوم والأجبان والألبان الطازجة مع التوصيل السريع لباب بيتك.
            </p>
            <div className="flex items-center gap-2 text-yellow-400">
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm text-gray-300 mr-2">عملاء راضيين</span>
            </div>
          </div>

          {/* روابط سريعة */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-red-400">روابط سريعة</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-red-400 rounded-full group-hover:w-2 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* خدمات العملاء */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-red-400">حسابي</h4>
            <ul className="space-y-2">
              {customerLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-red-400 rounded-full group-hover:w-2 transition-all"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* معلومات الاتصال */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-red-400">تواصل معنا</h4>
            <div className="space-y-3">
              
              {/* رقم الهاتف */}
              <a 
                href="tel:01034207175"
                className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors group"
              >
                <div className="p-2 bg-green-600 rounded-full group-hover:bg-green-500 transition-colors">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium">اتصل بنا</div>
                  <div className="text-xs text-gray-400">01034207175</div>
                </div>
              </a>

              {/* واتساب */}
              <a 
                href="https://wa.me/2001034207175"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-green-400 transition-colors group"
              >
                <div className="p-2 bg-green-600 rounded-full group-hover:bg-green-500 transition-colors">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium">واتساب</div>
                  <div className="text-xs text-gray-400">راسلنا فوراً</div>
                </div>
              </a>

              {/* الموقع */}
              <a 
                href="https://maps.app.goo.gl/YLuv2rENmiWZUqwA6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-gray-300 hover:text-blue-400 transition-colors group"
              >
                <div className="p-2 bg-blue-600 rounded-full group-hover:bg-blue-500 transition-colors flex-shrink-0">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">موقعنا</div>
                  <div className="text-xs text-gray-400 leading-relaxed">خلف ماكدونالز أمام محلات الشيخ للاكسسوارات</div>
                </div>
              </a>
              
            </div>
          </div>

        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-right">
            
            {/* التوصيل المجاني */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-green-400">
              <Shield className="h-5 w-5" />
              <span className="text-sm">توصيل مجاني للطلبات أكثر من 300 ج.م</span>
            </div>

            {/* خدمة العملاء */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-blue-400">
              <Clock className="h-5 w-5" />
              <span className="text-sm">خدمة عملاء 24/7</span>
            </div>

            {/* ضمان الجودة */}
            <div className="flex items-center justify-center md:justify-start gap-2 text-yellow-400">
              <Heart className="h-5 w-5" />
              <span className="text-sm">ضمان الجودة والطعم الطبيعي</span>
            </div>

          </div>
        </div>
      </div>

      {/* القسم السفلي */}
      <div className="bg-black py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                © {currentYear} بيرفكتو تيب. جميع الحقوق محفوظة.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                صُنع بـ <Heart className="h-3 w-3 text-red-500 inline mx-1" /> في مصر
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link 
                href="/privacy" 
                className="text-gray-400 hover:text-red-400 text-xs transition-colors"
              >
                سياسة الخصوصية
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-400 hover:text-red-400 text-xs transition-colors"
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
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="العودة لأعلى"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>

    </footer>
  )
}
