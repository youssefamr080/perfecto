"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Clock, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSearchStore } from "@/lib/stores/search-store"
import { useDebounce } from "use-debounce"
import Link from "next/link"

interface SearchBarProps {
  className?: string
  placeholder?: string
  showSuggestions?: boolean
}

export function SearchBar({
  className = "",
  placeholder = "ابحث عن المنتجات...",
  showSuggestions = true,
}: SearchBarProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    suggestions,
    recentSearches,
    popularProducts,
    categories,
    getSuggestions,
    search,
    clearRecentSearches,
    loadPopularProducts,
    loadCategories,
  } = useSearchStore()

  const [debouncedQuery] = useDebounce(localQuery, 300)

  // تحميل البيانات عند فتح البحث
  useEffect(() => {
    if (isOpen && popularProducts.length === 0) {
      loadPopularProducts()
    }
    if (isOpen && categories.length === 0) {
      loadCategories()
    }
  }, [isOpen, popularProducts.length, categories.length, loadPopularProducts, loadCategories])

  // الحصول على الاقتراحات
  useEffect(() => {
    if (debouncedQuery && showSuggestions) {
      getSuggestions(debouncedQuery)
    }
  }, [debouncedQuery, getSuggestions, showSuggestions])

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      setLocalQuery("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(localQuery)
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion)
  }

  const handleClearInput = () => {
    setLocalQuery("")
    inputRef.current?.focus()
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="pl-12 pr-10 text-right border-red-200 focus:border-red-500 bg-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          {localQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearInput}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>

      {/* قائمة الاقتراحات والبحثات */}
      {isOpen && showSuggestions && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* الاقتراحات */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">اقتراحات</h4>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-right p-2 hover:bg-red-50 rounded-md transition-colors flex items-center gap-2"
                  >
                    <Search className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* البحثات الأخيرة */}
          {recentSearches.length > 0 && !localQuery && (
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  البحثات الأخيرة
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearRecentSearches}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  مسح الكل
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-700"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* الأقسام */}
          {categories.length > 0 && !localQuery && (
            <div className="p-3 border-b">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">تصفح الأقسام</h4>
              <div className="grid grid-cols-1 gap-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.id}`}
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-red-50 rounded-md transition-colors text-sm text-right"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* المنتجات الشائعة */}
          {popularProducts.length > 0 && !localQuery && (
            <div className="p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                منتجات شائعة
              </h4>
              <div className="space-y-2">
                {popularProducts.slice(0, 3).map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-2 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center text-xs">📦</div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-red-600 font-semibold">{product.price} ج.م</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* رسالة فارغة */}
          {!suggestions.length && !recentSearches.length && !categories.length && !popularProducts.length && (
            <div className="p-6 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">ابدأ بكتابة ما تبحث عنه</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
