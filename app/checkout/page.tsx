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
import { Gift, Truck, CreditCard, MapPin, Phone, User, Coins } from "lucide-react"
import { 
  calculateLoyaltyPoints, 
  LOYALTY_CONFIG, 
  getMaxUsablePoints, 
  convertPointsToEGP, 
  canUseShippingPoints 
} from "@/lib/utils/loyaltySystem"
import { FreeShippingProgress } from "@/components/ui/free-shipping-progress"

const { 
  SHIPPING_FEE, 
  FREE_SHIPPING_THRESHOLD, 
  POINTS_PER_EGP, 
  POINTS_TO_EGP_RATIO, 
  DISCOUNT_PER_RATIO, 
  SHIPPING_POINTS_COST, 
  MIN_POINTS_USE 
} = LOYALTY_CONFIG

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

  const [mounted, setMounted] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [pointsToUse, setPointsToUse] = useState(0)
  const [usePointsForShipping, setUsePointsForShipping] = useState(false)
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [loading, setLoading] = useState(false)

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
    error: loyaltyError,
    breakdown
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

    setLoading(true)
    try {
      // إنشاء الطلب
      const orderData = {
        user_id: user?.id,
        subtotal: subtotal,
        points_used: totalPointsUsed,
        points_discount: pointsDiscount,
        shipping_fee: finalShippingFee,
        final_amount: finalAmount,
        points_earned: pointsEarned,
        delivery_notes: deliveryNotes,
        status: "PENDING",
        created_at: new Date().toISOString(),
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single()

      if (orderError) {
        console.error("خطأ في إنشاء الطلب:", orderError)
        throw new Error("فشل في إنشاء الطلب")
      }

      // إنشاء عناصر الطلب
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        total_price: item.product.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems)

      if (itemsError) {
        console.error("خطأ في إضافة عناصر الطلب:", itemsError)
        throw new Error("فشل في إضافة عناصر الطلب")
      }

      // تحديث نقاط المستخدم
      const newPointsBalance = (user?.loyalty_points || 0) - totalPointsUsed + pointsEarned

      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          loyalty_points: newPointsBalance,
          ...(saveType === "permanent" ? {
            name: userData.name,
            address: userData.address,
            updated_at: new Date().toISOString()
          } : {})
        })
        .eq("id", user?.id)

      if (userUpdateError) {
        console.error("خطأ في تحديث نقاط المستخدم:", userUpdateError)
        // لا نوقف العملية هنا، فقط نسجل الخطأ
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">إتمام الطلب</h1>
        
        {/* Free Shipping Progress */}
        <FreeShippingProgress currentAmount={subtotal} className="mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* بيانات العميل */}
          <div className="space-y-6">
            {/* بيانات التسليم */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  بيانات التسليم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAuthenticated ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم</Label>
                      <Input
                        id="name"
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!editUser}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={userData.phone}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">العنوان</Label>
                      <Textarea
                        id="address"
                        value={userData.address}
                        onChange={(e) => setUserData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!editUser}
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant={editUser ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditUser(!editUser)}
                      >
                        {editUser ? "حفظ التغييرات" : "تعديل البيانات"}
                      </Button>
                      
                      {editUser && (
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="temporary"
                            name="saveType"
                            value="temporary"
                            checked={saveType === "temporary"}
                            onChange={(e) => setSaveType(e.target.value as "temporary")}
                          />
                          <Label htmlFor="temporary" className="text-sm">مؤقت</Label>
                          
                          <input
                            type="radio"
                            id="permanent"
                            name="saveType"
                            value="permanent"
                            checked={saveType === "permanent"}
                            onChange={(e) => setSaveType(e.target.value as "permanent")}
                          />
                          <Label htmlFor="permanent" className="text-sm">دائم</Label>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-4">يرجى تسجيل الدخول لإتمام الطلب</p>
                    <Button onClick={() => setShowLoginModal(true)}>
                      تسجيل الدخول
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* نقاط الولاء */}
            {isAuthenticated && user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    نقاط الولاء
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">رصيدك الحالي:</span>
                    <Badge variant="outline" className="bg-blue-100">
                      <Coins className="h-4 w-4 mr-1" />
                      {user.loyalty_points || 0} نقطة
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pointsToUse">
                      استخدام النقاط للخصم (كل {POINTS_TO_EGP_RATIO} نقطة = {DISCOUNT_PER_RATIO} ج.م)
                    </Label>
                    <Input
                      id="pointsToUse"
                      type="number"
                      min="0"
                      max={maxUsablePoints}
                      step={MIN_POINTS_USE}
                      value={pointsToUse}
                      onChange={(e) => handlePointsChange(e.target.value)}
                      placeholder={`أدخل مضاعفات ${MIN_POINTS_USE}`}
                    />
                    <p className="text-xs text-gray-500">
                      أقصى نقاط متاحة: {maxUsablePoints} (خصم {convertPointsToEGP(maxUsablePoints)} ج.م)
                    </p>
                  </div>

                  {baseShippingFee > 0 && (
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id="usePointsForShipping"
                        checked={usePointsForShipping}
                        onChange={(e) => handleShippingPointsChange(e.target.checked)}
                        disabled={!canUseShipping}
                      />
                      <Label 
                        htmlFor="usePointsForShipping" 
                        className={canUseShipping ? "" : "text-gray-400"}
                      >
                        استخدام {SHIPPING_POINTS_COST} نقطة للتوصيل المجاني
                        {!canUseShipping && " (نقاط غير كافية)"}
                      </Label>
                    </div>
                  )}

                  {pointsToUse > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        سيتم خصم {convertPointsToEGP(pointsToUse)} ج.م من إجمالي الطلب
                      </p>
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

            {/* ملاحظات التسليم */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  ملاحظات التسليم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="أي ملاحظات خاصة للتسليم (اختياري)"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* ملخص الطلب */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* عناصر السلة */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-md overflow-hidden">
                        <Image
                          src={item.product.images?.[0] || "/placeholder.jpg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × {item.product.price} ج.م
                        </p>
                      </div>
                      <span className="font-medium">
                        {item.product.price * item.quantity} ج.م
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* تفاصيل الفاتورة */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{subtotal} ج.م</span>
                  </div>
                  
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>خصم النقاط:</span>
                      <span>-{pointsDiscount} ج.م</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>رسوم التوصيل:</span>
                    <span>
                      {finalShippingFee === 0 && baseShippingFee > 0 ? (
                        <>
                          <span className="line-through text-gray-400">{baseShippingFee} ج.م</span>
                          <span className="text-green-600 mr-2">مجاني</span>
                        </>
                      ) : (
                        `${finalShippingFee} ج.م`
                      )}
                    </span>
                  </div>

                  {remainingForFreeShipping > 0 && !usePointsForShipping && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      أضف {remainingForFreeShipping} ج.م أخرى للحصول على توصيل مجاني
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي:</span>
                  <span>{finalAmount} ج.م</span>
                </div>

                {isAuthenticated && pointsEarned > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      🎉 ستحصل على {pointsEarned} نقطة من هذا الطلب!
                    </p>
                  </div>
                )}

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading || !isAuthenticated || !isLoyaltyValid}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "جاري إنشاء الطلب..." : "تأكيد الطلب"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  بالنقر على "تأكيد الطلب" فإنك توافق على شروط وأحكام الموقع
                </p>
              </CardContent>
            </Card>
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
