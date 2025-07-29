"use client"
import { useState } from "react"
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

  const { itemCount } = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors">
              بيرفكتو تيب
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

            {/* User Actions */}
            <div className="flex items-center space-x-4 space-x-reverse">
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
                <Button onClick={() => setShowLoginModal(true)} className="bg-red-600 hover:bg-red-700 shadow-sm">
                  تسجيل الدخول
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t bg-white">
              {/* Mobile Search */}
              <div className="mb-4">
                <SearchBar showSuggestions={false} />
              </div>

              <nav className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-red-600 py-2 px-2 rounded-md hover:bg-red-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  الرئيسية
                </Link>
                <Link
                  href="/categories"
                  className="text-gray-700 hover:text-red-600 py-2 px-2 rounded-md hover:bg-red-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  المنتجات
                </Link>
                <Link
                  href="/offers"
                  className="text-gray-700 hover:text-red-600 py-2 px-2 rounded-md hover:bg-red-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  العروض
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-red-600 py-2 px-2 rounded-md hover:bg-red-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  من نحن
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
