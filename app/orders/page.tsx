"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import type { Order } from "@/lib/types"
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react"
import Link from "next/link"

const OrdersPage = () => {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router])

  const fetchOrders = async () => {
    if (!user) return

    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setOrders(ordersData || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4" />
      case "PREPARING":
        return <Package className="h-4 w-4" />
      case "OUT_FOR_DELIVERY":
        return <Truck className="h-4 w-4" />
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4" />
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { label: "قيد المراجعة", color: "bg-yellow-500" },
      CONFIRMED: { label: "مؤكد", color: "bg-blue-500" },
      PREPARING: { label: "قيد التحضير", color: "bg-orange-500" },
      OUT_FOR_DELIVERY: { label: "في الطريق", color: "bg-purple-500" },
      DELIVERED: { label: "تم التوصيل", color: "bg-green-500" },
      CANCELLED: { label: "ملغي", color: "bg-red-500" },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, color: "bg-gray-500" }

    return (
      <Badge className={`${statusInfo.color} text-white flex items-center gap-1`}>
        {getStatusIcon(status)}
        {statusInfo.label}
      </Badge>
    )
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">طلباتي</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-24 w-24 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-4">لا توجد طلبات</h2>
          <p className="text-black mb-8">لم تقم بإنشاء أي طلبات بعد</p>
          <Link href="/categories">
            <Button className="bg-green-600 hover:bg-green-700">تصفح المنتجات</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-black">طلب #{order.order_number}</CardTitle>
                    <p className="text-sm text-black">{new Date(order.created_at).toLocaleDateString("ar-EG")}</p>
                  </div>
                  <div className="text-left">
                    {getStatusBadge(order.status)}
                    <p className="text-lg font-bold mt-2 text-black">{order.final_amount.toFixed(2)} ج.م</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-black">المنتجات:</h4>
                    <div className="space-y-2">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-black">{item.product_name}</span>
                          <span className="text-black">
                            {item.quantity} × {item.product_price} ج.م = {item.total_price} ج.م
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-black">المجموع الفرعي:</span>
                        <span className="float-left text-black">{order.subtotal.toFixed(2)} ج.م</span>
                      </div>
                      <div>
                        <span className="text-black">رسوم التوصيل:</span>
                        <span className="float-left text-black">
                          {order.shipping_fee === 0 ? "مجاني" : `${order.shipping_fee} ج.م`}
                        </span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div>
                          <span className="text-black">الخصم:</span>
                          <span className="float-left text-green-600">-{order.discount_amount} ج.م</span>
                        </div>
                      )}
                      {order.points_earned > 0 && (
                        <div>
                          <span className="text-black">النقاط المكتسبة:</span>
                          <span className="float-left text-green-600">{order.points_earned} نقطة</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-black">
                      <p className="text-black">العنوان: {order.delivery_address}</p>
                      {order.delivery_notes && <p className="text-black">ملاحظات: {order.delivery_notes}</p>}
                    </div>
                    <Link href={`/order-confirmation/${order.id}`}>
                      <Button variant="outline" size="sm">
                        عرض التفاصيل
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
