"use client"

import React from 'react'
import Link from 'next/link'
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Heart, 
  Star,
  Facebook,
} from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-red-700 text-white relative overflow-hidden py-6">
      {/* تأثيرات خلفية */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-10 w-20 h-20 bg-red-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 right-10 w-24 h-24 bg-red-600 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* المحتوى الرئيسي */}
        <div className="flex flex-col items-center text-center">
          {/* الشعار والتقييم */}
          <div className="mb-5">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              <h3 className="text-2xl md:text-3xl font-bold">بيرفكتو تيب</h3>
              <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
            </div>

            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-amber-300 fill-current" />
              ))}
              <span className="text-amber-50 text-base mr-2 font-medium">+1000 عميل راضي</span>
            </div>
          </div>

          {/* وسائل التواصل */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-6">
            <a
              href="tel:01034207175"
              className="flex items-center justify-center gap-2 bg-white/10 p-3 rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-white"
            >
              <Phone className="h-4 w-4" />
              <span className="text-base font-medium">اتصل بنا</span>
            </a>

            <a
              href="https://wa.me/2001034207175"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white/10 p-3 rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-white"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-base font-medium">واتساب</span>
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61570486528410"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white/10 p-3 rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-white"
            >
              <Facebook className="h-4 w-4" />
              <span className="text-base font-medium">فيسبوك</span>
            </a>

            <a
              href="https://maps.app.goo.gl/YLuv2rENmiWZUqwA6"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-white/10 p-3 rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-white"
            >
              <MapPin className="h-4 w-4" />
              <span className="text-base font-medium">موقعنا</span>
            </a>
          </div>

          {/* روابط سريعة */}
          <div className="flex flex-nowrap justify-center gap-3 mb-6 overflow-x-auto whitespace-nowrap px-1">
            <Link href="/loyalty" className="inline-flex items-center text-base font-medium hover:text-amber-200 transition-colors border border-white/30 rounded-md px-3 py-1.5 bg-white/5 hover:bg-white/10">نقاطي</Link>
            <Link href="/offers" className="inline-flex items-center text-base font-medium hover:text-amber-200 transition-colors border border-white/30 rounded-md px-3 py-1.5 bg-white/5 hover:bg-white/10">العروض</Link>
            <Link href="/about" className="inline-flex items-center text-base font-medium hover:text-amber-200 transition-colors border border-white/30 rounded-md px-3 py-1.5 bg-white/5 hover:bg-white/10">من نحن</Link>
            <Link href="/profile" className="inline-flex items-center text-base font-medium hover:text-amber-200 transition-colors border border-white/30 rounded-md px-3 py-1.5 bg-white/5 hover:bg-white/10">الملف الشخصي</Link>
          </div>

          {/* حقوق النشر */}
          <div className="border-t border-white/20 pt-4 w-full">
            <p className="text-[15px] text-white/90 mb-2">
              © {currentYear} بيرفكتو تيب. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/80">
              <Link href="/privacy" className="hover:text-white transition-colors">الخصوصية</Link>
              <Link href="/terms" className="hover:text-white transition-colors">الشروط</Link>
              <div className="flex items-center">
                <span className="ml-1">صُنع في مصر</span>
                <Heart className="h-3 w-3 text-red-300 mx-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}