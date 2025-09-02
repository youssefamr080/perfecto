"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Category, SubCategory } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Menu, X, User, LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCartStore } from "@/lib/stores/cart-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { SearchBar } from "@/components/search/search-bar"
import { useNotificationsStore } from "@/lib/stores/notifications-store"
import { LoginModal } from "./auth/login-modal"
import { cacheManager } from "@/lib/utils/cache-manager"

export function Header() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

  // جلب الأقسام والفئات الفرعية عند فتح السايدبار (مع كاش)
  useEffect(() => {
    if (isSidebarOpen && !dataLoaded) {
      const loadCategoriesData = async () => {
        // التحقق من الكاش أولاً
        const cachedCategories = cacheManager.get<Category[]>('header_categories')
        const cachedSubcategories = cacheManager.get<SubCategory[]>('header_subcategories')
        
        if (cachedCategories && cachedSubcategories) {
          setCategories(cachedCategories)
          setSubcategories(cachedSubcategories)
          setDataLoaded(true)
          return
        }

        // جلب البيانات من قاعدة البيانات
        try {
          const { supabase } = await import("@/lib/supabase")
          
          const [categoriesRes, subcategoriesRes] = await Promise.all([
            supabase.from("categories").select("*").order("name"),
            supabase.from("subcategories").select("*").order("name")
          ])
          
          const categoriesData = categoriesRes.data || []
          const subcategoriesData = subcategoriesRes.data || []
          
          setCategories(categoriesData)
          setSubcategories(subcategoriesData)
          
          // حفظ في الكاش لمدة ساعة
          cacheManager.set('header_categories', categoriesData, 60 * 60 * 1000)
          cacheManager.set('header_subcategories', subcategoriesData, 60 * 60 * 1000)
          
          setDataLoaded(true)
        } catch (error) {
          console.error('Failed to load categories:', error)
        }
      }

      loadCategoriesData()
    }
  }, [isSidebarOpen, dataLoaded])

  const { itemCount } = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const isAdmin = Boolean(user?.is_admin)
  const { unreadCount, fetchNotifications } = useNotificationsStore()

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchNotifications(user.id)
    }
  }, [isAuthenticated, user, fetchNotifications])

  // حاول تعيين كوكي الأدمن تلقائياً عندما يكون المستخدم أدمن
  useEffect(() => {
    let cancelled = false
    const setAdminCookie = async () => {
      try {
        if (isAuthenticated && isAdmin && user?.id) {
          await fetch('/api/auth/admin-cookie', { method: 'POST', headers: { 'x-user-id': user.id } })
        }
      } catch {}
    }
    setAdminCookie()
    return () => { cancelled = true }
  }, [isAuthenticated, isAdmin, user?.id])

  const handleGoAdmin = async () => {
    try {
      if (isAuthenticated && isAdmin && user?.id) {
        await fetch('/api/auth/admin-cookie', { method: 'POST', headers: { 'x-user-id': user.id } })
      }
    } catch {}
    router.push('/admin')
  }

  const handleLogout = () => {
    logout()
  // إزالة كوكي الأدمن عند الخروج
  fetch('/api/auth/admin-cookie', { method: 'DELETE' }).catch(() => {})
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="logo" width={44} height={44} className="w-11 h-11 object-contain" priority />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              <Link href="/" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
                الرئيسية
              </Link>
              <Link href="/categories" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
                المنتجات
              </Link>
              <Link href="/offers" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
                العروض
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-red-600 transition-colors font-medium">
                من نحن
              </Link>
              {isAuthenticated && isAdmin && (
                <button onClick={handleGoAdmin} className="text-red-700 hover:text-red-800 transition-colors font-semibold">
                  الأدمن
                </button>
              )}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <SearchBar />
            </div>

            {/* User Actions + Sidebar Button */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Notifications */}
              {isAuthenticated && (
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="relative hover:bg-red-50">
                    <Bell className="h-5 w-5 text-green-800" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative hover:bg-red-50 group">
                  <ShoppingCart className="h-5 w-5 text-green-800 group-hover:text-red-600 transition-colors" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 animate-pulse">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu onOpenChange={(open) => {
                  if (open) {
                    if (isAdmin) {
                      fetch('/api/auth/admin-cookie', { method: 'POST', headers: { 'x-user-id': user!.id } }).catch(() => {})
                    } else {
                      fetch('/api/auth/admin-cookie', { method: 'DELETE' }).catch(() => {})
                    }
                  }
                }}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-red-50">
                      <User className="h-5 w-5 text-green-800" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-black">{user?.phone}</p>
                      <p className="text-xs text-red-600 font-medium">{user?.loyalty_points} نقطة ولاء</p>
                    </div>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleGoAdmin() }}>
                        لوحة التحكم
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/profile">الملف الشخصي</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">طلباتي</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/loyalty">نقاط الولاء</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowLoginModal(true)} className="bg-red-600 hover:bg-red-700 shadow-sm text-[10px] px-2 h-7 md:h-10 md:text-sm">
                  تسجيل الدخول
                </Button>
              )}

              {/* Sidebar Button (ثلاث شرط) */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                <span className="sr-only">القائمة الجانبية</span>
                <Menu className="h-7 w-7 text-green-800" />
              </Button>
            </div>
          </div>

          {/* Sidebar Menu (Mobile) */}
          {isSidebarOpen && (
            <div className="fixed inset-0 z-[100] flex">
              {/* Overlay */}
              <div className="fixed inset-0 bg-black/40" onClick={() => setIsSidebarOpen(false)} />
              {/* Sidebar */}
              <aside className="relative w-72 max-w-[90vw] h-full bg-white shadow-2xl p-4 flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-extrabold text-red-600">القائمة</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                    <X className="h-6 w-6 text-green-800" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-2">
                  <Link href="/" className="py-2 px-3 rounded-lg hover:bg-red-50 text-base font-bold text-gray-800" onClick={() => setIsSidebarOpen(false)}>
                    الرئيسية
                  </Link>
                  <Link href="/categories" className="py-2 px-3 rounded-lg hover:bg-red-50 text-base font-bold text-gray-800" onClick={() => setIsSidebarOpen(false)}>
                    كل المنتجات
                  </Link>
                  <Link href="/offers" className="py-2 px-3 rounded-lg hover:bg-red-50 text-base font-bold text-gray-800" onClick={() => setIsSidebarOpen(false)}>
                    العروض
                  </Link>
                  <Link href="/about" className="py-2 px-3 rounded-lg hover:bg-red-50 text-base font-bold text-gray-800" onClick={() => setIsSidebarOpen(false)}>
                    من نحن
                  </Link>
                  {isAuthenticated && isAdmin && (
                    <button
                      className="text-right py-2 px-3 rounded-lg hover:bg-red-50 text-base font-bold text-red-700"
                      onClick={async () => { await handleGoAdmin(); setIsSidebarOpen(false) }}
                    >
                      الأدمن
                    </button>
                  )}
                </nav>
                <hr className="my-4" />
                <div>
                  <h4 className="text-base font-extrabold text-gray-700 mb-2">الأقسام</h4>
                  <div className="flex flex-col gap-1">
                    {categories.map((cat) => (
                      <div key={cat.id} className="mb-1">
                        <Link href={`/category/${cat.id}`} className="block py-2 px-3 rounded-lg hover:bg-green-50 text-base font-extrabold text-green-700 bg-green-50/60 border border-green-200 shadow-sm" style={{zIndex:2, position:'relative'}} onClick={() => setIsSidebarOpen(false)}>
                          {cat.name}
                        </Link>
                        {/* الفئات الفرعية */}
                        <div className="pl-4 border-r-2 border-green-100 ml-2 -mt-1">
                          {subcategories.filter((sub) => sub.category_id === cat.id).map((sub) => (
                            <Link key={sub.id} href={`/subcategory/${sub.id}`} className="block py-1 px-2 rounded hover:bg-yellow-50 text-sm text-yellow-700 font-bold ml-2" style={{zIndex:1, position:'relative'}} onClick={() => setIsSidebarOpen(false)}>
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </header>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
