'use client'

import React from 'react'
import Link from 'next/link'
import { Phone, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const Footer: React.FC = () => {
  const { isAdmin } = useAuth()
  
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-6">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">بيرفكتو</h3>
                <p className="text-sm text-gray-400">جودة وطعم مميز</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              نحن نقدم أفضل منتجات الألبان واللحوم والعسل والبيض عالية الجودة مع خدمة التوصيل السريع إلى باب منزلك.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  عن المتجر
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-white transition-colors">
                  تتبع الطلبات
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-6">الأقسام</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/category/dairy" className="text-gray-400 hover:text-white transition-colors">
                  الألبان والأجبان
                </Link>
              </li>
              <li>
                <Link href="/category/meat" className="text-gray-400 hover:text-white transition-colors">
                  اللحوم والمصنعات
                </Link>
              </li>
              <li>
                <Link href="/category/honey" className="text-gray-400 hover:text-white transition-colors">
                  عسل وطحينة
                </Link>
              </li>
              <li>
                <Link href="/category/eggs" className="text-gray-400 hover:text-white transition-colors">
                  البيض
                </Link>
              </li>
              <li>
                <Link href="/category/halawa" className="text-gray-400 hover:text-white transition-colors">
                  حلاوة طحينية
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
                    لوحة الإدارة
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">تواصل معنا</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="w-5 h-5 text-red-500" />
                <span className="text-gray-400">045 3325896 - 01007075623</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="text-gray-400">دمنهور شارع عبد السلام الشاذلي خلف ماكدونالدز</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Clock className="w-5 h-5 text-red-500" />
                <span className="text-gray-400">خدمة التوصيل خلال 30 دقيقة</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-6">تابعنا</h4>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 بيرفكتو. جميع الحقوق محفوظة.
            </p>
            <div className="flex space-x-6 rtl:space-x-reverse mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
                سياسة الخصوصية
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
