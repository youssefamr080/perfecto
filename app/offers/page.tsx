"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { Coupon, Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { Gift, Percent, Clock, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OffersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch active coupons
      const { data: couponsData, error: couponsError } = await supabase
        .from("coupons")
        .select("*")
        .eq("is_active", true)
        .gte("valid_until", new Date().toISOString())
        .order("created_at", { ascending: false })

      if (couponsError) throw couponsError

      // Fetch featured products (on sale)
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .not("original_price", "is", null)
        .limit(8)

      if (productsError) throw productsError

      setCoupons(couponsData || [])
      setFeaturedProducts(productsData || [])
    } catch (error) {
      console.error("Error fetching offers:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "تم النسخ!",
      description: `تم نسخ كود الكوبون: ${code}`,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateDiscount = (product: Product) => {
    if (!product.original_price) return 0
    return Math.round(((product.original_price - product.price) / product.original_price) * 100)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">العروض والخصومات</h1>

      {/* Active Coupons */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Gift className="h-6 w-6 text-green-600" />
          كوبونات الخصم المتاحة
        </h2>

        {coupons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Gift className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-black">لا توجد كوبونات متاحة حالياً</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-green-800">{coupon.title}</CardTitle>
                      <p className="text-sm text-green-600 mt-1">{coupon.description}</p>
                    </div>
                    <Badge className="bg-green-600">
                      {coupon.discount_type === "PERCENTAGE" ? (
                        <>
                          <Percent className="h-3 w-3 mr-1" />
                          {coupon.discount_value}%
                        </>
                      ) : (
                        <>{coupon.discount_value} ج.م</>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-dashed border-green-300">
                      <code className="font-mono font-bold text-lg text-green-700">{coupon.code}</code>
                      <Button size="sm" variant="ghost" onClick={() => copyCouponCode(coupon.code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-sm text-black space-y-1">
                      <p>الحد الأدنى للطلب: {coupon.min_order_amount} ج.م</p>
                      {coupon.max_discount_amount && <p>الحد الأقصى للخصم: {coupon.max_discount_amount} ج.م</p>}
                      {coupon.usage_limit && (
                        <p>
                          الاستخدام: {coupon.used_count} / {coupon.usage_limit}
                        </p>
                      )}
                      {coupon.valid_until && (
                        <p className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          صالح حتى: {formatDate(coupon.valid_until)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Sale Products */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Percent className="h-6 w-6 text-red-600" />
          منتجات بخصومات خاصة
        </h2>

        {featuredProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Percent className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-black">لا توجد منتجات بخصومات حالياً</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                {product.original_price && (
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    خصم {calculateDiscount(product)}%
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Loyalty Program Info */}
      <section className="mt-12">
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800 flex items-center gap-2">
              <Gift className="h-6 w-6" />
              برنامج نقاط الولاء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">1 ج.م = 1 نقطة</div>
                <p className="text-sm text-black">اكسب نقاط مع كل عملية شراء</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">100 نقطة = 1 ج.م</div>
                <p className="text-sm text-black">استبدل نقاطك بخصومات</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">2000 نقطة</div>
                <p className="text-sm text-black">توصيل مجاني</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
