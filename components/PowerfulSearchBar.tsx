'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  oldPrice?: number | null
  images: string[]
  category: string
  description?: string | null
  unitType: 'WEIGHT' | 'PIECE'
}

interface SearchResult {
  products: Product[]
  total: number
}

interface Props {
  className?: string
  placeholder?: string
  showRecentSearches?: boolean
  autoFocus?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const PowerfulSearchBar: React.FC<Props> = ({
  className = '',
  placeholder = 'ابحث عن المنتجات...',
  showRecentSearches = true,
  autoFocus = false,
  size = 'md'
}) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // تحميل البحثات الأخيرة من localStorage
  useEffect(() => {
    if (showRecentSearches) {
      const saved = localStorage.getItem('recentSearches')
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    }
  }, [showRecentSearches])

  // إغلاق النتائج عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // البحث المباشر مع منع الـ refresh المستمر
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    // منع البحث المتكرر للنص نفسه
    const trimmedQuery = query.trim()
    let isCancelled = false

    const searchTimeout = setTimeout(async () => {
      if (isCancelled) return
      
      setLoading(true)
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=8`, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
          }
        })
        
        clearTimeout(timeoutId)
        
        if (!isCancelled && response.ok) {
          const data: SearchResult = await response.json()
          setResults(data.products || [])
        } else if (!isCancelled) {
          setResults([])
        }
      } catch (error) {
        if (!isCancelled && error instanceof Error && error.name !== 'AbortError') {
          console.error('Search error:', error)
          setResults([])
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }, 300) // زيادة التأخير لتقليل الطلبات

    return () => {
      isCancelled = true
      clearTimeout(searchTimeout)
    }
  }, [query])

  // حفظ البحث في التاريخ
  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim() || !showRecentSearches) return

    const newRecentSearches = [
      searchQuery.trim(),
      ...recentSearches.filter(s => s !== searchQuery.trim())
    ].slice(0, 5)

    setRecentSearches(newRecentSearches)
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches))
  }

  // التعامل مع الإرسال مع تحسينات
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      saveSearch(query.trim())
      setIsOpen(false)
      setSelectedIndex(-1)
      const searchUrl = `/search?q=${encodeURIComponent(query.trim())}`
      
      // تجربة التنقل بطريقتين للتأكد
      try {
        router.push(searchUrl)
      } catch (error) {
        console.error('Router navigation failed:', error)
        window.location.href = searchUrl
      }
    }
  }

  // التعامل مع تغيير النص
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
    setSelectedIndex(-1)
  }

  // التعامل مع اختيار منتج
  const handleProductSelect = (productId: string, productName: string) => {
    saveSearch(productName)
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
    
    // التنقل الفوري للمنتج
    router.push(`/product/${productId}`)
    
    // إضافة تأكيد إضافي
    setTimeout(() => {
      if (window.location.pathname !== `/product/${productId}`) {
        window.location.href = `/product/${productId}`
      }
    }, 100)
  }

  // التعامل مع اختيار بحث سابق مع تحسينات
  const handleRecentSearchSelect = (searchQuery: string) => {
    setQuery(searchQuery)
    setIsOpen(false)
    setSelectedIndex(-1)
    const searchUrl = `/search?q=${encodeURIComponent(searchQuery)}`
    
    try {
      router.push(searchUrl)
    } catch (error) {
      console.error('Router navigation failed:', error)
      window.location.href = searchUrl
    }
  }

  // التعامل مع مفاتيح الكيبورد
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    const totalItems = results.length + (showRecentSearches && recentSearches.length > 0 ? recentSearches.length : 0)

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : -1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : totalItems - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      
      if (selectedIndex === -1) {
        handleSubmit(e)
      } else if (selectedIndex < results.length) {
        // اختيار منتج
        const product = results[selectedIndex]
        handleProductSelect(product.id, product.name)
      } else if (showRecentSearches && recentSearches.length > 0) {
        // اختيار بحث سابق
        const recentIndex = selectedIndex - results.length
        if (recentIndex < recentSearches.length) {
          handleRecentSearchSelect(recentSearches[recentIndex])
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
    }
  }

  // أحجام مختلفة
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            autoFocus={autoFocus}
            className={`
              w-full pr-12 border-2 border-gray-200 rounded-full 
              focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 
              transition-all text-black placeholder-gray-500 bg-white
              ${sizeClasses[size]}
            `}
          />
        
        <button
          type="submit"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Search className={iconSizes[size]} />
        </button>

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setIsOpen(false)
              setSelectedIndex(-1)
            }}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <X className={iconSizes[size]} />
          </button>
        )}
      </form>

      {/* نتائج البحث */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-2xl mt-2 max-h-96 overflow-hidden z-50">
          {loading && (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-3"></div>
              <p className="text-sm text-gray-900 font-semibold">جاري البحث عن "{query}"...</p>
            </div>
          )}

          {!loading && (
            <div className="overflow-y-auto max-h-96">
              {/* نتائج المنتجات */}
              {results.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-bold text-gray-900 uppercase border-b border-gray-100">
                    المنتجات ({results.length})
                  </div>
                  {results.map((product, index) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product.id, product.name)}
                      className={`
                        w-full px-4 py-3 hover:bg-gray-50 transition-all duration-200 text-right border-b border-gray-50 last:border-b-0
                        transform hover:scale-[1.02] cursor-pointer
                        ${selectedIndex === index ? 'bg-red-50 border-red-200 shadow-sm' : ''}
                      `}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="flex-shrink-0">
                          <Image
                            src={product.images[0] || '/placeholder.jpg'}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder.jpg'
                            }}
                          />
                        </div>
                        <div className="flex-1 text-right min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{product.name}</h4>
                          <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
                            <span className="text-red-600 font-semibold text-sm">
                              {product.price.toFixed(2)} ج.م
                            </span>
                            {product.oldPrice && (
                              <span className="text-gray-400 line-through text-xs">
                                {product.oldPrice.toFixed(2)} ج.م
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-800 text-right font-medium">
                            {product.unitType === 'WEIGHT' ? 'بالكيلو' : 'بالقطعة'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {query.trim() && (
                    <div className="px-4 py-3 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleSubmit(e)
                        }}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-2 rtl:space-x-reverse
                                 transition-all duration-200 hover:bg-red-50 px-2 py-1 rounded-lg w-full"
                      >
                        <Search className="w-4 h-4" />
                        <span>عرض جميع النتائج لـ "{query}"</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* البحثات الأخيرة */}
              {showRecentSearches && recentSearches.length > 0 && (
                <div className="py-2 border-t border-gray-100">
                  <div className="px-4 py-2 text-xs font-bold text-gray-900 uppercase flex items-center space-x-2 rtl:space-x-reverse">
                    <Clock className="w-3 h-3" />
                    <span>البحثات الأخيرة</span>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={search}
                      onClick={() => handleRecentSearchSelect(search)}
                      className={`
                        w-full px-4 py-2 hover:bg-gray-50 transition-colors text-right text-sm text-gray-900 font-semibold
                        ${selectedIndex === results.length + index ? 'bg-red-50' : ''}
                      `}
                    >
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Clock className="w-4 h-4 text-gray-900" />
                        <span>{search}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* لا توجد نتائج */}
              {!loading && query.trim().length > 1 && results.length === 0 && (
                <div className="p-6 text-center">
                  <div className="text-gray-400 mb-2">
                    <Search className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">لم يتم العثور على نتائج</p>
                  <p className="text-gray-900 text-sm font-semibold">جرب البحث بكلمات مختلفة</p>
                </div>
              )}

              {/* رسالة البداية */}
              {!query.trim() && showRecentSearches && recentSearches.length === 0 && (
                <div className="p-6 text-center">
                  <div className="text-gray-400 mb-2">
                    <TrendingUp className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">ابدأ البحث</p>
                  <p className="text-gray-900 text-sm font-semibold">اكتب للبحث عن المنتجات المفضلة لديك</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PowerfulSearchBar
