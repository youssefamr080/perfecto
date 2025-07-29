"use client"

import Image from "next/image"
import Link from "next/link"
import { Plus, Minus, Star, ShoppingCart, Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { useCartStore } from "@/lib/stores/cart-store"
import { useState, memo } from "react"
import { useToast } from "@/hooks/use-toast"

interface ProductCardProps {
  product: Product
  showQuickActions?: boolean
}

function ProductCardComponent({ product, showQuickActions = true }: ProductCardProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCartStore()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [isHovered, setIsHovered] = useState(false)

  const cartQuantity = getItemQuantity(product.id)

  const handleAddToCart = () => {
    addItem(product, quantity)
    setQuantity(1)
    toast({
      title: "تم إضافة المنتج! 🛒",
      description: `تم إضافة ${product.name} إلى السلة`,
      duration: 2000,
    })
  }

  const handleUpdateCart = (newQuantity: number) => {
    updateQuantity(product.id, newQuantity)
    if (newQuantity === 0) {
      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج من السلة",
        duration: 2000,
      })
    }
  }

  const discountPercentage = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const savings = product.original_price ? product.original_price - product.price : 0

  return (
    <Card
      className="group rounded-3xl hover:shadow-elevated transition-all duration-500 border-0 shadow-soft bg-white overflow-hidden relative font-extrabold text-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden rounded-3xl">
          <Image
            src={product.images[0] || `/placeholder.svg?height=300&width=300&text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500 rounded-3xl"
            loading="lazy"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {!product.is_available && (
              <Badge className="bg-gray-500 text-white text-xs px-3 py-1 shadow-soft font-extrabold">غير متوفر</Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-3 py-1 shadow-soft animate-pulse font-extrabold">
                خصم {discountPercentage}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-yellow-400 text-black text-xs px-3 py-1 flex items-center gap-1 shadow-soft font-extrabold">
                <Star className="h-3 w-3 fill-current" />
                مميز
              </Badge>
            )}
          </div>

          {/* Quick Actions محذوفة بناءً على طلب المستخدم */}

          {/* Quick View Overlay */}
          <Link href={`/product/${product.id}`} prefetch={false}>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center rounded-3xl">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/95 backdrop-blur-sm rounded-full px-5 py-2 text-base font-extrabold text-black shadow-soft">
                عرض التفاصيل
              </div>
            </div>
          </Link>
        </div>
      </div>

      <CardContent className="p-5 md:p-6 font-extrabold text-black">
        {/* Product Info */}
        <div className="mb-3">
          <Link href={`/product/${product.id}`} prefetch={false}>
            <h3 className="font-extrabold text-base md:text-lg mb-1 hover:text-red-600 transition-colors line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-600 text-xs md:text-sm line-clamp-2 mb-2 leading-relaxed font-semibold">{product.description}</p>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-extrabold text-red-600">{product.price} ج.م</span>
                {product.original_price && (
                  <span className="text-base text-gray-400 line-through font-bold">{product.original_price} ج.م</span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-bold">{product.unit_description}</span>
              {savings > 0 && <span className="text-xs text-green-600 font-extrabold">وفر {savings.toFixed(2)} ج.م</span>}
            </div>
          </div>
        </div>

        {/* Add to Cart Section */}
        {product.is_available ? (
          cartQuantity > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
            <div className="flex items-center bg-gray-100 rounded-full">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdateCart(cartQuantity - 1)}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-extrabold min-w-[2rem] text-center text-base">{cartQuantity}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdateCart(cartQuantity + 1)}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-red-600 font-extrabold flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  في السلة
                </span>
              </div>
              <div className="text-xs text-gray-500 text-center font-bold">
                المجموع: {(product.price * cartQuantity).toFixed(2)} ج.م
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
            <div className="flex items-center bg-gray-100 rounded-full">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-extrabold min-w-[2rem] text-center text-base">{quantity}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 h-10 flex-1 shadow-soft font-extrabold rounded-full"
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  أضف للسلة
                </Button>
              </div>
              {quantity > 1 && (
                <div className="text-xs text-gray-500 text-center font-bold">
                  المجموع: {(product.price * quantity).toFixed(2)} ج.م
                </div>
              )}
            </div>
          )
        ) : (
          <Button disabled className="w-full text-xs py-2 h-10 bg-gray-100 rounded-full font-extrabold">
            غير متوفر
          </Button>
        )}

        {/* Stock indicator */}
        {product.is_available && product.stock_quantity && product.stock_quantity < 10 && (
          <div className="mt-2 text-center">
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 font-extrabold px-3 py-1 rounded-full">
              متبقي {product.stock_quantity} قطع فقط
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// تحسين الأداء باستخدام memo
export const ProductCard = memo(ProductCardComponent)
