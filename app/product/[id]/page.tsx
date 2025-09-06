"use client"

import { useEffect, useState, useCallback } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Plus, Minus, Star, Share2, Truck, Gift, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Product, Category, SubCategory } from "@/lib/types"
import { useCartStore } from "@/lib/stores/cart-store"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/lib/stores/auth-store"
import { LoginModal } from "@/components/auth/login-modal"
import Breadcrumbs from "@/components/navigation/Breadcrumbs"
import { getCachedProducts } from "@/lib/utils"
import { ProductCard } from "@/components/product-card"
import { useToast } from "@/hooks/use-toast"
import { ReviewSummary } from "@/components/product/review-summary"
import { EnhancedReviewDisplay } from "@/components/product/enhanced-review-display"
import { EnhancedReviewForm } from "@/components/product/enhanced-review-form"
import Head from "next/head"

export default function ProductPage() {
  const params = useParams()
  const { addItem, updateQuantity, getItemQuantity } = useCartStore()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  type ReviewRow = {
    id: string
    user_id: string
    rating: number
    comment: string
    created_at: string
    store_reply?: string | null
    store_reply_at?: string | null
    helpful_count?: number | null
    not_helpful_count?: number | null
    is_verified_purchase?: boolean | null
    is_featured?: boolean | null
    users?: { name?: string | null; phone?: string | null } | null
  }
  // Matches EnhancedReviewDisplay's expected shape
  type DisplayReview = {
    id: string
    rating: number
    comment: string
    created_at: string
    user: { name: string; avatar?: string }
    helpful_count?: number
    not_helpful_count?: number
    isHelpful?: boolean
    store_reply?: string
    store_reply_at?: string
    is_verified_purchase?: boolean
    flagged_count?: number
    is_featured?: boolean
  }
  const [reviews, setReviews] = useState<DisplayReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [reviewFilter] = useState<{ sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'; rating?: number; verified?: boolean }>({ sortBy: 'newest' })

  // Average rating is computed inside ReviewSummary; keep local calculation removed to avoid duplication
  // Use the local auth store to determine whether the user is logged in.
  // We rely on `lib/stores/auth-store.ts` (Zustand persist) rather than
  // calling `supabase.auth.getUser()` here to avoid race conditions where
  // the persisted store may not be rehydrated yet. The store is the
  // single source of truth for UI-level auth state in this app.
  const { user: currentUser } = useAuthStore()

  const cartQuantity = product ? getItemQuantity(product.id) : 0

  // (StarSVG removed; ReviewSummary handles rating visuals)

  // Locally typed Supabase client for targeted tables to avoid never types
  type LocalDB = {
    public: {
      Tables: {
        review_reports: {
          Row: {
            id: string
            user_id: string
            review_id: string
            reason: string
            description: string | null
            created_at: string
          }
          Insert: {
            user_id: string
            review_id: string
            reason: string
            description?: string | null
          }
          Update: {
            user_id?: string
            review_id?: string
            reason?: string
            description?: string | null
          }
          Relationships: []
        }
      }
  Views: Record<string, never>
  Functions: Record<string, never>
  Enums: Record<string, never>
  CompositeTypes: Record<string, never>
    }
  }
  const db = supabase as unknown as SupabaseClient<LocalDB>

  useEffect(() => {
    async function fetchProduct() {
      if (!params.id) return
      try {
        // جلب كل المنتجات من الكاش
        const allProducts = await getCachedProducts()
        const productData = allProducts.find(p => p.id == params.id)
        if (!productData) throw new Error("المنتج غير موجود")

        // Get the subcategory and category
        let subcategoryData: (SubCategory & { category?: Category }) | null = null
        if (productData.subcategory_id) {
          const { data: subcategoryRaw, error: subcategoryError } = await supabase
            .from("subcategories")
            .select("*")
            .eq("id", productData.subcategory_id)
            .single()

          const subcategory = (subcategoryRaw as unknown as SubCategory | null)

          if (!subcategoryError && subcategory) {
            // Get the category
            const { data: categoryRaw, error: categoryError } = await supabase
              .from("categories")
              .select("*")
              .eq("id", subcategory.category_id)
              .single()

            subcategoryData = {
              ...subcategory,
              category: categoryError ? undefined : (categoryRaw as unknown as Category | undefined),
            }
          }
        }

        const fullProduct = {
          ...productData,
          subcategory: subcategoryData || undefined,
        } as Product

        setProduct(fullProduct as Product)

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

  const fetchReviews = useCallback(async () => {
    if (!product) return
    setReviewsLoading(true)
    try {
      let query = supabase
        .from('product_reviews')
        .select(`
          id, user_id, rating, comment, created_at,
          store_reply, store_reply_at, 
          helpful_count, not_helpful_count,
          is_verified_purchase, is_featured,
          users!user_id(name, phone)
        `)
        .eq('product_id', product.id)
        .eq('is_approved', true)

      console.log('Review query:', query)

      // Apply filters
      if (reviewFilter.rating) {
        query = query.eq('rating', reviewFilter.rating)
      }
      
      if (reviewFilter.verified !== undefined) {
        query = query.eq('is_verified_purchase', reviewFilter.verified)
      }

      // Apply sorting
      switch (reviewFilter.sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'highest':
          query = query.order('rating', { ascending: false })
          break
        case 'lowest':
          query = query.order('rating', { ascending: true })
          break
        case 'helpful':
          query = query.order('helpful_count', { ascending: false })
          break
        default: // newest
          query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

      console.log('Reviews data:', data)
      console.log('Reviews error:', error)

      if (error) throw error

      // Transform data to match component expectations
  const rows: ReviewRow[] = ((data ?? []) as unknown as ReviewRow[])
  const transformedReviews: DisplayReview[] = rows.map((review: ReviewRow) => ({
        ...review,
        user: {
          name: review.users?.name || 'مستخدم',
          avatar: undefined
        },
        helpful_count: review.helpful_count || 0,
        not_helpful_count: review.not_helpful_count || 0,
        store_reply: review.store_reply || undefined,
        store_reply_at: review.store_reply_at || undefined,
        is_verified_purchase: !!review.is_verified_purchase,
        is_featured: !!review.is_featured
      }))

      setReviews(transformedReviews)
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setReviewsLoading(false)
    }
  }, [product, reviewFilter.rating, reviewFilter.sortBy, reviewFilter.verified])

  useEffect(() => {
    // fetch approved reviews for this product
    fetchReviews()
  }, [fetchReviews])

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
      <Head>
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://perfecto.example.com"}/product/${product.id}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              description: product.description,
              image: productImages,
              sku: product.id,
              brand: { '@type': 'Brand', name: 'Perfecto' },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'EGP',
                price: product.price,
                availability: `https://schema.org/${product.is_available ? 'InStock' : 'OutOfStock'}`,
                url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://perfecto.example.com'}/product/${product.id}`,
              },
            }),
          }}
        />
      </Head>
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

        {/* Reviews Section */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">آراء العملاء</h2>
          
          {/* Review Summary and Filters */}
          <div className="mb-8">
            <ReviewSummary 
              productId={product.id} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reviews Display */}
            <div className="lg:col-span-2">
              {reviewsLoading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-2/5" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-gray-600">لا توجد مراجعات حتى الآن.</div>
              ) : (
                <EnhancedReviewDisplay 
                  reviews={reviews}
                  currentUserId={currentUser?.id}
                  onHelpfulClick={async (reviewId, helpful) => {
                    if (!currentUser) {
                      setShowLoginModal(true)
                      return
                    }
                    
                    try {
                      // استخدم API統 واحد للتصويت مع التعرّف على المستخدم من الهيدر
                      const { data: sessionData } = await supabase.auth.getSession()
                      const token = sessionData.session?.access_token
                      
                      const res = await fetch('/api/reviews/vote', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
              'x-user-id': currentUser.id,
              ...(token ? { 'authorization': `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({ reviewId, voteType: helpful ? 'helpful' : 'not_helpful' })
                      })
                      const data = await res.json()
                      if (!res.ok || !data.success) {
                        throw new Error(data?.error || 'Vote failed')
                      }

                      // تحديث تفاؤلي للأعداد ثم إعادة الجلب لضمان التزامن
                      setReviews(prev => prev.map(r => r.id === reviewId ? {
                        ...r,
                        helpful_count: data.stats?.helpful_count ?? r.helpful_count,
                        not_helpful_count: data.stats?.not_helpful_count ?? r.not_helpful_count,
                      } : r))

                      toast({
                        title: "شكراً لك",
                        description: helpful ? "تم تسجيل تصويتك كمفيد" : "تم تسجيل تصويتك كغير مفيد"
                      })

                      fetchReviews()
                    } catch (error) {
                      console.error('Error voting on review:', error)
                      toast({
                        title: "خطأ",
                        description: "فشل في تسجيل التصويت",
                        variant: "destructive"
                      })
                    }
                  }}
                  onReportClick={async (reviewId) => {
                    if (!currentUser) {
                      setShowLoginModal(true)
                      return
                    }
                    
                    try {
                      const { error } = await db
                        .from('review_reports')
                        .insert([
                          {
                            user_id: currentUser.id,
                            review_id: reviewId,
                            reason: 'inappropriate_content',
                            description: 'تم الإبلاغ عن محتوى غير مناسب'
                          }
                        ])
                      
                      if (error) throw error
                      
                      toast({
                        title: "تم الإبلاغ",
                        description: "شكراً لك، سنراجع المراجعة قريباً"
                      })
                    } catch (error) {
                      console.error('Error reporting review:', error)
                      toast({
                        title: "خطأ",
                        description: "فشل في إرسال البلاغ",
                        variant: "destructive"
                      })
                    }
                  }}
                />
              )}
            </div>

            {/* Review Form */}
            <aside className="lg:col-span-1">
              {!currentUser ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                  <h3 className="font-semibold text-lg mb-3">اكتب مراجعتك</h3>
                  <p className="text-gray-600 mb-4">يجب أن تكون مسجلاً لتترك مراجعة</p>
                  <Button onClick={() => setShowLoginModal(true)} className="w-full">
                    تسجيل الدخول
                  </Button>
                </div>
              ) : (
                <EnhancedReviewForm
                  productId={product.id}
                  userId={currentUser.id}
                  onReviewSubmitted={fetchReviews}
                />
              )}
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
