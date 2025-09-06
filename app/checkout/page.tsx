"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/lib/stores/cart-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { LoginModal } from "@/components/auth/login-modal"
import { Gift, Truck, CreditCard, MapPin, User, Coins } from "lucide-react"
import { 
  calculateLoyaltyPoints, 
  LOYALTY_CONFIG, 
  getMaxUsablePoints, 
  convertPointsToEGP, 
  canUseShippingPoints, 
  calculatePointsNeededForDiscount 
} from "@/lib/utils/loyaltySystem"
import { 
  processOrderPoints,
  validateUserPoints
} from "@/lib/utils/loyaltyProtection"
import { FreeShippingProgress } from "@/components/ui/free-shipping-progress"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

const { 
  SHIPPING_FEE, 
  FREE_SHIPPING_THRESHOLD, 
  SHIPPING_POINTS_COST, 
  MIN_POINTS_USE 
} = LOYALTY_CONFIG

// رابط الدفع عبر إنستا باي
const INSTAPAY_URL = "https://ipn.eg/S/youssefamr080/instapay/7NO0WM"

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const [editUser, setEditUser] = useState(false)
  const [userData, setUserData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  })
  const [saveType, setSaveType] = useState<"permanent"|"temporary">("temporary")
  const router = useRouter()
  const { toast } = useToast()
  // Locally typed Supabase client to enable safe inserts/updates only in this module
  const db = supabase as unknown as SupabaseClient<Database>

  const [mounted, setMounted] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [pointsToUse, setPointsToUse] = useState(0)
  const [usePointsForShipping, setUsePointsForShipping] = useState(false)
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [loading, setLoading] = useState(false)
  // حالة الدفع
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "INSTAPAY">("COD")
  const [instaPayRef, setInstaPayRef] = useState("")
  const [instaPayConfirmed, setInstaPayConfirmed] = useState(false)

  const subtotal = total
  const baseShippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  
  // حساب نقاط الولاء باستخدام النظام المحسن
  const loyaltyResult = calculateLoyaltyPoints(
    subtotal,
    pointsToUse,
    usePointsForShipping,
    user?.loyalty_points || 0,
    baseShippingFee
  )

  const {
    pointsDiscount,
    finalShippingFee,
    finalAmount,
    pointsEarned,
    totalPointsUsed,
    isValid: isLoyaltyValid,
  error: loyaltyError
  } = loyaltyResult

  // حساب أقصى نقاط يمكن استخدامها
  const maxUsablePoints = getMaxUsablePoints(subtotal, user?.loyalty_points || 0)
  
  // التحقق من إمكانية استخدام نقاط الشحن
  const canUseShipping = canUseShippingPoints(user?.loyalty_points || 0, pointsToUse)

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  useEffect(() => {
    setMounted(true)
    if (user) {
      setUserData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      })
    }
  }, [user])

  // التحقق من صحة النقاط المدخلة
  const handlePointsChange = (value: string) => {
    const points = parseInt(value) || 0
    
    if (points < 0) {
      setPointsToUse(0)
      return
    }
    
    if (points % MIN_POINTS_USE !== 0) {
      toast({
        title: "تنبيه",
        description: `يجب أن تكون النقاط من مضاعفات ${MIN_POINTS_USE}`,
        variant: "destructive",
      })
      return
    }
    
    if (points > maxUsablePoints) {
      setPointsToUse(maxUsablePoints)
      toast({
        title: "تنبيه",
        description: `أقصى نقاط يمكن استخدامها: ${maxUsablePoints}`,
        variant: "destructive",
      })
      return
    }
    
    setPointsToUse(points)
  }

  // التحقق من إمكانية استخدام نقاط الشحن
  const handleShippingPointsChange = (checked: boolean) => {
    if (checked && !canUseShipping) {
      toast({
        title: "نقاط غير كافية",
        description: `تحتاج إلى ${SHIPPING_POINTS_COST} نقطة إضافية للتوصيل المجاني`,
        variant: "destructive",
      })
      return
    }
    setUsePointsForShipping(checked)
  }

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast({
        title: "مطلوب تسجيل الدخول",
        description: "يرجى تسجيل الدخول أولاً لإتمام عملية الشراء",
        variant: "destructive",
      })
      setShowLoginModal(true)
      return
    }

  if (!isLoyaltyValid) {
      toast({
        title: "خطأ في النقاط",
        description: loyaltyError || "حدث خطأ في حساب نقاط الولاء",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "يرجى إضافة منتجات للسلة أولاً",
        variant: "destructive",
      })
      return
    }

    if (!userData.name || !userData.phone || !userData.address) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع البيانات المطلوبة",
        variant: "destructive",
      })
      return
    }

    // تحقق خاص بإنستا باي
    if (paymentMethod === "INSTAPAY" && !instaPayConfirmed) {
      toast({
        title: "تأكيد الدفع عبر إنستا باي",
        description: "اضغط على زر الدفع ثم أكد أنك قمت بالتحويل قبل تأكيد الطلب",
        variant: "destructive",
      })
      return
    }

    // تأكيد تواجد المستخدم لتجنّب استخدام تأكيدات non-null
    if (!user?.id) {
      toast({
        title: "مشكلة في الحساب",
        description: "تعذر تحديد هوية المستخدم. يرجى إعادة تسجيل الدخول",
        variant: "destructive",
      })
      return
    }

    const userId = user.id

    setLoading(true)
    try {
      // التحقق من صحة نقاط المستخدم قبل إنشاء الطلب
      console.log("🔍 Validating user points before order creation...")
      const pointsValidation = await validateUserPoints(userId)
      
      if (pointsValidation && !pointsValidation.is_valid) {
        console.warn("⚠️ User points validation failed:", pointsValidation)
        toast({
          title: "خطأ في نقاط الولاء",
          description: `يوجد خلل في رصيد نقاطك. يرجى التواصل مع الدعم الفني.`,
          variant: "destructive",
        })
        return
      }

      // إنشاء الطلب
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      
  // دمج الملاحظات مع مرجع إنستا باي (اختياري)
  const mergedNotes = [
    deliveryNotes?.trim() ? deliveryNotes.trim() : null,
    paymentMethod === "INSTAPAY" ? `InstaPay Ref: ${instaPayRef?.trim() || "N/A"}` : null,
  ].filter(Boolean).join(" | ") || null

  const orderData: Database['public']['Tables']['orders']['Insert'] = {
        user_id: userId,
        order_number: orderNumber,
        delivery_address: userData.address || user?.address || "العنوان غير محدد",
        subtotal: subtotal,
        // Supabase schema uses discount_amount (not points_discount)
        points_used: totalPointsUsed || 0,
        discount_amount: parseFloat(pointsDiscount.toFixed(2)),
        shipping_fee: parseFloat(finalShippingFee.toFixed(2)),
        final_amount: parseFloat(finalAmount.toFixed(2)),
        points_earned: pointsEarned || 0,
        delivery_notes: mergedNotes,
        payment_method: paymentMethod === "INSTAPAY" ? "INSTAPAY" : "CASH_ON_DELIVERY",
        payment_status: "PENDING",
        status: 'PENDING' as const
      }

      console.log("🔄 محاولة إنشاء طلب مع البيانات:", orderData)
      
  type OrderRow = Database['public']['Tables']['orders']['Row']
  const insertResult = await db
    .from("orders")
    .insert(orderData)
    .select("*")
    .single()
  const order = insertResult.data as OrderRow | null
  const orderError = insertResult.error

      if (orderError) {
        console.error("❌ خطأ في إنشاء الطلب:", orderError)
        console.error("❌ تفاصيل الخطأ:", JSON.stringify(orderError, null, 2))
        throw new Error(`فشل في إنشاء الطلب: ${orderError.message || 'خطأ غير معروف'}`)
      }

  console.log("✅ تم إنشاء الطلب بنجاح:", order)

  if (!order) {
        throw new Error("لم يتم استرجاع بيانات الطلب من الخادم")
      }

      // إنشاء عناصر الطلب
  const orderItems: import("@/lib/database.types").Database['public']['Tables']['order_items']['Insert'][] = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        total_price: item.product.price * item.quantity,
  }))

  const { error: itemsError } = await db
        .from("order_items")
        .insert(orderItems)

      if (itemsError) {
        console.error("خطأ في إضافة عناصر الطلب:", itemsError)
        throw new Error("فشل في إضافة عناصر الطلب")
      }

      // معالجة نقاط الولاء باستخدام النظام المحمي
      console.log("💳 Processing loyalty points with protection system...")
      const pointsResult = await processOrderPoints(
        userId,
        order.id,
        totalPointsUsed || 0,
        pointsEarned || 0,
        orderNumber,
        finalAmount
      )

      if (!pointsResult.success) {
        console.error("❌ فشل في معالجة نقاط الولاء:", pointsResult.error)
        
        // محاولة حذف الطلب في حالة فشل معالجة النقاط
  await db.from("orders").delete().eq("id", order.id)
  await db.from("order_items").delete().eq("order_id", order.id)
        
        throw new Error(`فشل في معالجة نقاط الولاء: ${pointsResult.error}`)
      }

      // تحديث بيانات المستخدم (بدون تحديث النقاط لأنها تم تحديثها في النظام المحمي)
  const updateData: Database['public']['Tables']['users']['Update'] = {}

      if (saveType === "permanent") {
        updateData.name = userData.name
        updateData.address = userData.address
      }

      if (Object.keys(updateData).length > 0) {
  const { error: userUpdateError } = await db
          .from("users")
          .update(updateData)
          .eq("id", userId)

        if (userUpdateError) {
          console.error("خطأ في تحديث بيانات المستخدم:", userUpdateError)
          // لا نوقف العملية هنا، فقط نسجل الخطأ
        }
      }

      // التحقق النهائي من صحة النقاط بعد المعالجة
  const finalValidation = await validateUserPoints(userId)
      if (finalValidation && !finalValidation.is_valid) {
        console.error("❌ Points validation failed after order processing:", finalValidation)
        // نسجل الخطأ لكن لا نوقف العملية لأن الطلب تم إنشاؤه بنجاح
      }

      // مسح السلة
      clearCart()

      toast({
        title: "تم إنشاء الطلب بنجاح! 🎉",
        description: `رقم الطلب: ${order.id.slice(0, 8)}... - سيتم التواصل معك قريباً`,
        variant: "default",
      })

      // الانتقال لصفحة تأكيد الطلب
      router.push(`/order-confirmation/${order.id}`)

    } catch (error) {
      console.error("خطأ في إتمام الطلب:", error)
      toast({
        title: "فشل في إتمام الطلب",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <div className="mx-auto mb-4 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">السلة فارغة</h2>
            <p className="text-gray-600 mb-6">لا توجد منتجات في السلة للدفع</p>
            <Button asChild>
              <a href="/categories">تسوق الآن</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">إتمام الطلب</h1>
            <p className="text-gray-600">أكمل بياناتك لتأكيد طلبك</p>
          </div>
          
          {/* Free Shipping Progress */}
          <FreeShippingProgress currentAmount={subtotal} className="mb-8" />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            {/* بيانات العميل - عمودين في الشاشات الكبيرة */}
            <div className="xl:col-span-2 space-y-6">
            {/* بيانات التسليم */}
            <Card className="shadow-sm border border-gray-200 bg-white rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  بيانات التسليم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {isAuthenticated ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">الاسم الكامل</Label>
                      <Input
                        id="name"
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!editUser}
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={userData.phone}
                        disabled
                        className="bg-gray-50 border-gray-200"
                      />
                      <p className="text-xs text-gray-500">لا يمكن تغيير رقم الهاتف المرتبط بالحساب</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700">العنوان التفصيلي</Label>
                      <Textarea
                        id="address"
                        value={userData.address}
                        onChange={(e) => setUserData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!editUser}
                        rows={3}
                        className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="أدخل عنوانك التفصيلي (الحي، الشارع، رقم المبنى)"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                      <Button
                        variant={editUser ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditUser(!editUser)}
                        className={editUser ? "bg-blue-600 hover:bg-blue-700" : "border-gray-800 text-gray-900 hover:bg-gray-100"}
                      >
                        {editUser ? "حفظ التغييرات" : "تعديل البيانات"}
                      </Button>
                      
                      {editUser && (
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="temporary"
                              name="saveType"
                              value="temporary"
                              checked={saveType === "temporary"}
                              onChange={(e) => setSaveType(e.target.value as "temporary")}
                              className="text-blue-600"
                            />
                            <Label htmlFor="temporary" className="text-sm text-gray-600">حفظ مؤقت</Label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              id="permanent"
                              name="saveType"
                              value="permanent"
                              checked={saveType === "permanent"}
                              onChange={(e) => setSaveType(e.target.value as "permanent")}
                              className="text-blue-600"
                            />
                            <Label htmlFor="permanent" className="text-sm text-gray-600">حفظ دائم</Label>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">مطلوب تسجيل الدخول</h3>
                    <p className="text-gray-600 mb-6">يرجى تسجيل الدخول لإتمام عملية الشراء</p>
                    <Button 
                      onClick={() => setShowLoginModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 px-8"
                    >
                      تسجيل الدخول
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* نقاط الولاء */}
            {isAuthenticated && user && (
              <Card className="shadow-sm border border-gray-200 bg-white rounded-xl">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-gray-100 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="p-2 bg-yellow-100 rounded-xl">
                      <Gift className="h-5 w-5 text-yellow-600" />
                    </div>
                    نقاط الولاء
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">رصيدك الحالي:</span>
                        <Badge variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800 px-3 py-1">
                          <Coins className="h-4 w-4 mr-1" />
                          {user.loyalty_points || 0} نقطة
                        </Badge>
                      </div>
                      <div className="text-xs text-yellow-700 mt-2">
                        💰 قيمة نقاطك: {convertPointsToEGP(user.loyalty_points || 0)} ج.م
                      </div>
                    </div>

                    {/* حاسبة النقاط التفاعلية */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                        🧮 حاسبة النقاط
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-2 rounded-lg text-center">
                          <div className="font-bold text-blue-600">200 نقطة</div>
                          <div className="text-gray-600">= 4 ج.م خصم</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg text-center">
                          <div className="font-bold text-green-600">1000 نقطة</div>
                          <div className="text-gray-600">= توصيل مجاني</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="pointsToUse" className="text-sm font-medium text-gray-700">
                        💎 استخدام النقاط للخصم
                      </Label>
                      {/* اقتراحات ذكية */}
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {/* أقصى خصم ممكن */}
                          <button
                            type="button"
                            onClick={() => setPointsToUse(maxUsablePoints)}
                            disabled={maxUsablePoints === 0}
                            className={`px-3 py-1 rounded-md font-medium ${maxUsablePoints > 0 ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                          >
                            أقصى خصم: {convertPointsToEGP(maxUsablePoints)} ج.م
                          </button>
                          {/* خصم يغطي الشحن */}
                          {baseShippingFee > 0 && (
                            (() => {
                              const pts = Math.min(
                                maxUsablePoints,
                                calculatePointsNeededForDiscount(baseShippingFee)
                              )
                              const enabled = pts > 0 && pts <= (user.loyalty_points || 0)
                              return (
                                <button
                                  type="button"
                                  onClick={() => enabled && setPointsToUse(pts)}
                                  disabled={!enabled}
                                  className={`px-3 py-1 rounded-md font-medium ${enabled ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                  غطّي الشحن: {convertPointsToEGP(pts)} ج.م
                                </button>
                              )
                            })()
                          )}
                          {/* اقتراح متوازن 50% من الحد */}
                          {maxUsablePoints > 0 && (
                            (() => {
                              const half = Math.floor(maxUsablePoints / (2 * MIN_POINTS_USE)) * MIN_POINTS_USE
                              const enabled = half > 0
                              return (
                                <button
                                  type="button"
                                  onClick={() => enabled && setPointsToUse(half)}
                                  disabled={!enabled}
                                  className={`px-3 py-1 rounded-md font-medium ${enabled ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                  خيار ذكي: {half} نقطة (خصم {convertPointsToEGP(half)} ج.م)
                                </button>
                              )
                            })()
                          )}
                        </div>
                        <div className="text-[11px] text-gray-600">
                          نصيحة: يمكنك تعديل النقاط بالسلايدر أو الحقول بالأسفل. الحد الأدنى {MIN_POINTS_USE} نقطة.
                        </div>
                      </div>
                      {/* سلايدر النقاط */}
                      <input
                        type="range"
                        min={0}
                        max={maxUsablePoints}
                        step={MIN_POINTS_USE}
                        value={Math.min(pointsToUse, maxUsablePoints)}
                        onChange={(e) => handlePointsChange(e.target.value)}
                        className="w-full accent-yellow-500"
                      />
                      
                      {/* أزرار سريعة للنقاط */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[200, 400, 600, 800, 1000].map((points) => (
                          <button
                            key={points}
                            type="button"
                            onClick={() => {
                              if (points <= (user.loyalty_points || 0) && points <= maxUsablePoints) {
                                setPointsToUse(points)
                              }
                            }}
                            disabled={points > (user.loyalty_points || 0) || points > maxUsablePoints}
                            className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                              points <= (user.loyalty_points || 0) && points <= maxUsablePoints
                                ? pointsToUse === points
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {points} نقطة
                            <div className="text-[10px]">
                              {points === 1000 ? 'توصيل مجاني' : `${convertPointsToEGP(points)} ج.م`}
                            </div>
                          </button>
                        ))}
                      </div>

                      <Input
                        id="pointsToUse"
                        type="number"
                        min="0"
                        max={maxUsablePoints}
                        step={MIN_POINTS_USE}
                        value={pointsToUse}
                        onChange={(e) => handlePointsChange(e.target.value)}
                        placeholder={`أدخل مضاعفات ${MIN_POINTS_USE}`}
                        className="focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          أقصى نقاط متاحة: <span className="font-medium text-gray-700">{maxUsablePoints}</span>
                        </span>
                        <span className="text-green-600 font-medium">
                          خصم {convertPointsToEGP(maxUsablePoints)} ج.م
                        </span>
                      </div>
                    </div>

                    </div>

                  {baseShippingFee > 0 && (
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id="usePointsForShipping"
                          checked={usePointsForShipping}
                          onChange={(e) => handleShippingPointsChange(e.target.checked)}
                          disabled={!canUseShipping}
                          className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                        />
                        <Label 
                          htmlFor="usePointsForShipping" 
                          className={`text-sm ${canUseShipping ? 'text-purple-700' : 'text-gray-400'}`}
                        >
                          🚚 استخدام {SHIPPING_POINTS_COST} نقطة للتوصيل المجاني
                          {!canUseShipping && " (نقاط غير كافية)"}
                        </Label>
                      </div>
                      {canUseShipping && (
                        <div className="text-xs text-purple-600 mt-2">
                          💡 وفر {SHIPPING_FEE} ج.م رسوم توصيل
                        </div>
                      )}
                    </div>
                  )}

                  {pointsToUse > 0 && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700">💰 توفيرك</span>
                        <span className="text-lg font-bold text-green-600">
                          {convertPointsToEGP(pointsToUse)} ج.م
                        </span>
                      </div>
                      <div className="text-xs text-green-600">
                        ✨ سيتم خصم {pointsToUse} نقطة من رصيدك
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        رصيدك بعد الاستخدام: {(user.loyalty_points || 0) - pointsToUse} نقطة
                      </div>
                    </div>
                  )}

                  {usePointsForShipping && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-700">🚚 توصيل مجاني</span>
                        <span className="text-lg font-bold text-purple-600">
                          {SHIPPING_FEE} ج.م
                        </span>
                      </div>
                      <div className="text-xs text-purple-600">
                        ✨ سيتم خصم {SHIPPING_POINTS_COST} نقطة إضافية
                      </div>
                    </div>
                  )}

                  {!isLoyaltyValid && loyaltyError && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">{loyaltyError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
                <Card className="shadow-md border border-gray-200 bg-white rounded-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100 rounded-t-2xl">
                  <CardTitle className="flex items-center gap-3 text-gray-900">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  طريقة الدفع
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 space-y-4">
                  {/* خيارات الدفع كـ بطاقات كبيرة لسهولة التفاعل في الموبايل */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-shadow cursor-pointer ${
                    paymentMethod === "COD"
                      ? "border-red-600 bg-red-50 shadow-sm"
                      : "border-gray-200 bg-white hover:shadow-sm"
                    }`}
                  >
                    <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="h-4 w-4 text-red-600"
                    aria-label="الدفع عند الاستلام"
                    />
                    <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">الدفع عند الاستلام</div>
                    <div className="text-xs text-gray-500 mt-1">مريح وآمن، ادفع عند الاستلام</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-shadow cursor-pointer ${
                    paymentMethod === "INSTAPAY"
                      ? "border-purple-600 bg-purple-50 shadow-sm"
                      : "border-gray-200 bg-white hover:shadow-sm"
                    }`}
                  >
                    <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "INSTAPAY"}
                    onChange={() => {
                      setPaymentMethod("INSTAPAY")
                      setInstaPayConfirmed(false)
                    }}
                    className="h-4 w-4 text-red-600"
                    aria-label="الدفع عبر إنستا باي"
                    />
                    <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">الدفع عبر إنستا باي</div>
                    <div className="text-xs text-gray-500 mt-1">ادفع إلكترونياً بسرعة وسهولة</div>
                    </div>
                  </label>
                  </div>

                  {paymentMethod === "INSTAPAY" && (
                  <div className="mt-2 rounded-lg border p-4 bg-gray-50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-700">المبلغ المطلوب دفعه</p>
                      <div className="mt-1 text-2xl font-extrabold text-gray-900">
                      {finalAmount.toFixed(2)} ج.م
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                      type="button"
                      onClick={() => {
                        const text = finalAmount.toFixed(2)
                        navigator.clipboard?.writeText(text).then(
                        () =>
                          toast({
                          title: "تم النسخ",
                          description: `تم نسخ ${text} ج.م إلى الحافظة`,
                          variant: "default",
                          }),
                        () =>
                          toast({
                          title: "فشل النسخ",
                          description: "يتعذر الوصول إلى الحافظة",
                          variant: "destructive",
                          })
                        )
                      }}
                      className="w-full sm:w-auto px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow-sm text-sm"
                      aria-label="نسخ المبلغ"
                      >
                      نسخ المبلغ
                      </button>
                    </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <button
                      type="button"
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-lg shadow-lg text-sm"
                      onClick={() => window.open(INSTAPAY_URL, "_blank", "noopener")}
                      aria-label="ادفع الآن عبر إنستا باي"
                    >ادفع الآن</button>
                    </div>

                  </div>
                  )}
                </CardContent>
              </Card>

            {/* ملاحظات التسليم */}
            <Card className="shadow-sm border border-gray-200 bg-white rounded-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-100 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  ملاحظات التسليم
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="أي ملاحظات أو تعليمات خاصة للتسليم (اختياري)..."
                  rows={4}
                  className="focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  مثال: الدور الثالث، شقة رقم 5، بجانب المصعد
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ملخص الطلب */}
          <div className="xl:col-span-1">
            <div className="sticky top-4">
              <Card className="shadow-lg border border-gray-200 bg-white rounded-xl">
                <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    ملخص الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                {/* عناصر السلة */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    منتجات الطلب ({items.length})
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product.images?.[0] || "/placeholder.jpg"}
                            alt={item.product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{item.product.name}</h4>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × {item.product.price} ج.م
                          </p>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {item.product.price * item.quantity} ج.م
                        </span>
                      </div>
                    ))}
                  </div>
                </div>                <Separator className="border-gray-200" />

                {/* تفاصيل الفاتورة */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">تفاصيل الفاتورة</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">المجموع الفرعي:</span>
                      <span className="font-bold text-gray-900">{subtotal} ج.م</span>
                    </div>
                    
                    {pointsDiscount > 0 && (
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex flex-col">
                          <span className="text-green-700 font-medium">💎 خصم النقاط</span>
                          <span className="text-xs text-green-600">{pointsToUse} نقطة مستخدمة</span>
                        </div>
                        <span className="font-bold text-green-700 text-lg">-{pointsDiscount} ج.م</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-gray-700">رسوم التوصيل:</span>
                        {usePointsForShipping && (
                          <span className="text-xs text-purple-600">🚚 {SHIPPING_POINTS_COST} نقطة مستخدمة</span>
                        )}
                      </div>
                      <span className="font-bold">
                        {finalShippingFee === 0 && baseShippingFee > 0 ? (
                          <div className="text-right">
                            <span className="line-through text-gray-400 text-sm">{baseShippingFee} ج.م</span>
                            <span className="text-green-600 block font-bold">
                              {usePointsForShipping ? '🎉 مجاني بالنقاط' : 'مجاني 🎉'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-900">{finalShippingFee} ج.م</span>
                        )}
                      </span>
                    </div>

                    {remainingForFreeShipping > 0 && !usePointsForShipping && (
                      <div className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        💡 أضف {remainingForFreeShipping} ج.م أخرى للحصول على توصيل مجاني
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="border-gray-200" />

                <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg text-gray-900">الإجمالي:</span>
                    <span className="font-bold text-2xl text-red-600">{finalAmount} ج.م</span>
                  </div>
                  {(pointsDiscount > 0 || usePointsForShipping) && (
                    <div className="text-xs text-gray-600 text-center">
                      💰 توفيرك الإجمالي: {pointsDiscount + (usePointsForShipping ? SHIPPING_FEE : 0)} ج.م
                      {totalPointsUsed > 0 && ` | ${totalPointsUsed} نقطة مستخدمة`}
                    </div>
                  )}
                </div>

                {isAuthenticated && pointsEarned > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-yellow-600" />
                      <span className="font-bold text-yellow-700">🎁 مكافأة نقاط الولاء</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-yellow-700">ستحصل على:</span>
                      <span className="text-xl font-bold text-yellow-600">
                        +{pointsEarned} نقطة
                      </span>
                    </div>
                    <div className="text-xs text-yellow-600 mt-2">
                      💡 كل جنيه = نقطة واحدة | رصيدك الجديد: {(user?.loyalty_points || 0) - totalPointsUsed + pointsEarned} نقطة
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading || !isAuthenticated || !isLoyaltyValid}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 text-lg rounded-lg shadow-lg transition-all duration-200"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      جاري إنشاء الطلب...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      تأكيد الطلب
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  بالنقر على &quot;تأكيد الطلب&quot; فإنك توافق على 
                  <span className="text-blue-600 hover:underline cursor-pointer"> شروط وأحكام الموقع</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
  </div>
  </div>
  </div>

  <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}
