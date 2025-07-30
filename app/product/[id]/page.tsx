"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Plus, Minus, Star, Share2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/lib/types"
import { useCartStore } from "@/lib/stores/cart-store"
import { supabase } from "@/lib/supabase"
import { ProductCard } from "@/components/product-card"
import { useToast } from "@/hooks/use-toast"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { items, addItem, updateQuantity, getItemQuantity } = useCartStore()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const cartQuantity = product ? getItemQuantity(product.id) : 0

  useEffect(() => {
    async function fetchProduct() {
      if (!params.id) return

      try {
        // Get the product
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", params.id)
          .single()

        if (productError) throw productError

        // Get the subcategory and category
        let subcategoryData = null
        if (productData.subcategory_id) {
          const { data: subcategory, error: subcategoryError } = await supabase
            .from("subcategories")
            .select("*")
            .eq("id", productData.subcategory_id)
            .single()

          if (!subcategoryError && subcategory) {
            // Get the category
            const { data: category, error: categoryError } = await supabase
              .from("categories")
              .select("*")
              .eq("id", subcategory.category_id)
              .single()

            subcategoryData = {
              ...subcategory,
              category: categoryError ? undefined : category,
            }
          }
        }

        const fullProduct = {
          ...productData,
          subcategory: subcategoryData,
        }

        setProduct(fullProduct)

        // Fetch related products from the same subcategory
        if (productData.subcategory_id) {
          const { data: related } = await supabase
            .from("products")
            .select("*")
            .eq("subcategory_id", productData.subcategory_id)
            .neq("id", productData.id)
            .eq("is_available", true)
            .limit(6)

          setRelatedProducts(related || [])
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity)
      setQuantity(1)
      toast({
        title: "تم إضافة المنتج!",
        description: `تم إضافة ${product.name} إلى السلة`,
      })
    }
  }

  const handleUpdateCart = (newQuantity: number) => {
    if (!product) return
    if (newQuantity <= 0) {
      updateQuantity(product.id, 0)
      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج من السلة",
      })
    } else {
      updateQuantity(product.id, newQuantity)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "تم النسخ!",
        description: "تم نسخ رابط المنتج",
      })
    }
  }

  const discountPercentage = product?.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-600 mb-2">المنتج غير موجود</h1>
          <p className="text-gray-500 mb-4">لم نتمكن من العثور على هذا المنتج</p>
          <Link href="/categories">
            <Button className="bg-green-600 hover:bg-green-700">تصفح المنتجات</Button>
          </Link>
        </div>
      </div>
    )
  }

  const productImages =
    product.images.length > 0
      ? product.images
      : [`/placeholder.svg?height=500&width=500&text=${encodeURIComponent(product.name)}`]

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center text-sm text-gray-600 overflow-x-auto">
            <Link href="/" className="hover:text-green-600 whitespace-nowrap">
              الرئيسية
            </Link>
            <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
            <Link href="/categories" className="hover:text-green-600 whitespace-nowrap">
              المنتجات
            </Link>
            <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
            {product.subcategory?.category && (
              <>
                <Link
                  href={`/category/${product.subcategory.category.id}`}
                  className="hover:text-green-600 whitespace-nowrap"
                >
                  {product.subcategory.category.name}
                </Link>
                <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
              </>
            )}
            {product.subcategory && (
              <>
                <Link
                  href={`/subcategory/${product.subcategory.id}`}
                  className="hover:text-green-600 whitespace-nowrap"
                >
                  {product.subcategory.name}
                </Link>
                <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
              </>
            )}
            <span className="text-green-600 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-xl overflow-hidden shadow-sm border">
              <Image
                src={productImages[selectedImageIndex] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {!product.is_available && <Badge className="bg-red-500 text-white">غير متوفر</Badge>}
                {discountPercentage > 0 && <Badge className="bg-red-500 text-white">خصم {discountPercentage}%</Badge>}
                {product.is_featured && (
                  <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    مميز
                  </Badge>
                )}
              </div>

              {/* Share Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? "border-green-500" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-3 leading-tight">{product.name}</h1>
              <p className="text-black text-base md:text-lg font-bold leading-relaxed">{product.description}</p>
            </div>

            {/* Price */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl md:text-4xl font-bold text-green-600">{product.price} ج.م</span>
                    {product.original_price && (
                      <span className="text-lg text-gray-400 line-through">{product.original_price} ج.م</span>
                    )}
                  </div>
                  <span className="text-sm text-black font-bold">{product.unit_description}</span>
                </div>
                {discountPercentage > 0 && (
                  <div className="text-center">
                    <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                      وفر {discountPercentage}%
                    </div>
                    <div className="text-xs text-black mt-1">
                      توفير {(product.original_price! - product.price).toFixed(2)} ج.م
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Add to Cart */}
              {product.is_available ? (
                cartQuantity > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleUpdateCart(cartQuantity - 1)}
                        className="h-12 w-12"
                      >
                        <Minus className="h-5 w-5 text-black" />
                      </Button>
                      <span className="text-2xl font-bold text-black min-w-[3rem] text-center">{cartQuantity}</span>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleUpdateCart(cartQuantity + 1)}
                        className="h-12 w-12"
                      >
                        <Plus className="h-5 w-5 text-black" />
                      </Button>
                    </div>
                    <div className="text-center">
                      <p className="text-green-600 font-semibold mb-2">✅ تم إضافة المنتج للسلة</p>
                      <Link href="/cart">
                        <Button variant="outline" className="w-full bg-transparent">
                          عرض السلة
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-12 w-12"
                      >
                        <Minus className="h-5 w-5 text-black" />
                      </Button>
                      <span className="text-2xl font-bold text-black min-w-[3rem] text-center">{quantity}</span>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-12 w-12"
                      >
                        <Plus className="h-5 w-5 text-black" />
                      </Button>
                    </div>
                    <Button
                      size="lg"
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                      onClick={handleAddToCart}
                    >
                      أضف للسلة - {(product.price * quantity).toFixed(2)} ج.م
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-center py-6">
                  <p className="text-red-600 font-semibold mb-4">❌ المنتج غير متوفر حالياً</p>
                  <Button disabled className="w-full">
                    غير متوفر
                  </Button>
                </div>
              )}
            </div>

            {/* Product Features */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border">
              <h3 className="font-bold text-black text-2xl mb-4">مميزات المنتج</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-black font-bold">طبيعي 100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-black font-bold">بدون مواد حافظة</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-black font-bold">جودة عالية</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-black font-bold">طازج يومياً</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">منتجات مشابهة</h2>
              {product.subcategory && (
                <Link href={`/subcategory/${product.subcategory.id}`}>
                  <Button variant="outline" size="sm">
                    عرض الكل
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}

        {/* Trust Badges */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-6 text-green-800">لماذا تختار بيرفكتو تيب؟</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl md:text-3xl">🌱</span>
              </div>
              <h4 className="font-semibold text-sm md:text-base mb-1">طبيعي 100%</h4>
              <p className="text-xs md:text-sm text-gray-600">بدون مواد حافظة</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl md:text-3xl">🚚</span>
              </div>
              <h4 className="font-semibold text-sm md:text-base mb-1">توصيل سريع</h4>
              <p className="text-xs md:text-sm text-gray-600">نفس اليوم</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl md:text-3xl">⭐</span>
              </div>
              <h4 className="font-semibold text-sm md:text-base mb-1">جودة مضمونة</h4>
              <p className="text-xs md:text-sm text-gray-600">أو استرداد المبلغ</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl md:text-3xl">🎁</span>
              </div>
              <h4 className="font-semibold text-sm md:text-base mb-1">نقاط ولاء</h4>
              <p className="text-xs md:text-sm text-gray-600">مع كل طلب</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
