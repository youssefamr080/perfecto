"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Phone, User, MapPin } from "lucide-react"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, isLoading } = useAuthStore()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    address: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      console.log("🚀 بدء تسجيل الدخول من المكون...")
      const result = await login(formData.phone, formData.name, formData.address)

      console.log("📤 نتيجة تسجيل الدخول:", result)

      if (result.success) {
        toast({
          title: "مرحباً بك! 🎉",
          description: result.message,
          duration: 3000,
        })
        onClose()
        setFormData({ phone: "", name: "", address: "" })
      } else {
        console.error("❌ فشل تسجيل الدخول:", result.message)
        toast({
          title: "خطأ في تسجيل الدخول",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("💥 خطأ في المكون:", error)
      toast({
        title: "خطأ",
        description: `حدث خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير محدد'}`,
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-2 border-red-100">
        <DialogHeader className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-t-lg -mx-6 -mt-6 mb-4">
          <DialogTitle className="text-center text-2xl font-bold text-red-700">مرحباً بك في بيرفكتو تيب</DialogTitle>
          <DialogDescription className="text-center text-gray-700 mt-2 font-medium">
            سجل دخولك للاستمتاع بتجربة تسوق مميزة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-2 rounded-lg">
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <Phone className="h-4 w-4 text-red-600" />
                رقم الهاتف <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="01xxxxxxxxx"
                className="text-right border-red-300 focus:border-red-500 focus:ring-red-500 bg-white text-gray-900 font-medium"
                dir="ltr"
              />
              <p className="text-xs text-gray-600 mt-1">يجب أن يكون 11 رقم على الأقل</p>
            </div>

            <div>
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <User className="h-4 w-4 text-red-600" />
                الاسم الكامل <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسمك الكامل"
                className="text-right border-red-300 focus:border-red-500 focus:ring-red-500 bg-white text-gray-900 font-medium"
              />
              <p className="text-xs text-gray-600 mt-1">حرفين على الأقل</p>
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2 text-sm font-bold text-gray-800">
                <MapPin className="h-4 w-4 text-red-600" />
                العنوان بالتفصيل <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                placeholder="أدخل عنوانك بالتفصيل (المنطقة، الشارع، رقم المبنى، الدور، الشقة)"
                className="text-right min-h-[80px] border-red-300 focus:border-red-500 focus:ring-red-500 bg-white text-gray-900 font-medium"
                rows={3}
              />
              <p className="text-xs text-gray-600 mt-1">10 أحرف على الأقل للعنوان المفصل</p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-lg py-6 shadow-sm"
            disabled={isLoading || !formData.phone || !formData.name || !formData.address}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري تسجيل الدخول...
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </Button>

          <div className="text-center space-y-2 bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700 font-medium">بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">🛡️ دفع آمن</span>
              <span className="flex items-center gap-1">🚚 توصيل مجاني</span>
              <span className="flex items-center gap-1">🎁 نقاط ولاء</span>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
