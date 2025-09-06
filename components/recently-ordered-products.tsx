"use client"

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/lib/types'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import { Button } from '@/components/ui/button'
import { User, Plus } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/stores/cart-store'
import { useToast } from '@/hooks/use-toast'
import { LoginModal } from '@/components/auth/login-modal'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'

interface RecentlyOrderedProductsProps {
  userId?: string
  isLoggedIn: boolean
}

export function RecentlyOrderedProducts({ userId, isLoggedIn }: RecentlyOrderedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { addItem } = useCartStore()
  const { toast } = useToast()

  const fetchRecentlyOrderedProducts = useCallback(async () => {
    if (!userId) return
    
    try {
      setLoading(true)
      
      // جلب آخر طلبات المستخدم أولاً
      const { data: userOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10) // آخر 10 طلبات

      if (ordersError) {
        console.error('خطأ في جلب الطلبات:', ordersError)
        return
      }

      if (!userOrders || userOrders.length === 0) {
        setProducts([])
        return
      }

      // استخراج معرفات الطلبات
  type OrderIdRow = { id: string }
  const orderIds = (userOrders as OrderIdRow[]).map((order) => order.id)

      // جلب المنتجات من هذه الطلبات
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          product_id,
          product:products(*)
        `)
        .in('order_id', orderIds)
        .order('created_at', { ascending: false })

      if (itemsError) {
        console.error('خطأ في جلب عناصر الطلبات:', itemsError)
        return
      }

      if (orderItems) {
        // استخراج المنتجات الفريدة
        const uniqueProducts = new Map<string, Product>()
        const rows = (orderItems as unknown as Array<{ product_id?: unknown; product?: unknown }>).
          map((it) => ({
            product_id: typeof it.product_id === 'string' ? it.product_id : String(it.product_id ?? ''),
            product: (it.product && typeof it.product === 'object') ? (it.product as Product) : null,
          }))
        rows.forEach((item) => {
          if (item.product && item.product_id && !uniqueProducts.has(item.product_id)) {
            uniqueProducts.set(item.product_id, item.product)
          }
        })

  // تحويل إلى مصفوفة وأخذ أول 8 منتجات
  const uniqueProductsArray = Array.from(uniqueProducts.values()).slice(0, 8)
        setProducts(uniqueProductsArray)
      }
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchRecentlyOrderedProducts()
    } else {
      setLoading(false)
    }
  }, [userId, isLoggedIn, fetchRecentlyOrderedProducts])

  const handleAddToCart = (product: Product) => {
    if (!product.is_available || product.stock_quantity < 1) {
      toast({
        title: "المنتج غير متوفر",
        description: "هذا المنتج غير متوفر حالياً",
        variant: "destructive",
      })
      return
    }

    addItem(product, 1)
    toast({
      title: "تم إضافة المنتج",
      description: `تم إضافة ${product.name} إلى السلة`,
      variant: "default",
    })
  }

  // إذا لم يكن مسجل دخول، إظهار زر تسجيل الدخول
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-red-50 to-purple-50 rounded-xl p-6 text-center border border-red-100">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            سجل دخول لترى آخر المنتجات
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            احفظ وقتك واطلب منتجاتك المفضلة بسهولة
          </p>
          
          <Button 
            onClick={() => setShowLoginModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            سجل دخول
          </Button>
          
          <LoginModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)} 
          />
        </div>
      </div>
    )
  }

  // إذا كان يحمل البيانات
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          منتجات طلبتها مؤخراً
        </h3>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-32 animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32 mb-2"></div>
              <div className="bg-gray-200 rounded h-3 mb-1"></div>
              <div className="bg-gray-200 rounded h-3 w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // إذا لم توجد منتجات
  if (products.length === 0) {
    return null // لا نعرض شيئاً إذا لم توجد منتجات
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          منتجات طلبتها مؤخراً
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {products.length} منتج
        </span>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={12}
        slidesPerView={2.2}
        navigation={false}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 3.5,
          },
          768: {
            slidesPerView: 4.5,
          },
          1024: {
            slidesPerView: 6,
          },
        }}
        className="recently-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="relative">
                <Link href={`/product/${product.id}`}>
                  <div className="relative aspect-square rounded-t-lg overflow-hidden bg-gray-50">
                    <Image
                      src={product.images?.[0] || '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      loading="lazy"
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 20vw"
                    />
                    {!product.is_available && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">غير متوفر</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>

              <div className="p-3">
                <Link href={`/product/${product.id}`}>
                  <h4 className="font-medium text-sm text-gray-800 line-clamp-2 mb-2 hover:text-red-600 transition-colors">
                    {product.name}
                  </h4>
                </Link>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-red-600">
                      {product.price.toFixed(0)} ج.م
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.unit_description}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.is_available || product.stock_quantity < 1}
                    className="w-8 h-8 p-0 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 rounded-full"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx>{`
        .recently-swiper {
          padding: 0 4px;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
