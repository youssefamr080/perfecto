"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { Percent } from "lucide-react"
import { cacheManager } from "@/lib/utils/cache-manager"

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOffers = async () => {
      // التحقق من الكاش أولاً
      const cached = cacheManager.get<Product[]>('offers_products')
      if (cached) {
        setProducts(cached)
        setLoading(false)
        return
      }

      // جلب البيانات من قاعدة البيانات
      await fetchProducts()
    }

    loadOffers()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .not("original_price", "is", null)
        .order("created_at", { ascending: false })
      if (error) throw error
      
      const offersData = data || []
      setProducts(offersData)
      
      // حفظ في الكاش لمدة 30 دقيقة
      cacheManager.set('offers_products', offersData, 30 * 60 * 1000)
    } catch (error) {
      console.error("Error fetching discounted products:", error)
    } finally {
      setLoading(false)
    }
  }

  // خصم ثابت لجميع المنتجات
  const FIXED_DISCOUNT = 20
  const calculateDiscount = () => FIXED_DISCOUNT

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
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">المنتجات المخفضة</h1>
      {products.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Percent className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-black">لا توجد منتجات بخصومات حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
