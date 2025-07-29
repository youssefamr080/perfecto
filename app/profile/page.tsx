"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { User, Phone, MapPin, Gift, ShoppingBag, Star } from "lucide-react"

export default function ProfilePage() {
  const { state: authState, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  })

  useEffect(() => {
    if (!authState.isAuthenticated) {
      router.push("/")
      return
    }

    if (authState.user) {
      setFormData({
        name: authState.user.name || "",
        phone: authState.user.phone || "",
        address: authState.user.address || "",
        email: authState.user.email || "",
      })
    }
  }, [authState, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateUser(formData)
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بياناتك الشخصية",
      })
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!authState.user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">الملف الشخصي</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Stats */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                معلومات العضوية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="font-bold text-lg">{authState.user.name}</h3>
                <p className="text-gray-600">{authState.user.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                  <p className="font-bold text-blue-600">{authState.user.total_orders || 0}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Gift className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">نقاط الولاء</p>
                  <p className="font-bold text-green-600">{authState.user.loyalty_points || 0}</p>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                <Star className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">إجمالي المبلغ المنفق</p>
                <p className="font-bold text-yellow-600">{(authState.user.total_spent || 0).toFixed(2)} ج.م</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>نقاط الولاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <Badge className="text-lg px-4 py-2 bg-green-600">{authState.user.loyalty_points || 0} نقطة</Badge>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• كل 1 جنيه = 1 نقطة</p>
                <p>• كل 100 نقطة = 1 جنيه خصم</p>
                <p>• 1500 نقطة = توصيل مجاني</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>تعديل البيانات الشخصية</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      الاسم الكامل
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="text-right"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      رقم الهاتف
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="text-right"
                      dir="ltr"
                      disabled
                    />
                    <p className="text-xs text-black mt-1">لا يمكن تغيير رقم الهاتف</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="text-right"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    العنوان بالتفصيل
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="text-right min-h-[100px]"
                    placeholder="أدخل عنوانك بالتفصيل (المنطقة، الشارع، رقم المبنى، الدور، الشقة)"
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? "جاري التحديث..." : "حفظ التغييرات"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
