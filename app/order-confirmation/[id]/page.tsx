"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/types"
import { supabase } from "@/lib/supabase"

export default function OrderConfirmationPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      if (!params.id) return

      // Get the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single()

      if (orderError) {
        console.error("Error fetching order:", orderError)
        setLoading(false)
        return
      }

      // Get the user
      const { data: userData } = await supabase.from("users").select("*").eq("id", orderData.user_id).single()

      // Get order items
      const { data: orderItems } = await supabase.from("order_items").select("*").eq("order_id", orderData.id)

      // Get products for order items
      const productIds = orderItems?.map((item) => item.product_id) || []
      const { data: products } = await supabase.from("products").select("*").in("id", productIds)

      // Combine the data
      const orderWithDetails = {
        ...orderData,
        user: userData,
        order_items: orderItems?.map((item) => ({
          ...item,
          product: products?.find((product) => product.id === item.product_id),
        })),
      }

      setOrder(orderWithDetails)
      setLoading(false)
    }

    fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-600">الطلب غير موجود</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-600 mb-2">تم إنشاء طلبك بنجاح!</h1>
          <p className="text-gray-600">
            رقم الطلب: <span className="font-semibold">#{order.id.slice(-8)}</span>
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>تفاصيل الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>حالة الطلب:</span>
              <Badge className="bg-yellow-500">{order.status === "PENDING" ? "قيد المراجعة" : order.status}</Badge>
            </div>

            <div className="flex justify-between">
              <span>تاريخ الطلب:</span>
              <span>{new Date(order.created_at).toLocaleDateString("ar-EG")}</span>
            </div>

            <div className="flex justify-between">
              <span>عنوان التوصيل:</span>
              <span className="text-right max-w-xs">{order.delivery_address}</span>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{order.subtotal.toFixed(2)} ج.م</span>
              </div>

              <div className="flex justify-between">
                <span>رسوم التوصيل:</span>
                <span className={order.shipping_fee === 0 ? "text-green-600" : ""}>
                  {order.shipping_fee === 0 ? "مجاني" : `${order.shipping_fee} ج.م`}
                </span>
              </div>

              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>خصم النقاط:</span>
                  <span>-{order.discount_amount} ج.م</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>المجموع الكلي:</span>
                <span>{order.final_amount.toFixed(2)} ج.م</span>
              </div>
            </div>

            {order.points_earned > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-700 font-semibold">🎉 لقد حصلت على {order.points_earned} نقطة ولاء!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>الخطوات التالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-600">
              <p>• سيتم التواصل معك خلال 30 دقيقة لتأكيد الطلب</p>
              <p>• سيتم تحضير طلبك وتوصيله في نفس اليوم</p>
              <p>• يمكنك الدفع عند الاستلام</p>
              <p>• في حالة وجود أي استفسار، يرجى الاتصال بنا</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              العودة للرئيسية
            </Button>
          </Link>
          <Link href="/categories" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700">متابعة التسوق</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
