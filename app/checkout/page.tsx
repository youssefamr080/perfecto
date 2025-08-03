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
import { Gift, Truck, CreditCard, MapPin, Phone, User } from "lucide-react"
import { calculateLoyaltyPoints, validateLoyaltyTransaction, LOYALTY_CONFIG } from "@/lib/utils/loyaltySystem"

const { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD, POINTS_PER_EGP, POINTS_TO_EGP, SHIPPING_POINTS_COST } = LOYALTY_CONFIG

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
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  
  // استخدام النظام المحسن لحساب النقاط
  const loyaltyCalculation = calculateLoyaltyPoints(
    subtotal,
    pointsToUse,
    usePointsForShipping,
    shippingFee
  )
  
  const { pointsDiscount, finalShippingFee, finalAmount, pointsEarned, totalPointsUsed } = loyaltyCalculation

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isAuthenticated && items.length > 0) {
      setShowLoginModal(true)
    }
  }, [isAuthenticated, items.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setShowLoginModal(true)
      return
    }

    // التحقق من صحة البيانات قبل الإرسال
    const currentName = editUser ? userData.name : user.name
    const currentPhone = editUser ? userData.phone : user.phone  
    const currentAddress = editUser ? userData.address : user.address

    if (!currentName || currentName.trim().length < 2) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم صحيح (حرفين على الأقل)",
        variant: "destructive",
      })
      return
    }

    if (!currentPhone || currentPhone.length < 11) {
      toast({
        title: "خطأ في البيانات", 
        description: "يرجى إدخال رقم هاتف صحيح (11 رقم على الأقل)",
        variant: "destructive",
      })
      return
    }

    if (!currentAddress || currentAddress.trim().length < 10) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال عنوان مفصل (10 أحرف على الأقل)",
        variant: "destructive",
      })
      return
    }

    // التحقق من أن رقم الهاتف يحتوي على أرقام فقط
    const phoneRegex = /^[0-9+\-\s()]+$/
    if (!phoneRegex.test(currentPhone)) {
      toast({
        title: "خطأ في رقم الهاتف",
        description: "رقم الهاتف يجب أن يحتوي على أرقام فقط",
        variant: "destructive",
      })
      return
    }

    // التحقق من أن السلة ليست فارغة
    if (items.length === 0) {
      toast({
        title: "سلة فارغة",
        description: "لا يوجد منتجات في سلة التسوق",
        variant: "destructive",
      })
      router.push("/cart")
      return
    }

    // التحقق من صحة العملية باستخدام النظام المحسن
    const validation = validateLoyaltyTransaction(user.loyalty_points || 0, totalPointsUsed, finalAmount)
    if (!validation.isValid) {
      toast({
        title: "خطأ في النقاط",
        description: validation.error,
        variant: "destructive",
      })
      return
    }    setLoading(true)
    try {
      // إذا اختار المستخدم حفظ دائم، حدث البيانات في قاعدة البيانات
      if (editUser && saveType === "permanent") {
        await supabase.from("users").update({
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          updated_at: new Date().toISOString(),
        }).eq("id", user.id)
      }
      // استخدم بيانات التوصيل (إما المعدلة أو الأصلية)
      const deliveryName = editUser ? userData.name : user.name
      const deliveryPhone = editUser ? userData.phone : user.phone
      const deliveryAddress = editUser ? userData.address : user.address

      // Generate order number
      const orderNumber = `ORD-${Date.now()}`
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          subtotal,
          shipping_fee: finalShippingFee,
          discount_amount: pointsDiscount,
          final_amount: finalAmount,
          points_earned: pointsEarned,
          points_used: totalPointsUsed,
          delivery_address: deliveryAddress,
          delivery_phone: deliveryPhone,
          delivery_notes: deliveryNotes,
          status: "PENDING",
        })
        .select()
        .single()
      if (orderError) throw orderError
      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        total_price: item.product.price * item.quantity,
      }))
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
      if (itemsError) throw itemsError
      
      // حساب النقاط الجديدة بدقة
      const currentLoyaltyPoints = user.loyalty_points || 0
      const newLoyaltyPoints = Math.max(0, currentLoyaltyPoints - totalPointsUsed + pointsEarned)
      
      // تسجيل استخدام النقاط أولاً (إذا تم استخدام نقاط)
      if (totalPointsUsed > 0) {
        const { error: redeemError } = await supabase.from("loyalty_points_history").insert({
          user_id: user.id,
          order_id: order.id,
          points_change: -totalPointsUsed,
          points_balance: currentLoyaltyPoints - totalPointsUsed,
          transaction_type: "REDEEMED",
          description: `نقاط مستخدمة في الطلب ${orderNumber}`,
        })
        if (redeemError) throw redeemError
      }
      
      // تسجيل النقاط المكتسبة (إذا تم كسب نقاط)
      if (pointsEarned > 0) {
        const { error: earnError } = await supabase.from("loyalty_points_history").insert({
          user_id: user.id,
          order_id: order.id,
          points_change: pointsEarned,
          points_balance: newLoyaltyPoints,
          transaction_type: "EARNED",
          description: `نقاط مكتسبة من الطلب ${orderNumber}`,
        })
        if (earnError) throw earnError
      }
      
      // تحديث بيانات المستخدم
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({
          loyalty_points: newLoyaltyPoints,
          total_orders: (user.total_orders || 0) + 1,
          total_spent: (user.total_spent || 0) + finalAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
      if (userUpdateError) throw userUpdateError
      // Create notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "تم إنشاء طلبك بنجاح",
        message: `تم إنشاء طلبك رقم ${orderNumber} بنجاح. سيتم التواصل معك قريباً لتأكيد الطلب.`,
        type: "ORDER_UPDATE",
        data: { order_id: order.id, order_number: orderNumber },
      })
      // Clear cart
      clearCart()
      toast({
        title: "تم إنشاء الطلب بنجاح!",
        description: "سيتم التواصل معك قريباً لتأكيد الطلب",
      })
      router.push(`/order-confirmation/${order.id}`)
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من إنشاء الطلب. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  if (items.length === 0) {
    if (typeof window !== "undefined") {
      router.push("/cart")
    }
    return null
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-4">يجب تسجيل الدخول أولاً</h1>
          <p className="text-black mb-6">لإتمام عملية الشراء، يرجى تسجيل الدخول أولاً</p>
          <Button onClick={() => setShowLoginModal(true)} className="bg-green-600 hover:bg-green-700">
            تسجيل الدخول
          </Button>
        </div>

        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">إتمام الطلب</h1>
          <p className="text-black">راجع طلبك وأكمل عملية الشراء</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-black">
                  <User className="h-5 w-5 text-green-600" />
                  بيانات العميل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editUser ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <User className="h-5 w-5 text-black" />
                        <div>
              <p className="text-sm text-black">الاسم</p>
              <p className="font-semibold text-black">{user?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <Phone className="h-5 w-5 text-black" />
                        <div>
              <p className="text-sm text-black">رقم الهاتف</p>
              <p className="font-semibold text-black">{user?.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                      <MapPin className="h-5 w-5 text-black mt-1" />
                      <div className="flex-1">
            <p className="text-sm text-black">عنوان التوصيل</p>
            <p className="font-semibold text-black">{user?.address}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-2 text-black font-bold" onClick={() => setEditUser(true)}>
                      تعديل البيانات
                    </Button>
                  </>
                ) : (
                  <form className="space-y-3" onSubmit={e => { e.preventDefault(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editName">الاسم</Label>
                        <Input id="editName" value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} required />
                      </div>
                      <div>
                        <Label htmlFor="editPhone">رقم الهاتف</Label>
                        <Input id="editPhone" value={userData.phone} onChange={e => setUserData({ ...userData, phone: e.target.value })} required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="editAddress">العنوان</Label>
                      <Textarea id="editAddress" value={userData.address} onChange={e => setUserData({ ...userData, address: e.target.value })} required />
                    </div>
                    <div className="flex gap-4 items-center">
                  <Label className="flex items-center gap-2 text-black font-bold">
                        <input type="radio" name="saveType" value="permanent" checked={saveType === "permanent"} onChange={() => setSaveType("permanent")}/>
                        حفظ دائم
                      </Label>
                      <Label className="flex items-center gap-2">
                        <input type="radio" name="saveType" value="temporary" checked={saveType === "temporary"} onChange={() => setSaveType("temporary")}/>
                        <span className="text-black font-bold">لهذا الطلب فقط</span>
                      </Label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" className="text-black font-bold" onClick={() => setEditUser(false)}>إلغاء</Button>
                      <Button type="button" className="text-black font-bold" onClick={() => setEditUser(false)}>تأكيد البيانات</Button>
                    </div>
                  </form>
                )}
                <div>
                  <Label htmlFor="deliveryNotes" className="text-sm font-bold text-black">
                    ملاحظات التوصيل (اختياري)
                  </Label>
                  <Textarea
                    id="deliveryNotes"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="أي ملاحظات خاصة للتوصيل..."
                    className="text-right mt-2 resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Loyalty Points */}
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-black">
                  <Gift className="h-5 w-5 text-green-600" />
                  نقاط الولاء
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <span className="font-medium text-green-800">النقاط المتاحة:</span>
                    <Badge className="bg-green-500 text-white text-base px-3 py-1 font-bold">
                      {user?.loyalty_points || 0} نقطة
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <span className="font-medium text-blue-800">النقاط المكتسبة:</span>
                    <Badge className="bg-blue-500 text-white text-base px-3 py-1 font-bold">+{pointsEarned} نقطة</Badge>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-800">القيمة النقدية المتاحة:</span>
                    <span className="font-bold text-purple-800">{Math.floor((user?.loyalty_points || 0) / 100)} ج.م</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    يمكنك استخدام حتى {Math.floor((user?.loyalty_points || 0) / 100) * 100} نقطة
                  </p>
                </div>

                {(user?.loyalty_points || 0) > 0 && (
                  <div className="space-y-3">
                    <Label htmlFor="points" className="text-sm font-bold text-black">
                      استخدام النقاط (كل 100 نقطة = 1 ج.م)
                    </Label>
                    <Input
                      id="points"
                      type="number"
                      min="0"
                      max={Math.floor((user?.loyalty_points || 0) / 100) * 100}
                      step="100"
                      value={pointsToUse}
                      onChange={(e) => {
                        const inputValue = Number.parseInt(e.target.value) || 0
                        const maxAllowed = Math.floor((user?.loyalty_points || 0) / 100) * 100
                        const validValue = Math.min(maxAllowed, Math.max(0, inputValue))
                        // التأكد من أن القيمة من مضاعفات 100
                        const adjustedValue = Math.floor(validValue / 100) * 100
                        setPointsToUse(adjustedValue)
                      }}
                      placeholder={`الحد الأقصى: ${Math.floor((user?.loyalty_points || 0) / 100) * 100}`}
                      className="text-right"
                    />
                    {pointsToUse > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm text-green-600 font-medium">💰 خصم: {pointsDiscount} ج.م</p>
                        <p className="text-xs text-gray-600">
                          سيتبقى لديك: {(user?.loyalty_points || 0) - pointsToUse} نقطة
                        </p>
                      </div>
                    )}
                    {pointsToUse > 0 && pointsToUse % 100 !== 0 && (
                      <p className="text-sm text-red-600">⚠️ يجب أن تكون النقاط من مضاعفات 100</p>
                    )}
                  </div>
                )}

                {shippingFee > 0 && (user?.loyalty_points || 0) >= SHIPPING_POINTS_COST && (
                  <div className="flex items-center space-x-2 space-x-reverse p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <input
                      type="checkbox"
                      id="usePointsShipping"
                      checked={usePointsForShipping}
                      onChange={(e) => setUsePointsForShipping(e.target.checked)}
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <Label htmlFor="usePointsShipping" className="text-sm font-medium cursor-pointer text-purple-800">
                      🚚 استخدام {SHIPPING_POINTS_COST} نقطة للتوصيل المجاني (بدلاً من {shippingFee} ج.م)
                    </Label>
                  </div>
                )}

                {/* عرض ملخص النقاط بعد الطلب */}
                {(pointsToUse > 0 || usePointsForShipping || pointsEarned > 0) && (
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-2">ملخص النقاط:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">النقاط الحالية:</span>
                        <span className="font-medium">{user?.loyalty_points || 0}</span>
                      </div>
                      {totalPointsUsed > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>النقاط المستخدمة:</span>
                          <span className="font-medium">-{totalPointsUsed}</span>
                        </div>
                      )}
                      {pointsEarned > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>النقاط المكتسبة:</span>
                          <span className="font-medium">+{pointsEarned}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold">
                        <span className="text-gray-800">النقاط بعد الطلب:</span>
                        <span className="text-gray-800">
                          {Math.max(0, (user?.loyalty_points || 0) - totalPointsUsed + pointsEarned)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Cart Items */}
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-black">المنتجات المطلوبة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-300">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image
                            src={
                              item.product.images[0] ||
                              `/placeholder.svg?height=48&width=48&text=${encodeURIComponent(item.product.name) || "/placeholder.svg"}`
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-black text-sm truncate">{item.product.name}</h4>
                          <p className="text-xs text-black font-bold">
                            {item.quantity} × {item.product.price} ج.م
                          </p>
                        </div>
                        <div className="font-bold text-black text-sm">{(item.product.price * item.quantity).toFixed(2)} ج.م</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="shadow-sm border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-black">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    ملخص الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-black">المجموع الفرعي:</span>
                      <span className="font-bold text-black">{subtotal.toFixed(2)} ج.م</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-black">رسوم التوصيل:</span>
                      <span className={`font-bold text-black ${finalShippingFee === 0 ? "text-green-600" : ""}`}>
                        {finalShippingFee === 0 ? <span className="text-green-600 font-bold">مجاني 🚚</span> : `${finalShippingFee} ج.م`}
                      </span>
                    </div>

                    {pointsDiscount > 0 && (
                    <div className="flex justify-between text-sm text-black">
                        <span>خصم النقاط:</span>
                        <span className="font-semibold">-{pointsDiscount} ج.م</span>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span className="font-bold text-black">المجموع الكلي:</span>
                      <span className="font-bold text-black">{finalAmount.toFixed(2)} ج.م</span>
                    </div>
                  </div>

                  {subtotal < FREE_SHIPPING_THRESHOLD && !usePointsForShipping && (
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <p className="text-sm text-black font-medium">
                        💡 أضف {(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} ج.م أخرى للحصول على توصيل مجاني!
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-green-500 hover:bg-green-600 text-black text-lg py-6 font-bold"
                    disabled={loading}
                  >
                    {loading ? "جاري إنشاء الطلب..." : `تأكيد الطلب - ${finalAmount.toFixed(2)} ج.م`}
                  </Button>

                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-black">
                      <Truck className="h-4 w-4" />
                      <span>الدفع عند الاستلام</span>
                    </div>
                    <p className="text-xs text-black">سيتم التواصل معك خلال 30 دقيقة لتأكيد الطلب</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </div>
    </div>
  )
}
