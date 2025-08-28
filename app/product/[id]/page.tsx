"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Plus, Minus, Star, Share2, ArrowRight, Truck, Gift, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/lib/types"
import { useCartStore } from "@/lib/stores/cart-store"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/lib/stores/auth-store"
import { LoginModal } from "@/components/auth/login-modal"
import Breadcrumbs from "@/components/navigation/Breadcrumbs"
import { getCachedProducts } from "@/lib/utils"
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
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [ratingInput, setRatingInput] = useState<number>(5)
  const [commentInput, setCommentInput] = useState<string>("")
  const [commentTouched, setCommentTouched] = useState<boolean>(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  // track expanded review ids for "عرض المزيد"
  const [expandedReviews, setExpandedReviews] = useState<string[]>([])

  const toggleExpanded = (id: string) => {
    setExpandedReviews((prev) => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const CHAR_LIMIT = 220

  // quick preset comments users can pick to autofill the textarea
  const quickComments = ['ممتاز', 'رائع جدا', 'أنصح به', 'لم يعجبني']

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0)
    return +(sum / reviews.length)
  }, [reviews])
  // Use the local auth store to determine whether the user is logged in.
  // We rely on `lib/stores/auth-store.ts` (Zustand persist) rather than
  // calling `supabase.auth.getUser()` here to avoid race conditions where
  // the persisted store may not be rehydrated yet. The store is the
  // single source of truth for UI-level auth state in this app.
  const { user: currentUser, isAuthenticated } = useAuthStore()

  const cartQuantity = product ? getItemQuantity(product.id) : 0

  // SVG star component with gradient fill for a premium look
  const StarSVG = ({ filled, size = 20 }: { filled: boolean; size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
      aria-hidden
    >
      <defs>
        <linearGradient id="starGrad" x1="0" x2="1">
          <stop offset="0%" stopColor="#FFD54A" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.755 5.583 6.165.896-4.46 4.347 1.052 6.135L12 17.77l-5.512 2.69L7.54 13.33 3.08 8.983l6.165-.896L12 2.5z"
        fill={filled ? 'url(#starGrad)' : 'none'}
        stroke={filled ? 'none' : '#e5e7eb'}
        strokeWidth={1.2}
      />
    </svg>
  )

  useEffect(() => {
    async function fetchProduct() {
      if (!params.id) return
      try {
        // جلب كل المنتجات من الكاش
        const allProducts = await getCachedProducts()
        const productData = allProducts.find(p => p.id == params.id)
        if (!productData) throw new Error("المنتج غير موجود")

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

        // المنتجات المشابهة من الكاش
        if (productData.subcategory_id) {
          const related = allProducts.filter(
            p => p.subcategory_id === productData.subcategory_id && p.id !== productData.id
          ).slice(0, 6)
          setRelatedProducts(related)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  // NOTE: we intentionally do NOT call `supabase.auth.getUser()` here.
  // Authentication state is provided by `useAuthStore()` which reads the
  // persisted user (from `lib/stores/auth-store.ts`). This keeps UI logic
  // consistent and avoids prompting the user to log in again due to
  // rehydration timing issues.

  useEffect(() => {
    // fetch approved reviews for this product
    const fetchReviews = async () => {
      if (!product) return
      setReviewsLoading(true)
      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('id, user_id, rating, comment, created_at, users(name)')
          .eq('product_id', product.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setReviews((data as any[]) || [])
      } catch (err) {
        console.error('Error fetching reviews:', err)
      } finally {
        setReviewsLoading(false)
      }
    }

    fetchReviews()
  }, [product])

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
          <p className="text-gray-700 mb-4">لم نتمكن من العثور على هذا المنتج</p>
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
      {/* Breadcrumb - reusable component */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 overflow-hidden">
          <div className="max-w-full truncate">
            <Breadcrumbs
            segments={[
              { href: "/", label: "الرئيسية" },
              { href: "/categories", label: "المنتجات" },
              ...(product.subcategory?.category ? [{ href: `/category/${product.subcategory.category.id}`, label: product.subcategory.category.name }] : []),
              ...(product.subcategory ? [{ href: `/subcategory/${product.subcategory.id}`, label: product.subcategory.name }] : []),
              { label: product.name },
            ]}
            />
          </div>
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
                      className="w-full bg-red-600 hover:bg-green-700 text-white text-lg py-6"
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

        {/* Reviews Section - redesigned with polished cards and interactive stars */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">تقييمات ومراجعات العملاء</h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="inline-block" aria-hidden role="img">
                      <StarSVG filled={i < Math.round(averageRating)} size={22} />
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-700">{averageRating.toFixed(1)} / 5</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">{reviews.length} مراجعة</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {reviewsLoading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-2/5" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-gray-600">لا توجد مراجعات حتى الآن.</div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <article key={r.id} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                      <div className="flex items-start gap-4">
                        {/* avatar initials */}
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-md">{(r.users?.name || 'مستخدم').split(' ').map((s:string)=>s[0]).slice(0,2).join('')}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-gray-900">{r.users?.name || 'مستخدم'}</div>
                            <div className="text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString('ar-EG')}</div>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="inline-block" aria-hidden>
                                <StarSVG filled={i < Number(r.rating)} size={18} />
                              </span>
                            ))}
                            <span className="text-sm text-gray-500">{r.rating}/5</span>
                          </div>

                          <p className="text-gray-700 leading-relaxed">
                            {typeof r.comment === 'string' && r.comment.length > CHAR_LIMIT && !expandedReviews.includes(r.id)
                              ? `${r.comment.slice(0, CHAR_LIMIT).trim()}...`
                              : r.comment}
                          </p>
                          {typeof r.comment === 'string' && r.comment.length > CHAR_LIMIT && (
                            <button type="button" onClick={() => toggleExpanded(r.id)} className="mt-3 text-sm text-red-600 font-medium">
                              {expandedReviews.includes(r.id) ? 'عرض أقل' : 'عرض المزيد'}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="font-semibold text-lg mb-3">اكتب مراجعتك</h3>
                {!currentUser ? (
                  <div className="text-sm text-gray-600">يجب أن تكون مسجلاً لتترك مراجعة. <button type="button" onClick={() => setShowLoginModal(true)} className="text-red-600 font-medium underline">تسجيل الدخول</button></div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    if (!product) return
                    // Client-side validation: rating and non-empty comment
                    if (ratingInput < 1 || ratingInput > 5) {
                      toast({ title: 'خطأ', description: 'التقييم يجب أن يكون بين 1 و 5', variant: 'destructive' })
                      return
                    }
                    if (!commentInput || commentInput.trim().length === 0) {
                      toast({ title: 'خطأ', description: 'التعليق لا يمكن أن يكون فارغاً', variant: 'destructive' })
                      return
                    }
                    setSubmittingReview(true)
                    try {
                      const { data, error } = await supabase.from('product_reviews').insert([
                        {
                          user_id: currentUser.id,
                          product_id: product.id,
                          rating: ratingInput,
                          comment: commentInput,
                          // is_approved omitted so DB default applies
                        }
                      ])
                      if (error) throw error
                      setCommentInput('')
                      setRatingInput(5)
                      setCommentTouched(false)
                      toast({ title: `شكراً ${currentUser?.name || ''}!`, description: 'شكراً على تقييمك لمنتجنا', duration: 4000 })
                    } catch (err) {
                      console.error('Error submitting review:', err)
                      toast({ title: 'خطأ', description: 'فشل إرسال المراجعة', variant: 'destructive' })
                    } finally {
                      setSubmittingReview(false)
                    }
                  }}>
                    <div className="mb-3">
                      <label className="block text-sm text-gray-700 mb-2">التقييم</label>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const idx = i + 1
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setRatingInput(idx)}
                              aria-label={`${idx} نجوم`}
                              className={`p-1 rounded-lg transform transition duration-150 ${ratingInput >= idx ? 'scale-105' : 'hover:scale-110'}`}
                            >
                              <StarSVG filled={ratingInput >= idx} size={28} />
                            </button>
                          )
                        })}
                        <span className="text-sm text-gray-500">{ratingInput}/5</span>
                      </div>
                    </div>

                    {/* Quick comment presets */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {quickComments.map((qc) => (
                          <button
                            key={qc}
                            type="button"
                            onClick={() => setCommentInput(qc)}
                            className={`text-sm px-3 py-1 rounded-full border ${commentInput === qc ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-800 border-gray-200'}`}
                          >
                            {qc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm text-gray-700 mb-2">التعليق</label>
                      <textarea
                        value={commentInput}
                        onChange={(e) => {
                          setCommentInput(e.target.value)
                          setCommentTouched(true)
                        }}
                        onFocus={() => setCommentTouched(true)}
                        placeholder="اكتب تعليقك هنا..."
                        aria-label="تعليق"
                        className="w-full mt-2 border border-gray-200 rounded-lg px-3 py-2 h-28 text-black placeholder-gray-500 focus:border-red-300 focus:ring-1 focus:ring-red-100"
                      />
                      {commentTouched && (commentInput || '').trim().length < 5 && (
                        <p className="mt-2 text-xs text-gray-500">الحد الأدنى: 5 أحرف</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingReview || (commentInput || '').trim().length < 5}
                      aria-disabled={submittingReview || (commentInput || '').trim().length < 5}
                      className={`w-full text-white ${submittingReview || (commentInput || '').trim().length < 5 ? 'bg-red-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {submittingReview ? 'جاري الإرسال...' : 'أرسل المراجعة'}
                    </Button>
                  </form>
                )}
              </div>
            </aside>
          </div>
        </section>

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

        {/* Trust Badges - polished, mobile-first, black text */}
        <div className="bg-green-50 rounded-xl p-4 md:p-6">
          <h3 className="text-xl md:text-2xl font-bold text-center mb-4 text-black">لماذا تختار بيرفكتو تيب؟</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
                  <Leaf className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm md:text-base text-black">طبيعي 100%</h4>
                <p className="text-xs md:text-sm text-gray-700 mt-1">بدون مواد حافظة</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
                  <Truck className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm md:text-base text-black">توصيل سريع</h4>
                <p className="text-xs md:text-sm text-gray-700 mt-1">مباشرة </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm md:text-base text-black">جودة مضمونة</h4>
                <p className="text-xs md:text-sm text-gray-700 mt-1">أو استرداد المبلغ</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 text-green-700 rounded-lg flex items-center justify-center">
                  <Gift className="h-6 w-6" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm md:text-base text-black">نقاط ولاء</h4>
                <p className="text-xs md:text-sm text-gray-700 mt-1">مع كل طلب</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  )
}
