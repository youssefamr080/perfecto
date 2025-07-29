"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Order, User, Product } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Package, Users, ShoppingBag, TrendingUp, Clock, CheckCircle, XCircle, Truck, Shield, Lock } from "lucide-react"

// رقم الهاتف الخاص بالأدمن - يمكنك تغييره
const ADMIN_PHONE = "01234567890"

export default function AdminPage() {
  const { state: authState } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // التحقق من صلاحية الوصول
    if (!authState.isAuthenticated) {
      router.push("/")
      return
    }

    if (authState.user?.phone !== ADMIN_PHONE) {
      toast({
        title: "غير مصرح لك",
        description: "ليس لديك صلاحية للوصول لهذه الصفحة",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    setIsAuthorized(true)
    fetchData()
  }, [authState, router])

  const fetchData = async () => {
    try {
      // Fetch orders with user and items data
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          user:users(*),
          order_items(
            *,
            product:products(*)
          )
        `)
        .order("created_at", { ascending: false })

      if (ordersError) throw ordersError

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (productsError) throw productsError

      setOrders(ordersData || [])
      setUsers(usersData || [])
      setProducts(productsData || [])

      // Calculate stats
      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.final_amount, 0) || 0
      const pendingOrders = ordersData?.filter((order) => order.status === "PENDING").length || 0

      setStats({
        totalOrders: ordersData?.length || 0,
        totalUsers: usersData?.length || 0,
        totalRevenue,
        pendingOrders,
      })
    } catch (error) {
      console.error("Error fetching admin data:", error)
      toast({
        title: "خطأ",
        description: "لم نتمكن من تحميل البيانات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      // Update local state
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus as Order["status"] } : order)))

      // Create notification for user
      const order = orders.find((o) => o.id === orderId)
      if (order) {
        const statusMessages = {
          CONFIRMED: "تم تأكيد طلبك وسيتم تحضيره قريباً",
          PREPARING: "جاري تحضير طلبك",
          OUT_FOR_DELIVERY: "طلبك في الطريق إليك",
          DELIVERED: "تم توصيل طلبك بنجاح",
          CANCELLED: "تم إلغاء طلبك",
        }

        await supabase.from("notifications").insert({
          user_id: order.user_id,
          title: "تحديث حالة الطلب",
          message: statusMessages[newStatus as keyof typeof statusMessages] || `تم تحديث حالة طلبك إلى ${newStatus}`,
          type: "ORDER_UPDATE",
          data: { order_id: orderId, order_number: order.order_number },
        })
      }

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الطلب بنجاح",
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "خطأ",
        description: "لم نتمكن من تحديث حالة الطلب",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { label: "قيد المراجعة", color: "bg-yellow-500", icon: Clock },
      CONFIRMED: { label: "مؤكد", color: "bg-blue-500", icon: CheckCircle },
      PREPARING: { label: "قيد التحضير", color: "bg-orange-500", icon: Package },
      OUT_FOR_DELIVERY: { label: "في الطريق", color: "bg-purple-500", icon: Truck },
      DELIVERED: { label: "تم التوصيل", color: "bg-red-500", icon: CheckCircle },
      CANCELLED: { label: "ملغي", color: "bg-gray-500", icon: XCircle },
    }

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      color: "bg-gray-500",
      icon: Clock,
    }
    const Icon = statusInfo.icon

    return (
      <Badge className={`${statusInfo.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    )
  }

  // عرض شاشة التحميل أو عدم الصلاحية
  if (!authState.isAuthenticated || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">صفحة محمية</h1>
          <p className="text-gray-600 mb-6">هذه الصفحة مخصصة للإدارة فقط</p>
          <div className="flex items-center justify-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">مصرح للأدمن فقط</span>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8" />
          <h1 className="text-3xl font-bold">لوحة التحكم الإدارية</h1>
        </div>
        <p className="text-red-100">مرحباً {authState.user?.name} - أدمن النظام</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-red-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingBag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalRevenue.toFixed(2)} ج.م</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات معلقة</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="bg-red-50 border-red-200">
          <TabsTrigger value="orders" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            الطلبات
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            العملاء
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
            المنتجات
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-red-100 shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">طلب #{order.order_number}</CardTitle>
                    <p className="text-gray-600">
                      {order.user?.name} - {order.user?.phone}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString("ar-EG")}</p>
                  </div>
                  <div className="text-left">
                    {getStatusBadge(order.status)}
                    <p className="text-lg font-bold mt-2 text-red-600">{order.final_amount.toFixed(2)} ج.م</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">العنوان:</h4>
                    <p className="text-gray-600">{order.delivery_address}</p>
                    {order.delivery_notes && (
                      <p className="text-sm text-gray-500 mt-1">ملاحظات: {order.delivery_notes}</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">المنتجات:</h4>
                    <div className="space-y-2">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span>{item.product_name}</span>
                          <span>
                            {item.quantity} × {item.product_price} ج.م = {item.total_price} ج.م
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Select value={order.status} onValueChange={(value) => updateOrderStatus(order.id, value)}>
                      <SelectTrigger className="w-48 border-red-200 focus:border-red-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">قيد المراجعة</SelectItem>
                        <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                        <SelectItem value="PREPARING">قيد التحضير</SelectItem>
                        <SelectItem value="OUT_FOR_DELIVERY">في الطريق</SelectItem>
                        <SelectItem value="DELIVERED">تم التوصيل</SelectItem>
                        <SelectItem value="CANCELLED">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا توجد طلبات حالياً</p>
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
              <Card key={user.id} className="border-red-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>نقاط الولاء:</span>
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        {user.loyalty_points}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي الطلبات:</span>
                      <span>{user.total_orders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي المبلغ:</span>
                      <span className="text-red-600 font-semibold">{(user.total_spent || 0).toFixed(2)} ج.م</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      انضم في: {new Date(user.created_at).toLocaleDateString("ar-EG")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا يوجد عملاء مسجلين</p>
            </div>
          )}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} className="border-red-100 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.is_available ? "default" : "secondary"} className="bg-red-600">
                      {product.is_available ? "متوفر" : "غير متوفر"}
                    </Badge>
                    {product.is_featured && <Badge className="bg-yellow-500">مميز</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>السعر:</span>
                      <span className="font-bold text-red-600">{product.price} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المخزون:</span>
                      <span>{product.stock_quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الوحدة:</span>
                      <span>{product.unit_description}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا توجد منتجات</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
