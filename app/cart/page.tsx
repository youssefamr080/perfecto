"use client"

import { useCartStore } from "@/lib/stores/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, Truck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { LOYALTY_CONFIG } from "@/lib/utils/loyaltySystem"
import { FreeShippingProgress } from "@/components/ui/free-shipping-progress"

const { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } = LOYALTY_CONFIG

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCartStore()
  const { toast } = useToast()

  const subtotal = total
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const finalTotal = subtotal + shippingFee
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity)
    if (quantity === 0) {
      toast({
        title: "تم حذف المنتج",
        description: "تم حذف المنتج من السلة",
        duration: 2000,
      })
    }
  }

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId)
    toast({
      title: "تم حذف المنتج",
      description: `تم حذف ${productName} من السلة`,
      duration: 2000,
    })
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: "تم مسح السلة",
      description: "تم حذف جميع المنتجات من السلة",
      duration: 2000,
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-16 w-16 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-4">السلة فارغة</h1>
            <p className="text-black text-lg mb-8 max-w-md mx-auto">
              لم تقم بإضافة أي منتجات للسلة بعد. ابدأ التسوق واكتشف منتجاتنا الطبيعية!
            </p>
            <Link href="/categories">
              <Button className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6">
                ابدأ التسوق الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">سلة التسوق</h1>
          <p className="text-black font-bold">
            لديك {itemCount} منتج في السلة
          </p>
        </div>

        {/* Free Shipping Progress */}
        <FreeShippingProgress currentAmount={subtotal} className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clear Cart Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-black">المنتجات ({itemCount})</h2>
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                مسح السلة
              </Button>
            </div>

            {items.map((item) => (
              <Card key={item.product.id} className="shadow-sm border-0">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0">
                      <Image
                        src={
                          item.product.images[0] ||
                          `/placeholder.svg?height=96&width=96&text=${encodeURIComponent(item.product.name) || "/placeholder.svg"}`
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.product.id}`}>
                        <h3 className="font-bold text-black text-lg mb-1 hover:text-red-600 transition-colors line-clamp-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-black text-sm font-bold mb-2 line-clamp-2">{item.product.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-bold text-lg">{item.product.price} ج.م</span>
                        <span className="text-black text-sm font-bold">{item.product.unit_description}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="h-10 w-10 p-0 hover:bg-gray-200"
                        >
                          <Minus className="h-4 w-4 text-black" />
                        </Button>
                        <span className="font-bold text-black min-w-[3rem] text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="h-10 w-10 p-0 hover:bg-gray-200"
                        >
                          <Plus className="h-4 w-4 text-black" />
                        </Button>
                      </div>

                      {/* Total Price */}
                    <div className="text-right">
                        <p className="font-bold text-xl text-black">
                          {(item.product.price * item.quantity).toFixed(2)} ج.م
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-1"
                          onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    ملخص الطلب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-lg p-3 bg-gray-50 rounded-lg">
                      <span className="font-semibold text-gray-700">المجموع الفرعي:</span>
                      <span className="font-bold text-gray-900">{subtotal.toFixed(0)} ج.م</span>
                    </div>

                    <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-semibold text-gray-700">رسوم التوصيل:</span>
                      <span className={`font-bold ${shippingFee === 0 ? "text-green-600" : "text-gray-900"}`}>
                        {shippingFee === 0 ? (
                          <span className="flex items-center gap-1">
                            <span>مجاني</span>
                            <Truck className="h-4 w-4" />
                          </span>
                        ) : (
                          `${shippingFee} ج.م`
                        )}
                      </span>
                    </div>

                    <div className="border-t-2 border-red-100 pt-4">
                      <div className="flex justify-between text-xl font-bold p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                        <span className="text-red-800">المجموع الكلي:</span>
                        <span className="text-red-800 text-2xl">{finalTotal.toFixed(0)} ج.م</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Link href="/checkout" className="block">
                      <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-lg py-6 shadow-lg transform transition-transform hover:scale-105 rounded-xl">
                        إتمام الطلب
                        <ArrowLeft className="mr-2 h-5 w-5" />
                      </Button>
                    </Link>

                    <Link href="/categories" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 bg-transparent py-4 rounded-xl transition-all duration-200"
                      >
                        متابعة التسوق
                      </Button>
                    </Link>
                  </div>

                  {/* Trust Indicators */}
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600">🛡️</span>
                        </div>
                        <span className="text-black font-bold">دفع آمن</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600">🚚</span>
                        </div>
                        <span className="text-black font-bold">توصيل سريع</span>
                      </div>
                    </div>
                    <p className="text-xs text-black font-bold text-center mt-3">
                      الدفع عند الاستلام • ضمان الجودة • إرجاع مجاني
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
