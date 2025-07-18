'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X, User, LogOut, Package, Search, Home, Settings } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from './LoginModal'
import PowerfulSearchBar from './PowerfulSearchBar'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [mainCategories, setMainCategories] = useState<any[]>([])
  
  const { getTotalItems, isLoading: cartLoading } = useCart()
  const { user, isAuthenticated, isAdmin, logout, isLoading: authLoading } = useAuth()

  // Ensure component is mounted before using context values
  useEffect(() => {
    setMounted(true)
    
    // جلب الفئات من قاعدة البيانات
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const categoriesData = await response.json()
          setCategories(categoriesData)
          
          // تجميع الفئات حسب الفئة الرئيسية
          const grouped = categoriesData.reduce((acc: any, cat: any) => {
            const mainCatName = cat.mainCategory.name
            if (!acc[mainCatName]) {
              acc[mainCatName] = {
                name: mainCatName,
                slug: cat.mainCategory.slug,
                items: []
              }
            }
            acc[mainCatName].items.push({
              name: cat.name,
              href: `/category/${cat.slug}`
            })
            return acc
          }, {})
          
          setMainCategories(Object.values(grouped))
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    
    fetchCategories()
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
  }

  // الفئات السريعة (أول 6 فئات)
  const quickCategories = categories.slice(0, 6).map(cat => ({
    id: cat.slug,
    name: cat.name,
    href: `/category/${cat.slug}`
  }))

  // Show loading state until contexts are ready
  if (!mounted || cartLoading || authLoading) {
    return (
      <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="text-red-600 font-bold text-xl">🛒 متجر البقالة</div>
            </Link>
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          {/* Main Header */}
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ب</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-black">بيرفكتو</h1>
                <p className="text-xs text-black">جودة وطعم مميز</p>
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <PowerfulSearchBar 
                size="md"
                placeholder="ابحث عن المنتجات..."
                showRecentSearches={false}
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              
              {/* Search (Mobile) */}
              <button
                onClick={toggleSearch}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="البحث"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>

              {/* Home (Mobile) */}
              <Link 
                href="/" 
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="الرئيسية"
              >
                <Home className="w-5 h-5 text-gray-700" />
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-1 rtl:space-x-reverse p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="hidden lg:block text-sm font-bold text-black max-w-20 truncate">{user?.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link 
                        href="/orders" 
                        className="flex items-center px-4 py-2 text-sm text-black font-bold hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        طلباتي
                      </Link>
                      {isAdmin && (
                        <Link 
                          href="/admin" 
                          className="flex items-center px-4 py-2 text-sm text-black font-bold hover:bg-gray-100 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          لوحة الإدارة
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-black font-bold hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors font-bold text-sm"
                >
                  <span className="hidden sm:block">دخول</span>
                  <User className="w-4 h-4 sm:hidden" />
                </button>
              )}

              {/* Menu Button */}
              <button
                onClick={toggleMenu}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="القائمة"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-gray-200">
              <PowerfulSearchBar 
                size="sm"
                placeholder="ابحث عن المنتجات..."
                showRecentSearches={false}
                className="w-full"
              />
            </div>
          )}              {/* Desktop Quick Categories */}
          <div className="hidden lg:flex items-center justify-center space-x-6 rtl:space-x-reverse py-3 border-t border-gray-100">
            <Link
              href="/"
              className="text-black hover:text-red-600 font-bold transition-colors"
            >
              الرئيسية
            </Link>
            {quickCategories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="text-black hover:text-red-600 font-bold transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/categories"
              className="text-red-600 hover:text-red-700 font-bold transition-colors"
            >
              المزيد
            </Link>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="border-t border-gray-200 py-4">
              <nav className="space-y-2">
                
                {/* Home */}
                <Link
                  href="/"
                  className="flex items-center space-x-3 rtl:space-x-reverse text-black hover:text-red-600 font-bold transition-colors py-3 px-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>الرئيسية</span>
                </Link>

                {/* Login (if not authenticated) */}
                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center w-full space-x-3 rtl:space-x-reverse text-black hover:text-red-600 font-bold transition-colors py-3 px-2 rounded-lg hover:bg-gray-50"
                  >
                    <User className="w-5 h-5" />
                    <span>تسجيل دخول</span>
                  </button>
                )}

                {/* User Menu (if authenticated) */}
                {isAuthenticated && (
                  <div className="space-y-2 border-b border-gray-200 pb-4 mb-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse text-black font-bold py-2 px-2">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-red-600" />
                      </div>
                      <span>{user?.name}</span>
                    </div>
                    <Link
                      href="/orders"
                      className="flex items-center space-x-3 rtl:space-x-reverse text-black hover:text-red-600 font-bold transition-colors py-2 px-6 rounded-lg hover:bg-gray-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package className="w-4 h-4" />
                      <span>طلباتي</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-3 rtl:space-x-reverse text-black hover:text-red-600 font-bold transition-colors py-2 px-6 rounded-lg hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>لوحة الإدارة</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center w-full space-x-3 rtl:space-x-reverse text-black hover:text-red-600 font-bold transition-colors py-2 px-6 rounded-lg hover:bg-gray-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}

                {/* Quick Categories */}
                <div className="space-y-4">
                  <p className="font-bold text-black text-lg border-b border-gray-200 pb-2 mb-4">الأقسام</p>
                  
                  {/* Three Column Layout */}
                  <div className="grid grid-cols-1 gap-4">
                    {mainCategories.map((categoryGroup: any) => (
                      <div key={categoryGroup.slug} className="bg-gray-50 rounded-lg p-4">
                        <Link 
                          href={`/category/${categoryGroup.slug}`}
                          className="font-bold text-black text-base mb-3 border-b border-gray-300 pb-2 block hover:text-red-600"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {categoryGroup.name}
                        </Link>
                        <div className="grid grid-cols-3 gap-2">
                          {categoryGroup.items.map((item: any) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="text-center bg-white rounded-lg p-3 border border-gray-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <span className="font-bold text-black text-sm hover:text-red-600 transition-colors">{item.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/categories"
                    className="block w-full text-center bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors mt-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    عرض جميع الأقسام
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}

export default Header
