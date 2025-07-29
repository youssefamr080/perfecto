"use client"
import { useState, useEffect } from "react"
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
import { LoginModal } from "./auth/login-modal"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<SubCategory[]>([])

  // جلب الأقسام والفئات الفرعية عند فتح السايدبار
  useEffect(() => {
    if (isSidebarOpen) {
      import("@/lib/supabase").then(({ supabase }) => {
        supabase.from("categories").select("*").then(({ data }) => setCategories(data || []))
        supabase.from("subcategories").select("*").then(({ data }) => setSubcategories(data || []))
      })
    }
  }, [isSidebarOpen])

  const { itemCount } = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image src="/placeholder-logo.svg" alt="logo" width={40} height={40} className="w-10 h-10 object-contain" priority />
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
                    <Bell className="h-5 w-5" />
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                      3
                    </Badge>
                  </Button>
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative hover:bg-red-50 group">
                  <ShoppingCart className="h-5 w-5 group-hover:text-red-600 transition-colors" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 animate-pulse">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-red-50">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.phone}</p>
                      <p className="text-xs text-red-600 font-medium">{user?.loyalty_points} نقطة ولاء</p>
                    </div>
                    <DropdownMenuSeparator />
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
                <Menu className="h-7 w-7" />
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
                    <X className="h-6 w-6" />
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
                </nav>
                <hr className="my-4" />
                <div>
                  <h4 className="text-base font-extrabold text-gray-700 mb-2">الأقسام</h4>
                  <div className="flex flex-col gap-1">
                    {categories.map((cat) => (
                      <div key={cat.id}>
                        <Link href={`/category/${cat.id}`} className="block py-2 px-3 rounded-lg hover:bg-green-50 text-base font-bold text-green-800" onClick={() => setIsSidebarOpen(false)}>
                          {cat.name}
                        </Link>
                        {/* الفئات الفرعية */}
                        <div className="pl-4 border-r-2 border-green-100 ml-2">
                          {subcategories.filter((sub) => sub.category_id === cat.id).map((sub) => (
                            <Link key={sub.id} href={`/subcategory/${sub.id}`} className="block py-1 px-2 rounded hover:bg-green-50 text-sm text-green-700 font-semibold" onClick={() => setIsSidebarOpen(false)}>
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
