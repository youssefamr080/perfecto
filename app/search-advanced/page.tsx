'use client'

import React from 'react'
import PowerfulSearchBar from '@/components/PowerfulSearchBar'
import { Search, TrendingUp, Star, Clock } from 'lucide-react'

const SearchPage: React.FC = () => {
  const popularSearches = [
    'لانشون', 'بسطرمة', 'كفتة', 'زبادي', 'عسل', 'طحينة', 'بيض', 'جبن'
  ]

  const recentTrends = [
    'لحمة مفرومة', 'سجق اسكندراني', 'حلاوة طحينية', 'لبن طازج'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* العنوان الرئيسي */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-6">
              <Search className="w-12 h-12 text-red-600" />
              <h1 className="text-4xl font-bold text-gray-900">البحث المتقدم</h1>
            </div>
            <p className="text-lg text-gray-600 mb-8">
              ابحث عن منتجاتك المفضلة بأفضل تقنيات البحث
            </p>
            
            {/* مربع البحث الرئيسي */}
            <div className="max-w-2xl mx-auto">
              <PowerfulSearchBar 
                size="lg"
                placeholder="ابحث عن أي منتج تريده..."
                showRecentSearches={true}
                autoFocus={true}
                className="shadow-xl"
              />
            </div>
          </div>

          {/* البحثات الشائعة */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">البحثات الشائعة</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => window.location.href = `/search?q=${encodeURIComponent(search)}`}
                  className="bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 
                           border border-red-200 rounded-xl p-4 text-center transition-all duration-300 
                           hover:shadow-md transform hover:-translate-y-1"
                >
                  <span className="font-medium text-gray-800">{search}</span>
                </button>
              ))}
            </div>
          </div>

          {/* الاتجاهات الحالية */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-6">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">في الاتجاه الآن</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentTrends.map((trend, index) => (
                <button
                  key={index}
                  onClick={() => window.location.href = `/search?q=${encodeURIComponent(trend)}`}
                  className="bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 
                           border border-green-200 rounded-xl p-4 text-right transition-all duration-300 
                           hover:shadow-md transform hover:-translate-y-1 flex items-center space-x-3 rtl:space-x-reverse"
                >
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-800">{trend}</span>
                </button>
              ))}
            </div>
          </div>

          {/* نصائح البحث */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">نصائح للبحث الأمثل</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">بحث سريع</h3>
                <p className="text-gray-600 text-sm">
                  اكتب أول حروف من اسم المنتج للحصول على نتائج فورية
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">كلمات متعددة</h3>
                <p className="text-gray-600 text-sm">
                  استخدم أكثر من كلمة للبحث الدقيق مثل "لحم بقري مفروم"
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">البحثات السابقة</h3>
                <p className="text-gray-600 text-sm">
                  يتم حفظ بحثاتك الأخيرة لسهولة الوصول إليها مرة أخرى
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SearchPage
