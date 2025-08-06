"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search,
  RefreshCw,
  Clock,
  Truck,
  Ban,
  DollarSign,
  User,
  Calendar,
  ArrowLeft,
  Shield,
  BarChart3
} from 'lucide-react'
import { handleOrderCancellation } from '@/lib/utils/loyaltyProtection'
import { supabase } from '@/lib/supabase'

interface Order {
  id: string
  order_number: string
  user_id: string
  status: string
  final_amount: number
  points_used: number
  points_earned: number
  points_discount: number
  created_at: string
  delivery_address: string
  delivery_notes?: string
  users?: {
    name: string
    phone: string
    loyalty_points: number
  }
  order_items?: Array<{
    product_name: string
    quantity: number
    product_price: number
    total_price: number
  }>
}

const STATUS_COLORS = {
  'PENDING': 'bg-yellow-100 text-yellow-800',
  'CONFIRMED': 'bg-blue-100 text-blue-800', 
  'PREPARING': 'bg-purple-100 text-purple-800',
  'OUT_FOR_DELIVERY': 'bg-orange-100 text-orange-800',
  'DELIVERED': 'bg-green-100 text-green-800',
  'CANCELLED': 'bg-red-100 text-red-800'
}

const STATUS_ICONS = {
  'PENDING': Clock,
  'CONFIRMED': CheckCircle,
  'PREPARING': Package,
  'OUT_FOR_DELIVERY': Truck,
  'DELIVERED': CheckCircle,
  'CANCELLED': XCircle
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [cancelLoading, setCancelLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users:user_id (name, phone, loyalty_points),
          order_items (product_name, quantity, product_price, total_price)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      toast({
        title: "خطأ",
        description: "فشل في جلب الطلبات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelOrder = async (order: Order) => {
    const confirmMessage = `هل أنت متأكد من إلغاء الطلب ${order.order_number}؟

تفاصيل العقوبة:
- سيتم إرجاع ${order.points_used} نقطة مستخدمة
- سيتم خصم ${order.points_earned} نقطة مكتسبة
- عقوبة إضافية: ${order.final_amount > 200 ? '50' : order.final_amount > 100 ? '25' : '10'} نقطة

المجموع المخصوم: ${order.points_earned + (order.final_amount > 200 ? 50 : order.final_amount > 100 ? 25 : 10)} نقطة`

    if (!confirm(confirmMessage)) return

    setCancelLoading(order.id)
    try {
      const result = await handleOrderCancellation(order.id)
      
      if (result.success) {
        toast({
          title: "تم إلغاء الطلب بنجاح",
          description: `خصم عقوبة: ${result.points_deducted} نقطة | إرجاع: ${result.points_refunded} نقطة`,
          variant: "default",
        })
        
        // تحديث القائمة
        await loadOrders()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast({
        title: "خطأ في الإلغاء",
        description: error instanceof Error ? error.message : "فشل في إلغاء الطلب",
        variant: "destructive",
      })
    } finally {
      setCancelLoading(null)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) throw error

      toast({
        title: "تم تحديث الحالة",
        description: `تم تغيير حالة الطلب إلى ${newStatus}`,
        variant: "default",
      })

      await loadOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة الطلب",
        variant: "destructive",
      })
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.users?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.users?.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    const Icon = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || Clock
    return Icon
  }

  const calculatePenalty = (order: Order) => {
    const earnedPenalty = order.points_earned || 0
    const additionalPenalty = order.final_amount > 200 ? 50 : order.final_amount > 100 ? 25 : 10
    return earnedPenalty + additionalPenalty
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            إدارة الطلبات
          </h1>
          <p className="text-gray-600">إدارة الطلبات مع نظام حماية نقاط الولاء</p>
        </div>

        {/* شريط التنقل السريع */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => window.location.href = '/admin'}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  العودة للوحة الرئيسية
                </Button>
                
                <div className="h-6 w-px bg-blue-300 hidden md:block"></div>
                
                <Button
                  onClick={() => window.location.href = '/admin/loyalty'}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-yellow-50 border-yellow-300 text-yellow-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  إدارة نقاط الولاء
                </Button>
                
                <Button
                  onClick={() => window.location.href = '/loyalty/history'}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-green-50 border-green-300 text-green-700"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  تاريخ النقاط
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="البحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="PENDING">في الانتظار</option>
                <option value="CONFIRMED">مؤكد</option>
                <option value="PREPARING">قيد التحضير</option>
                <option value="OUT_FOR_DELIVERY">في الطريق</option>
                <option value="DELIVERED">تم التسليم</option>
                <option value="CANCELLED">ملغى</option>
              </select>
              <Button onClick={loadOrders} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status)
            const penaltyPoints = calculatePenalty(order)
            
            return (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{order.order_number}</h3>
                        <Badge className={STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {order.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{order.users?.name} - {order.users?.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>{order.final_amount} ج.م</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600 mb-1">
                        {order.users?.loyalty_points || 0} نقطة
                      </div>
                      <div className="text-xs text-gray-500">رصيد العميل</div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium">نقاط مستخدمة</div>
                      <div className="text-lg font-bold text-blue-800">{order.points_used || 0}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-green-600 font-medium">نقاط مكتسبة</div>
                      <div className="text-lg font-bold text-green-800">{order.points_earned || 0}</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-xs text-purple-600 font-medium">خصم النقاط</div>
                      <div className="text-lg font-bold text-purple-800">{order.points_discount || 0} ج.م</div>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-xs text-red-600 font-medium">عقوبة الإلغاء</div>
                      <div className="text-lg font-bold text-red-800">{penaltyPoints} نقطة</div>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">منتجات الطلب:</h4>
                      <div className="space-y-1">
                        {order.order_items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm text-gray-600">
                            <span>{item.product_name} (x{item.quantity})</span>
                            <span>{item.total_price} ج.م</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-600 font-medium mb-1">عنوان التسليم:</div>
                    <div className="text-sm">{order.delivery_address}</div>
                    {order.delivery_notes && (
                      <div className="text-xs text-gray-500 mt-1">ملاحظات: {order.delivery_notes}</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                      <>
                        {order.status === 'PENDING' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            تأكيد الطلب
                          </Button>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            بدء التحضير
                          </Button>
                        )}
                        {order.status === 'PREPARING' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            خروج للتوصيل
                          </Button>
                        )}
                        {order.status === 'OUT_FOR_DELIVERY' && (
                          <Button
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            تم التسليم
                          </Button>
                        )}
                        <Button
                          onClick={() => cancelOrder(order)}
                          disabled={cancelLoading === order.id}
                          size="sm"
                          variant="destructive"
                        >
                          {cancelLoading === order.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Ban className="h-4 w-4 mr-1" />
                          )}
                          إلغاء الطلب
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredOrders.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
              <p className="text-gray-600">لم يتم العثور على طلبات تطابق معايير البحث</p>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600 mt-2">جاري تحميل الطلبات...</p>
          </div>
        )}
      </div>
    </div>
  )
}
