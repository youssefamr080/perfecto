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

  const isFormValid = () => {
    return (
      formData.phone.length === 11 &&
      /^[0-9]+$/.test(formData.phone) &&
      formData.name.trim().length >= 2 &&
      formData.address.trim().length >= 10
    )
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
      <DialogContent className="w-full h-[100dvh] max-w-none m-0 p-0 bg-white overflow-auto border-0 rounded-none sm:rounded-lg sm:h-auto sm:max-w-md sm:m-4">
        <div className="sticky top-0 bg-red-600 text-white p-4 z-10">
          <DialogTitle className="text-center text-xl font-bold">تسجيل الدخول</DialogTitle>
          <DialogDescription className="text-center text-red-100 mt-1 text-sm">
            أدخل بياناتك للمتابعة
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-4 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <Phone className="h-4 w-4 text-red-600" />
                رقم الهاتف *
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="01xxxxxxxxx"
                className="text-right border-gray-300 focus:border-red-500 focus:ring-red-500 h-12 text-lg"
                dir="ltr"
                pattern="[0-9]{11}"
                maxLength={11}
              />
              {formData.phone && formData.phone.length < 11 && (
                <p className="text-xs text-red-500 mt-1">يجب أن يكون 11 رقم</p>
              )}
            </div>

            <div>
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <User className="h-4 w-4 text-red-600" />
                الاسم الكامل *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسمك الكامل"
                className="text-right border-gray-300 focus:border-red-500 focus:ring-red-500 h-12 text-lg"
                minLength={2}
              />
              {formData.name && formData.name.length < 2 && (
                <p className="text-xs text-red-500 mt-1">حرفين على الأقل</p>
              )}
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                <MapPin className="h-4 w-4 text-red-600" />
                العنوان *
              </Label>
              <Textarea
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                placeholder="المنطقة، الشارع، رقم المبنى"
                className="text-right min-h-[80px] border-gray-300 focus:border-red-500 focus:ring-red-500 text-lg resize-none"
                minLength={10}
                rows={3}
              />
              {formData.address && formData.address.length < 10 && (
                <p className="text-xs text-red-500 mt-1">10 أحرف على الأقل</p>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-4 pb-4">
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-lg py-4 font-semibold"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري التسجيل...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
