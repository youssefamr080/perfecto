"use client"

import { Home, Grid3X3, Search, ShoppingCart, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCartStore } from "@/lib/stores/cart-store"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/", icon: Home, label: "الرئيسية" },
  { href: "/categories", icon: Grid3X3, label: "الأقسام" },
  { href: "/search", icon: Search, label: "البحث" },
  { href: "/cart", icon: ShoppingCart, label: "السلة" },
  { href: "/profile", icon: User, label: "الحساب" },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const itemCount = useCartStore((state) => state.itemCount)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          const isCart = href === "/cart"

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center py-2 px-3 relative transition-colors ${
                isActive ? "text-red-600" : "text-gray-600"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {isCart && itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {itemCount > 99 ? "99+" : itemCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
