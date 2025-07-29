"use client"

import { useCartStore } from "@/lib/stores/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

const SHIPPING_FEE = 15
const FREE_SHIPPING_THRESHOLD = 300

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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-16 w-16 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">السلة فارغة</h1>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">سلة التسوق</h1>
          <p className="text-gray-600">
            لديك {itemCount} منتج في السلة
            {remainingForFreeShipping > 0 && (
              <span className="text-red-600 font-medium mr-2">
                • أضف {remainingForFreeShipping.toFixed(2)} ج.م للتوصيل المجاني
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clear Cart Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">المنتجات ({itemCount})</h2>
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
                        <h3 className="font-bold text-lg mb-1 hover:text-red-600 transition-colors line-clamp-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.product.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600 font-bold text-lg">{item.product.price} ج.م</span>
                        <span className="text-gray-500 text-sm">{item.product.unit_description}</span>
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
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-bold min-w-[3rem] text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="h-10 w-10 p-0 hover:bg-gray-200"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Total Price */}
                      <div className="text-right">
                        <p className="font-bold text-xl text-red-600">
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
              <Card className="shadow-sm border-0">
                <CardHeader>
                  <CardTitle className="text-xl">ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span>المجموع الفرعي:</span>
                      <span className="font-semibold">{subtotal.toFixed(2)} ج.م</span>
                    </div>

                    <div className="flex justify-between">
                      <span>رسوم التوصيل:</span>
                      <span className={`font-semibold ${shippingFee === 0 ? "text-green-600" : ""}`}>
                        {shippingFee === 0 ? "مجاني 🚚" : `${shippingFee} ج.م`}
                      </span>
                    </div>

                    {remainingForFreeShipping > 0 && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-700 font-medium text-center">
                          💡 أضف {remainingForFreeShipping.toFixed(2)} ج.م أخرى للحصول على توصيل مجاني!
                        </p>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-xl font-bold">
                        <span>المجموع الكلي:</span>
                        <span className="text-red-600">{finalTotal.toFixed(2)} ج.م</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Link href="/checkout" className="block">
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-lg py-6 shadow-sm">
                        إتمام الطلب
                        <ArrowLeft className="mr-2 h-5 w-5" />
                      </Button>
                    </Link>

                    <Link href="/categories" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
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
                        <span className="text-gray-600">دفع آمن</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600">🚚</span>
                        </div>
                        <span className="text-gray-600">توصيل سريع</span>
                      </div>
                    </div>
                    <p className="text-xs text-black text-center mt-3">
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
