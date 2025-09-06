"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RealtimeOrders } from "@/components/admin/realtime-orders"
import { ReviewsManagement } from "@/components/admin/reviews-management"
import { ReviewNotifications } from "@/components/admin/review-notifications"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Order, User, Product } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { initializeSound, requestNotificationPermission, testSound, enableAudioByUserGesture, safePlayNotificationSound } from "@/lib/notification-sound"
import { 
  Package, Users, ShoppingBag, TrendingUp, Clock, CheckCircle, XCircle, 
  Shield, Lock, DollarSign, Eye, Trash2, Download, 
  BarChart3, Activity, RefreshCw, Volume2,
  Gift
} from "lucide-react"
import { formatDistance } from "date-fns"
import { ar } from "date-fns/locale"

// رقم الهاتف الخاص بالأدمن (غير مستخدم حالياً)
// const ADMIN_PHONE = "01234567890"

// مفاتيح الأمان الإضافية
const ADMIN_SECURITY_KEYS = [
  "01234567890", // رقم أساسي
  "01000000000", // رقم احتياطي
]

// التحقق من صلاحية الإدمن
const isAuthorizedAdmin = (phone: string | undefined): boolean => {
  if (!phone) return false
  return ADMIN_SECURITY_KEYS.includes(phone.trim())
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  type TopProductStat = { quantity: number; revenue: number; product: { name: string } }
  type AdminStats = {
    totalOrders: number
    totalUsers: number
    totalRevenue: number
    pendingOrders: number
    todayOrders: number
    monthlyRevenue: number
    topProducts: TopProductStat[]
    recentUsers: number
  }
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    todayOrders: 0,
    monthlyRevenue: 0,
    topProducts: [],
    recentUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [showNewOrderAlert, setShowNewOrderAlert] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }

    if (!isAuthorizedAdmin(user?.phone)) {
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
    
  // لا تهيئ الصوت تلقائياً؛ انتظر تفاعل المستخدم لتجنب قيود التشغيل التلقائي

    // تحديث تلقائي كل دقيقتين للبيانات
    const interval = setInterval(() => {
      console.log("تحديث تلقائي للبيانات...")
      fetchData()
    }, 120000) // 2 دقيقة

    return () => clearInterval(interval)
  }, [isAuthenticated, user, router, toast])

  // تهيئة الصوت والإشعارات
  const initializeNotifications = async () => {
    try {
      console.log('🎵 بدء تهيئة نظام الإشعارات...')
      
      const soundInitialized = await initializeSound()
      const notificationPermission = await requestNotificationPermission()
      
      setSoundEnabled(soundInitialized)
      
      if (soundInitialized && notificationPermission) {
        toast({
          title: "✅ تم تفعيل الإشعارات",
          description: "ستحصل على إشعار صوتي عند وصول طلبات جديدة",
          variant: "default",
        })
        
        // تشغيل صوت اختبار
        console.log('🧪 تشغيل صوت الاختبار...')
        setTimeout(async () => {
          await testSound()
        }, 1000)
        
      } else if (soundInitialized && !notificationPermission) {
        toast({
          title: "⚠️ تفعيل جزئي",
          description: "الصوت مفعل لكن إشعارات المتصفح غير مفعلة",
          variant: "default",
        })
        
        // تشغيل صوت اختبار رغم عدم تفعيل الإشعارات
        setTimeout(async () => {
          await testSound()
        }, 1000)
        
      } else {
        toast({
          title: "⚠️ تحذير",
          description: "لم يتم تفعيل الصوت بالكامل، تأكد من السماح للصوت والإشعارات",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("❌ خطأ في تهيئة الإشعارات:", error)
      toast({
        title: "❌ خطأ",
        description: "فشل في تهيئة نظام الإشعارات",
        variant: "destructive",
      })
    }
  }

  // إضافة طلب جديد للقائمة بدون إعادة تحميل الصفحة
  const handleNewOrder = (newOrder: Order) => {
    console.log("تم استلام طلب جديد في صفحة الإدارة:", newOrder)
    
    // تحقق من عدم وجود الطلب في القائمة الحالية
    const orderExists = orders.some(order => order.id === newOrder.id)
    if (!orderExists) {
      // إضافة الطلب للقائمة وتحديث الإحصائيات
      setOrders(prevOrders => [newOrder, ...prevOrders])
      
      // تحديث الإحصائيات
      setStats(prev => ({
        ...prev,
        totalOrders: prev.totalOrders + 1,
        pendingOrders: newOrder.status === "PENDING" ? prev.pendingOrders + 1 : prev.pendingOrders,
        totalRevenue: prev.totalRevenue + (newOrder.final_amount || 0),
        todayOrders: prev.todayOrders + 1,
      }))
      
      // إظهار تنبيه بوجود طلب جديد
  setShowNewOrderAlert(true)
  // تشغيل صوت الإشعار والإخطار في المتصفح (يتطلب تفاعل مستخدم مسبقاً)
  safePlayNotificationSound()
      // أرسل إشعار بريد إلكتروني للإدارة (غير محظور، تنفيذ بدون انتظار)
      try {
        fetch('/api/send-order-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: newOrder })
        }).catch(err => console.warn('Failed to request send-order-email', err))
      } catch (e) {
        console.warn('send-order-email call failed', e)
      }
  setTimeout(() => setShowNewOrderAlert(false), 10000)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // جلب الطلبات مع بيانات المستخدمين والمنتجات
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

      // جلب المستخدمين
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (usersError) throw usersError

      // جلب المنتجات
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (productsError) throw productsError

      setOrders(ordersData || [])
      setUsers(usersData || [])
      setProducts(productsData || [])

      // حساب الإحصائيات المتقدمة
      calculateAdvancedStats(ordersData || [], usersData || [], productsData || [])

      // تحديث وقت آخر تحديث
      setLastUpdated(new Date())

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

  const calculateAdvancedStats = (ordersData: Order[], usersData: User[], productsData: Product[]) => {
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.final_amount || 0), 0)
    const pendingOrders = ordersData.filter(order => order.status === "PENDING").length
    
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const todayOrders = ordersData.filter(order => 
      new Date(order.created_at) >= todayStart
    ).length
    
    const monthlyRevenue = ordersData
      .filter(order => new Date(order.created_at) >= monthStart)
      .reduce((sum, order) => sum + (order.final_amount || 0), 0)
    
    const recentUsers = usersData.filter(user => 
      new Date(user.created_at) >= weekAgo
    ).length
    
    // أكثر المنتجات مبيعاً
    const productSales = new Map<string, TopProductStat>()
    type OrderItemRow = {
      product_id: string
      product_name?: string | null
      product_price?: number | null
      price?: number | null
      quantity?: number | null
      total_price?: number | null
      product?: { name?: string | null }
    }
    ordersData.forEach(order => {
      order.order_items?.forEach((item: OrderItemRow) => {
        const productId = item.product_id
        const productName = item.product_name || item.product?.name || 'منتج محذوف'
        const currentSales = productSales.get(productId) || { 
          quantity: 0, 
          revenue: 0, 
          product: { name: productName }
        }
        productSales.set(productId, {
          quantity: currentSales.quantity + (item.quantity || 0),
          revenue: currentSales.revenue + (item.total_price || ((item.product_price || item.price || 0) * (item.quantity || 0))),
          product: { name: productName }
        })
      })
    })
    
    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    setStats({
      totalOrders: ordersData.length,
      totalUsers: usersData.length,
      totalRevenue,
      pendingOrders,
      todayOrders,
      monthlyRevenue,
      topProducts,
      recentUsers
    })
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('Updating order status:', { orderId, newStatus })
      
      // Use a direct update with minimal RLS interaction
  const { data, error } = await (supabase as unknown as any)
        .from("orders")
        .update({ 
          status: newStatus
        })
        .eq("id", orderId)
        .select('id, status')

      if (error) {
        console.error('Supabase error:', error)
        
        // Try alternative approach with upsert
  const { data: upsertData, error: upsertError } = await (supabase as unknown as any)
          .from("orders")
          .upsert({ 
            id: orderId,
            status: newStatus,
            updated_at: new Date().toISOString() 
          }, { 
            onConflict: 'id' 
          })
          .select('id, status')

        if (upsertError) {
          console.error('Upsert error:', upsertError)
          throw upsertError
        }
        
        console.log('Upsert successful:', upsertData)
      } else {
        console.log('Update successful:', data)
      }

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus as Order["status"] } : order
      ))

      toast({
        title: "✅ تم التحديث",
        description: `تم تحديث حالة الطلب إلى: ${getStatusLabel(newStatus)}`,
      })
  } catch (error: unknown) {
      console.error('Error updating order status:', error)
      toast({
        title: "❌ خطأ",
        description: `فشل في تحديث حالة الطلب. تحقق من الصلاحيات.`,
        variant: "destructive",
      })
    }
  }

  const toggleProductStatus = async (productId: string, isAvailable: boolean) => {
    try {
  const { error } = await (supabase as unknown as any)
        .from("products")
        .update({ is_available: !isAvailable })
        .eq("id", productId)

      if (error) throw error

      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, is_available: !isAvailable } : product
      ))

      toast({
        title: "تم التحديث",
        description: `تم ${!isAvailable ? 'تفعيل' : 'إلغاء'} المنتج`,
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث المنتج",
        variant: "destructive",
      })
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع طلباته أيضاً.")) {
      return
    }

    try {
  const { error } = await (supabase as unknown as any)
        .from("users")
        .delete()
        .eq("id", userId)

      if (error) throw error

      setUsers(prev => prev.filter(user => user.id !== userId))
      // إزالة طلبات هذا المستخدم من القائمة أيضاً
      setOrders(prev => prev.filter(order => order.user_id !== userId))

      toast({
        title: "تم الحذف",
        description: "تم حذف المستخدم وجميع طلباته بنجاح",
      })
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف المستخدم",
        variant: "destructive",
      })
    }
  }

  const exportData = (type: 'orders' | 'users' | 'products') => {
  let data: Array<Record<string, string | number>> = []
    let filename = ""
    
    switch (type) {
      case 'orders':
        data = orders.map(order => ({
          'رقم الطلب': order.order_number,
          'العميل': order.user?.name || 'غير محدد',
          'المبلغ': order.final_amount,
          'الحالة': getStatusLabel(order.status),
          'التاريخ': new Date(order.created_at).toLocaleDateString('ar-EG')
        }))
        filename = "orders.csv"
        break
      case 'users':
        data = users.map(user => ({
          'الاسم': user.name,
          'الهاتف': user.phone,
          'المدينة': user.city || '',
          'نقاط الولاء': user.loyalty_points,
          'إجمالي الطلبات': user.total_orders || 0,
          'تاريخ التسجيل': new Date(user.created_at).toLocaleDateString('ar-EG')
        }))
        filename = "users.csv"
        break
      case 'products':
        data = products.map(product => ({
          'اسم المنتج': product.name,
          'السعر': product.price,
          'المخزون': product.stock_quantity,
          'متوفر': product.is_available ? 'نعم' : 'لا',
          'مميز': product.is_featured ? 'نعم' : 'لا'
        }))
        filename = "products.csv"
        break
    }

    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      PENDING: "معلق",
      CONFIRMED: "مؤكد", 
      CANCELLED: "ملغي"
    }
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4 text-yellow-500" />
      case "CONFIRMED": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "CANCELLED": return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "ALL" || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (!isAuthenticated || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-96">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>الوصول محظور</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">ليس لديك صلاحية للوصول لهذه الصفحة</p>
            <Button onClick={() => router.push("/")} className="w-full">
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-8 w-8 text-red-600" />
              لوحة تحكم الإدارة
              {showNewOrderAlert && (
                <span className="animate-pulse text-green-500 font-bold text-base mr-3">
                  طلب جديد! قم بالتمرير لأعلى لرؤيته ✨
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-2">
              مرحباً بك {user?.name}
              {lastUpdated && (
                <span className="text-sm text-gray-500 block">
                  آخر تحديث: {new Date(lastUpdated).toLocaleTimeString('ar-EG')}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <ReviewNotifications />
            <div className="ml-3">
              <RealtimeOrders onNewOrder={handleNewOrder} />
            </div>
            <Button 
              onClick={async () => { enableAudioByUserGesture(); await initializeNotifications() }} 
              variant={soundEnabled ? "default" : "destructive"} 
              size="sm"
              title="تفعيل الصوت والإشعارات"
              className={soundEnabled ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              {soundEnabled ? "الصوت مفعل" : "تفعيل الصوت"}
            </Button>         
            <Button onClick={fetchData} variant="outline" size="sm" className="text-gray-900 border-gray-300 hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2 text-gray-700" />
              تحديث
            </Button>
          </div>
        </div>

        {/* أزرار التوجيه السريع */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            التوجيه السريع للإدارة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* إدارة نقاط الولاء */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Shield className="h-8 w-8 text-yellow-600" />
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                    نقاط الولاء
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">إدارة ومراقبة نقاط الولاء</h3>
                <p className="text-gray-600 text-sm mb-4">
                  تدقيق شامل، فحص النقاط، إصلاح المشاكل، ومراقبة المعاملات
                </p>
                <Button 
                  onClick={() => router.push('/admin/loyalty')}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-gray-900"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  انتقال إلى إدارة النقاط
                </Button>
              </CardContent>
            </Card>

            {/* إدارة الطلبات */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    الطلبات
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">إدارة الطلبات مع نظام العقوبات</h3>
                <p className="text-gray-600 text-sm mb-4">
                  متابعة الطلبات، تحديث الحالة، إلغاء مع عقوبات نقاط الولاء
                </p>
                <Button 
                  onClick={() => router.push('/admin/orders')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Package className="h-4 w-4 mr-2" />
                  انتقال إلى إدارة الطلبات
                </Button>
              </CardContent>
            </Card>

            {/* تاريخ النقاط للعملاء */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    تاريخ النقاط
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">تاريخ النقاط للعملاء</h3>
                <p className="text-gray-600 text-sm mb-4">
                  عرض مفصل لتاريخ معاملات النقاط وإحصائيات شاملة للعملاء
                </p>
                <Button 
                  onClick={() => router.push('/loyalty/history')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  انتقال إلى تاريخ النقاط
                </Button>
              </CardContent>
            </Card>

            {/* إدارة أكواد السفراء */}
            <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Gift className="h-8 w-8 text-purple-600" />
                  </div>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                    أكواد السفراء
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">إدارة أكواد السفراء</h3>
                <p className="text-gray-600 text-sm mb-4">
                  إنشاء أكواد خصم للسفراء، تتبع الاستخدام، وإدارة نظام الإحالة
                </p>
                <Button 
                  onClick={() => router.push('/admin/codes')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  انتقال إلى إدارة الأكواد
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                  <p className="text-blue-100 text-sm">اليوم: {stats.todayOrders}</p>
                </div>
                <ShoppingBag className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">إجمالي المبيعات</p>
                  <p className="text-3xl font-bold">{stats.totalRevenue.toFixed(2)} ج.م</p>
                  <p className="text-green-100 text-sm">هذا الشهر: {stats.monthlyRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">المستخدمون</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  <p className="text-purple-100 text-sm">جدد: {stats.recentUsers}</p>
                </div>
                <Users className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">طلبات معلقة</p>
                  <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                  <p className="text-orange-100 text-sm">تحتاج مراجعة</p>
                </div>
                <Clock className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100 border">
            <TabsTrigger value="orders" className="text-gray-900 data-[state=active]:text-red-600 data-[state=active]:bg-white data-[state=active]:shadow-sm">الطلبات</TabsTrigger>
            <TabsTrigger value="products" className="text-gray-900 data-[state=active]:text-red-600 data-[state=active]:bg-white data-[state=active]:shadow-sm">المنتجات</TabsTrigger>
            <TabsTrigger value="users" className="text-gray-900 data-[state=active]:text-red-600 data-[state=active]:bg-white data-[state=active]:shadow-sm">المستخدمون</TabsTrigger>
            <TabsTrigger value="reviews" className="text-gray-900 data-[state=active]:text-red-600 data-[state=active]:bg-white data-[state=active]:shadow-sm">المراجعات</TabsTrigger>
            <TabsTrigger value="analytics" className="text-gray-900 data-[state=active]:text-red-600 data-[state=active]:bg-white data-[state=active]:shadow-sm">التحليلات</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 font-bold">إدارة الطلبات</CardTitle>
                  <Button onClick={() => exportData('orders')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    تصدير
                  </Button>
                </div>
                
                {/* Filters */}
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <Input
                      placeholder="البحث في الطلبات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">جميع الحالات</SelectItem>
                      <SelectItem value="PENDING">معلق</SelectItem>
                      <SelectItem value="CONFIRMED">مؤكد</SelectItem>
                      <SelectItem value="PREPARING">قيد التحضير</SelectItem>
                      <SelectItem value="OUT_FOR_DELIVERY">في الطريق</SelectItem>
                      <SelectItem value="DELIVERED">تم التسليم</SelectItem>
                      <SelectItem value="CANCELLED">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="border">
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b">
                        <TableHead className="font-semibold text-gray-900 border-r">رقم الطلب</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">العميل</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">تفاصيل الطلب</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">المبلغ</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">الحالة</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">التاريخ</TableHead>
                        <TableHead className="font-semibold text-gray-900">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-gray-50 border-b">
                          <TableCell className="font-medium text-gray-900 border-r">
                            {order.order_number}
                          </TableCell>
                          <TableCell className="border-r">
                            <div>
                              <p className="font-medium text-gray-900">{order.user?.name || 'غير محدد'}</p>
                              <p className="text-sm text-gray-600">{order.user?.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell className="border-r">
                            <div className="text-center">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
                                    <Eye className="h-3 w-3 mr-1" />
                                    عرض الفاتورة
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>🧾 فاتورة الطلب: {order.order_number}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-blue-50 p-3 rounded border">
                                        <p className="font-semibold text-gray-900">🧑‍💼 العميل:</p>
                                        <p className="text-gray-800">{order.user?.name || 'غير محدد'}</p>
                                        <p className="text-sm text-gray-600">📞 {order.user?.phone || order.delivery_phone}</p>
                                        {order.delivery_address && (
                                          <p className="text-sm text-gray-600 mt-1">📍 {order.delivery_address}</p>
                                        )}
                                      </div>
                                      <div className="bg-orange-50 p-3 rounded border">
                                        <p className="font-semibold text-gray-900">📋 معلومات الطلب:</p>
                                        <div className="flex items-center gap-2">
                                          {getStatusIcon(order.status)}
                                          <span className="font-medium">{getStatusLabel(order.status)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">💳 {order.payment_method === 'CASH_ON_DELIVERY' ? 'دفع عند الاستلام' : order.payment_method}</p>
                                        {order.delivery_notes && (
                                          <p className="text-sm text-gray-600 mt-1">📝 {order.delivery_notes}</p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <p className="font-semibold text-gray-900 mb-2">📦 المنتجات المطلوبة:</p>
                                      <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {order.order_items?.map((item: { product?: { images?: string[] | null; name?: string | null; unit_description?: string | null }; product_name?: string | null; product_price?: number | null; price?: number | null; quantity?: number | null; total_price?: number | null }, index: number) => (
                                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                            <div className="flex items-center gap-3">
                                              {item.product?.images?.[0] && (
                                                <img 
                                                  src={item.product.images[0]} 
                                                  alt={item.product_name || item.product?.name || 'منتج'}
                                                  className="w-10 h-10 rounded object-cover"
                                                />
                                              )}
                                              <div>
                                                <p className="font-medium text-gray-900">
                                                  {item.product_name || item.product?.name || 'منتج محذوف'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                  {item.product?.unit_description || 'وحدة'}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-bold text-gray-900">
                                                الكمية: {item.quantity || 0}
                                              </p>
                                              <p className="text-green-600 font-medium">
                                                {(item.product_price || item.price || 0).toFixed(2)} ج.م × {item.quantity || 0} = {(item.total_price || ((item.product_price || item.price || 0) * (item.quantity || 0))).toFixed(2)} ج.م
                                              </p>
                                            </div>
                                          </div>
                                        )) || (
                                          <div className="text-center text-gray-500 p-4">
                                            لا توجد منتجات في هذا الطلب
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                      <div className="bg-green-50 p-4 rounded border space-y-2">
                                        <div className="flex justify-between text-sm text-gray-800">
                                          <span>المجموع الفرعي:</span>
                                          <span>{(order.subtotal || 0).toFixed(2)} ج.م</span>
                                        </div>
                                        {order.shipping_fee > 0 && (
                                          <div className="flex justify-between text-sm text-gray-800">
                                            <span>رسوم الشحن:</span>
                                            <span>{(order.shipping_fee || 0).toFixed(2)} ج.م</span>
                                          </div>
                                        )}
                                        {order.discount_amount > 0 && (
                                          <div className="flex justify-between text-sm text-red-600">
                                            <span>الخصم:</span>
                                            <span>-{(order.discount_amount || 0).toFixed(2)} ج.م</span>
                                          </div>
                                        )}
                                        {order.tax_amount > 0 && (
                                          <div className="flex justify-between text-sm text-gray-800">
                                            <span>الضرائب:</span>
                                            <span>{(order.tax_amount || 0).toFixed(2)} ج.م</span>
                                          </div>
                                        )}
                                        <hr className="my-2" />
                                        <div className="flex justify-between text-lg font-bold text-gray-900">
                                          <span>💰 المجموع الإجمالي:</span>
                                          <span className="text-green-600">{(order.final_amount || 0).toFixed(2)} ج.م</span>
                                        </div>
                                        {order.points_earned > 0 && (
                                          <div className="flex justify-between text-sm text-blue-600">
                                            <span>⭐ نقاط مكتسبة:</span>
                                            <span>{order.points_earned || 0} نقطة</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-gray-900 border-r">
                            {(order.final_amount || 0).toFixed(2)} ج.م
                          </TableCell>
                          <TableCell className="border-r">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(order.status)}
                              <span className="text-gray-900">{getStatusLabel(order.status)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 border-r">
                            {formatDistance(new Date(order.created_at), new Date(), { 
                              addSuffix: true, 
                              locale: ar 
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-32 bg-white border-gray-300 text-gray-900">
                                  <SelectValue className="text-gray-900" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="PENDING" className="text-yellow-700 hover:bg-yellow-50">⏳ معلق</SelectItem>
                                  <SelectItem value="CONFIRMED" className="text-green-700 hover:bg-green-50">✅ مؤكد</SelectItem>
                                  <SelectItem value="CANCELLED" className="text-red-700 hover:bg-red-50">❌ ملغي</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 font-bold">إدارة المنتجات</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={() => exportData('products')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      تصدير
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="border">
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b">
                        <TableHead className="font-semibold text-gray-900 border-r">اسم المنتج</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">السعر</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">المخزون</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">الحالة</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">مميز</TableHead>
                        <TableHead className="font-semibold text-gray-900">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.slice(0, 20).map((product) => (
                        <TableRow key={product.id} className="hover:bg-gray-50 border-b">
                          <TableCell className="border-r">
                            <div className="flex items-center gap-3">
                              {product.images?.[0] && (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-sm text-gray-600">{product.unit_description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-gray-900 border-r">
                            {product.price} ج.م
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                              {product.stock_quantity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={product.is_available ? "default" : "secondary"}>
                              {product.is_available ? "متوفر" : "غير متوفر"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {product.is_featured && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                مميز
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={product.is_available ? "destructive" : "default"}
                                onClick={() => toggleProductStatus(product.id, product.is_available)}
                                className="text-xs"
                              >
                                {product.is_available ? "❌ إلغاء" : "✅ تفعيل"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 font-bold">إدارة المستخدمين</CardTitle>
                  <Button onClick={() => exportData('users')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    تصدير
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="border">
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b">
                        <TableHead className="font-semibold text-gray-900 border-r">الاسم</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">الهاتف</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">نقاط الولاء</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">إجمالي الطلبات</TableHead>
                        <TableHead className="font-semibold text-gray-900 border-r">تاريخ التسجيل</TableHead>
                        <TableHead className="font-semibold text-gray-900">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.slice(0, 20).map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50 border-b">
                          <TableCell className="font-medium text-gray-900 border-r">{user.name}</TableCell>
                          <TableCell className="text-gray-900 border-r">{user.phone}</TableCell>
                          <TableCell className="border-r">
                            <Badge variant="outline">
                              {user.loyalty_points || 0} نقطة
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-900 border-r">{user.total_orders || 0}</TableCell>
                          <TableCell className="text-gray-700 border-r">
                            {formatDistance(new Date(user.created_at), new Date(), { 
                              addSuffix: true, 
                              locale: ar 
                            })}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUser(user.id)}
                              className="text-xs"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              🗑️ حذف
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <ReviewsManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 font-bold">
                    <TrendingUp className="h-5 w-5" />
                    أكثر المنتجات مبيعاً
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topProducts.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-red-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.product?.name}</p>
                            <p className="text-sm text-gray-600">مبيع: {item.quantity} قطعة</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{item.revenue.toFixed(2)} ج.م</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 font-bold">
                    <BarChart3 className="h-5 w-5" />
                    إحصائيات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border">
                      <span className="text-gray-800 font-medium">متوسط قيمة الطلب</span>
                      <span className="font-bold text-blue-600">
                        {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0} ج.م
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border">
                      <span className="text-gray-800 font-medium">معدل النمو (المستخدمون الجدد)</span>
                      <span className="font-bold text-green-600">
                        {stats.recentUsers} هذا الأسبوع
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border">
                      <span className="text-gray-800 font-medium">المنتجات النشطة</span>
                      <span className="font-bold text-orange-600">
                        {products.filter(p => p.is_available).length} / {products.length}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border">
                      <span className="text-gray-800 font-medium">معدل التحويل</span>
                      <span className="font-bold text-purple-600">
                        {stats.totalUsers > 0 ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
