"use client"

import { MessageCircle } from "lucide-react"
import { useState, useEffect } from "react"

export function WhatsAppFloat() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleWhatsAppClick = () => {
    const phoneNumber = "201034207175"
    const message = encodeURIComponent("مرحباً! أريد الاستفسار عن منتجاتكم في بيرفكتو تيب")
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

    if (typeof window !== "undefined") {
      window.open(whatsappUrl, "_blank")
    }
  }

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg z-40 transition-colors duration-200"
      aria-label="تواصل عبر الواتساب"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  )
}
