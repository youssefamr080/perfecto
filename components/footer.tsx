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
    <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-black text-gray-100 relative overflow-hidden">
      {/* تأثير بصري خلفي أنيق */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-400 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-400 rounded-full blur-2xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 lg:py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* معلومات الشركة */}
          <div className="space-y-4 text-center lg:text-right">
            <div className="space-y-3">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-100 flex items-center justify-center lg:justify-start gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                  <ShoppingBag className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  بيرفكتو تيب
                </span>
              </h3>
            </div>
            
            {/* في الهاتف: تقييم العملاء تحت الشعار مباشرة */}
            <div className="md:hidden flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-lg p-3 border border-amber-500/30">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-current" />
                <Star className="h-4 w-4 text-amber-400 fill-current" />
                <Star className="h-4 w-4 text-amber-400 fill-current" />
                <Star className="h-4 w-4 text-amber-400 fill-current" />
                <Star className="h-4 w-4 text-amber-400 fill-current" />
              </div>
              <span className="text-sm text-amber-200 font-medium">
                +1000 عميل راضي
              </span>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <p className="text-sm lg:text-base leading-relaxed text-gray-200">
                أجود المنتجات الطبيعية 100% بدون مواد حافظة. نوفر لك أفضل اللحوم والأجبان والألبان الطازجة.
              </p>
            </div>
            
            {/* في الشاشات الكبيرة: تقييم العملاء */}
            <div className="hidden md:flex items-center justify-center lg:justify-start gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-lg p-3 border border-amber-500/30">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-current" />
                <Star className="h-4 w-4 text-amber-400 fill-current" />
                <Star className="h-4 w-4 text-amber-400 fill-current" />
                <Star className="h-4 w-4 text-amber-400 fill-current" />
                <Star className="h-4 w-4 text-amber-400 fill-current" />
              </div>
              <span className="text-sm text-amber-200 font-medium">
                +1000 عميل راضي
              </span>
            </div>
          </div>

          {/* تواصل معنا */}
          <div className="space-y-4">
            <div className="space-y-2 text-center lg:text-right">
              <h4 className="text-lg lg:text-xl font-bold text-red-500 flex items-center justify-center lg:justify-start gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" aria-hidden="true"></span>
                <span className="text-red-500">تواصل معنا</span>
              </h4>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <a 
                href="tel:01034207175"
                className="flex items-center gap-2 lg:gap-3 text-gray-200 hover:text-emerald-300 transition-all duration-300 group bg-white/5 hover:bg-emerald-500/20 p-3 rounded-lg border border-white/10 hover:border-emerald-400/50"
                aria-label="اتصل بنا"
              >
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-lg group-hover:shadow-emerald-500/40 transition-all duration-300">
                  <Phone className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">اتصل بنا</span>
              </a>

              <a 
                href="https://wa.me/2001034207175"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 lg:gap-3 text-gray-200 hover:text-green-300 transition-all duration-300 group bg-white/5 hover:bg-green-500/20 p-3 rounded-lg border border-white/10 hover:border-green-400/50"
                aria-label="تواصل عبر واتساب"
              >
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg group-hover:shadow-green-500/40 transition-all duration-300">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">واتساب</span>
              </a>

              <a 
                href="https://www.facebook.com/profile.php?id=61570486528410"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 lg:gap-3 text-gray-200 hover:text-blue-300 transition-all duration-300 group bg-white/5 hover:bg-blue-500/20 p-3 rounded-lg border border-white/10 hover:border-blue-400/50"
                aria-label="صفحة فيسبوك"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg group-hover:shadow-blue-500/40 transition-all duration-300">
                  <Facebook className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">فيسبوك</span>
              </a>

              <a 
                href="https://maps.app.goo.gl/YLuv2rENmiWZUqwA6"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 lg:gap-3 text-gray-200 hover:text-purple-300 transition-all duration-300 group bg-white/5 hover:bg-purple-500/20 p-3 rounded-lg border border-white/10 hover:border-purple-400/50"
                aria-label="موقعنا على الخريطة"
              >
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-lg group-hover:shadow-purple-500/40 transition-all duration-300">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">موقعنا</span>
              </a>
            </div>
          </div>

          {/* خدمات العملاء */}
          <div className="space-y-4 text-center lg:text-right">
            <div className="space-y-2">
              <h4 className="text-lg lg:text-xl font-bold text-red-500 flex items-center justify-center lg:justify-start gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" aria-hidden="true"></span>
                <span className="text-red-500">حسابي</span>
              </h4>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {customerLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="text-gray-200 hover:text-cyan-300 transition-all duration-300 text-sm flex items-center justify-center lg:justify-start gap-2 group bg-white/5 hover:bg-cyan-500/20 px-3 py-2 rounded-lg border border-white/10 hover:border-cyan-400/50"
                >
                  <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full group-hover:from-cyan-300 group-hover:to-blue-400 transition-all duration-300"></div>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* القسم السفلي المحسن */}
      <div className="bg-black/50 py-4 border-t border-white/10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between text-center gap-3">
            <p className="text-gray-300 text-sm">
              © {currentYear} بيرفكتو تيب. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href="/privacy" 
                className="text-gray-300 hover:text-gray-100 text-sm transition-all duration-300 hover:underline"
              >
                سياسة الخصوصية
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-300 hover:text-gray-100 text-sm transition-all duration-300 hover:underline"
              >
                الشروط والأحكام
              </Link>
              <div className="flex items-center gap-1 text-gray-300 text-sm">
                صُنع بـ <Heart className="h-3 w-3 text-red-400" /> في مصر 🇪🇬
              </div>
            </div>
          </div>
        </div>
      </div>


    </footer>
  )
}
