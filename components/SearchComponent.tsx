'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';
import Link from 'next/link';

type UnitType = 'WEIGHT' | 'PIECE';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  images: string[];
  category: string;
  unitType: UnitType;
  isAvailable: boolean;
}

interface SearchComponentProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const RECENT_SEARCHES_KEY = 'recent_searches_v1';

const SearchComponent = ({ isOpen, onClose, searchQuery, onSearchChange }: SearchComponentProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showRecent, setShowRecent] = useState(false);

  // جلب آخر عمليات البحث من localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // حفظ آخر عمليات البحث في localStorage
  const saveRecentSearch = useCallback((query: string) => {
    if (!query || query.trim().length < 2) return;
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(q => q !== query)].slice(0, 5);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // الفئات المتاحة - جلبها من قاعدة البيانات
  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const categories = await response.json()
          setAvailableCategories(categories.map((cat: { categoryType: string; name: string }) => ({
            id: cat.categoryType,
            name: cat.name
          })))
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, []);

  // البحث في قاعدة البيانات
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setProducts([]);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const searchProducts = async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, { signal: controller.signal });
        if (response.ok) {
          const results = await response.json();
          setProducts(results);
        } else {
          setProducts([]);
        }
      } catch (error) {
        if (typeof error === 'object' && error && 'name' in error) {
          if ((error as { name: string }).name !== 'AbortError') {
            setProducts([]);
          }
        } else {
          setProducts([]);
        }
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(searchProducts, 300); // Debounce search
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery]);

  // تصفية المنتجات حسب الفئة
  const filteredProducts = useMemo(() => selectedCategory === 'ALL' 
    ? products 
    : products.filter(product => product.category === selectedCategory), [products, selectedCategory]);

  // عند الضغط على بحث أو اختيار اقتراح
  const handleSearch = useCallback((query: string) => {
    onSearchChange(query);
    saveRecentSearch(query);
    setShowRecent(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, [onSearchChange, saveRecentSearch]);

  // عند الضغط على Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      handleSearch(searchQuery);
    }
  }, [handleSearch, searchQuery]);

  // إظهار الاقتراحات عند التركيز
  const handleFocus = useCallback(() => {
    if (recentSearches.length > 0) setShowRecent(true);
  }, [recentSearches]);

  // إخفاء الاقتراحات عند فقدان التركيز
  const handleBlur = useCallback(() => {
    setTimeout(() => setShowRecent(false), 150);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">بحث في المنتجات</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b relative">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="ابحث عن منتج..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoFocus
              autoComplete="off"
            />
            {/* اقتراحات البحث الأخيرة */}
            {showRecent && recentSearches.length > 0 && (
              <div className="absolute right-0 left-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fade-in">
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2">عمليات البحث الأخيرة</div>
                  {recentSearches.map((item, idx) => (
                    <button
                      key={item + idx}
                      className="block w-full text-right px-3 py-2 rounded hover:bg-gray-100 text-gray-800 text-sm"
                      onMouseDown={() => handleSearch(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-6 border-b">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              جميع الفئات
            </button>
            {availableCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-gray-900">جاري البحث...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              {searchQuery.length >= 2 ? (
                <>
                  <p className="text-gray-900 mb-4">لا توجد نتائج للبحث &quot;{searchQuery}&quot;</p>
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    عرض جميع المنتجات
                  </Link>
                  {/* عرض آخر عمليات البحث إذا لم توجد نتائج */}
                  {recentSearches.length > 0 && (
                    <div className="mt-6">
                      <div className="text-xs text-gray-500 mb-2">عمليات البحث الأخيرة</div>
                      {recentSearches.map((item, idx) => (
                        <button
                          key={item + idx}
                          className="block w-full text-right px-3 py-2 rounded hover:bg-gray-100 text-gray-800 text-sm"
                          onClick={() => handleSearch(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-900">أدخل كلمة للبحث (حد أدنى حرفين)</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} onClick={onClose}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredProducts.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {filteredProducts.length} منتج من أصل {products.length}
              </span>
              <Link
                href={`/search?q=${encodeURIComponent(searchQuery)}`}
                onClick={onClose}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                عرض جميع النتائج
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;
