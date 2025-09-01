"use client"

import Image from "next/image"
import Link from "next/link"
import { Plus, Minus, Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { useCartStore } from "@/lib/stores/cart-store"
import { useState, memo, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getProductRating, type ProductRating } from "@/lib/utils/product-utils"

interface ProductCardProps {
  product: Product
  showQuickActions?: boolean
}

function ProductCardComponent({ product, showQuickActions = true }: ProductCardProps) {
  const { addItem, getItemQuantity } = useCartStore()
  const { toast } = useToast()
  const [isHovered, setIsHovered] = useState(false)
  const [rating, setRating] = useState<ProductRating>({ average: 0, count: 0 })
  const [imgLoaded, setImgLoaded] = useState(false)

  const cartQuantity = getItemQuantity(product.id)

  // Fetch product rating using utility function
  useEffect(() => {
    const fetchRating = async () => {
      const productRating = await getProductRating(product.id)
      setRating(productRating)
    }

    fetchRating()
  }, [product.id])

  const handleAddToCart = () => {
    addItem(product, 1)
    toast({
      title: "✅ تمت الإضافة للسلة!",
      description: `تم إضافة ${product.name} إلى سلة التسوق`,
      variant: "success",
      duration: 3000,
    })
  }

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(value)

  const discountPercentage = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  const savings = product.original_price ? product.original_price - product.price : 0

  return (
    <Card
      itemScope
      itemType="https://schema.org/Product"
      className="group rounded-3xl hover:shadow-elevated transition-all duration-300 border border-gray-100 hover:border-red-100 shadow-soft hover:shadow-lg bg-white overflow-hidden relative font-extrabold text-black focus-within:ring-2 focus-within:ring-red-100"
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
            onLoad={() => setImgLoaded(true)}
            onLoadingComplete={() => setImgLoaded(true)}
          />
          {/* Image skeleton while loading */}
          <div
            aria-hidden
            className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${imgLoaded ? 'opacity-0' : 'opacity-100'}`}
          >
            <div className="w-full h-full animate-pulse bg-gradient-to-br from-gray-100 to-gray-200" />
          </div>
          {/* Schema.org image */}
          <meta itemProp="image" content={product.images[0] || '/placeholder.jpg'} />

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
          <Link href={`/product/${product.id}`} prefetch={false} className="focus:outline-none">
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center rounded-3xl">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 backdrop-blur-sm rounded-full px-5 py-2 text-base font-extrabold text-black shadow-soft focus-visible:ring-2 focus-visible:ring-red-200">
                عرض التفاصيل
              </div>
            </div>
          </Link>
        </div>
      </div>

      <CardContent className="p-5 md:p-6 font-extrabold text-black">
        {/* Product Info */}
        <div className="mb-3">
          <Link href={`/product/${product.id}`} prefetch={false} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200 rounded">
            <h3 itemProp="name" className="font-extrabold text-base md:text-lg mb-1 hover:text-red-600 transition-colors line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>
          <p itemProp="description" className="text-gray-600 text-xs md:text-sm line-clamp-2 mb-2 leading-relaxed font-semibold">{product.description}</p>

          {/* Star Rating - always visible for layout stability */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(rating.average) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 font-medium" aria-label={`تقييم ${rating.average} من 5 بناءً على ${rating.count} مراجعة`}>
              {rating.average} ({rating.count})
            </span>
            {/* Schema.org AggregateRating */}
            <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating" className="hidden">
              <meta itemProp="ratingValue" content={String(rating.average)} />
              <meta itemProp="reviewCount" content={String(rating.count)} />
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-extrabold text-red-600" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <span itemProp="price">{formatPrice(product.price)}</span> ج.م
                  <meta itemProp="priceCurrency" content="EGP" />
                  <link itemProp="availability" href={`https://schema.org/${product.is_available ? 'InStock' : 'OutOfStock'}`} />
                </span>
                {product.original_price && (
                  <span className="text-base text-gray-600 line-through font-bold" aria-label={`السعر قبل الخصم ${formatPrice(product.original_price)} جنيه`}>
                    {formatPrice(product.original_price)} ج.م
                  </span>
                )}
              </div>
              <span className="text-xs text-black font-bold">{product.unit_description}</span>
              {savings > 0 && <span className="text-xs text-green-600 font-extrabold">وفر {formatPrice(savings)} ج.م</span>}
            </div>
          </div>
        </div>

        {/* Add to Cart Section */}
        {product.is_available ? (
          <Button
            onClick={handleAddToCart}
            aria-label={`أضف ${product.name} للسلة`}
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 h-10 w-full shadow-soft font-extrabold rounded-full focus-visible:ring-2 focus-visible:ring-red-200"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            أضف للسلة
          </Button>
        ) : (
                    <Button disabled aria-disabled className="w-full text-xs py-2 h-10 bg-gray-300 text-gray-700 rounded-full font-extrabold">
            غير متوفر حالياً
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
