"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
      const result = await login(formData.phone, formData.name, formData.address)

      if (result.success) {
        toast({
          title: "مرحباً بك! 🎉",
          description: result.message,
          duration: 3000,
        })
        onClose()
        setFormData({ phone: "", name: "", address: "" })
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-red-600">مرحباً بك في بيرفكتو تيب</DialogTitle>
          <p className="text-center text-gray-600 mt-2">سجل دخولك للاستمتاع بتجربة تسوق مميزة</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4 text-red-600" />
                رقم الهاتف
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="01xxxxxxxxx"
                className="text-right border-red-200 focus:border-red-500"
                dir="ltr"
              />
            </div>

            <div>
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-red-600" />
                الاسم الكامل
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسمك الكامل"
                className="text-right border-red-200 focus:border-red-500"
              />
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-red-600" />
                العنوان بالتفصيل
              </Label>
              <Textarea
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                placeholder="أدخل عنوانك بالتفصيل (المنطقة، الشارع، رقم المبنى، الدور، الشقة)"
                className="text-right min-h-[80px] border-red-200 focus:border-red-500"
                rows={3}
              />
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

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">بالمتابعة، أنت توافق على شروط الاستخدام وسياسة الخصوصية</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
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
