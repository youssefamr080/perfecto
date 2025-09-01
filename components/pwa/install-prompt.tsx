"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    const isInStandalone = (window.navigator as any).standalone === true
    // For iOS devices, prompt manual install instructions
    if (isIos && !isInStandalone) {
      setShowPrompt(true)
      return
    }
    // Regular PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDeferredPrompt(null)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-xl shadow-2xl p-5 z-50 md:bottom-4 md:left-auto md:right-4 md:w-96 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Download className="h-6 w-6 text-red-600" />
          <h3 className="font-bold text-base text-black">ثبّت تطبيق بيرفكتو!</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8 p-0 text-black hover:bg-gray-100">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-base text-black mb-4 leading-relaxed font-semibold">
        استمتع بتجربة أسرع وأسهل على هاتفك!
      </p>
      <div className="flex gap-2">
        {deferredPrompt ? (
          <Button onClick={handleInstall} size="lg" className="flex-1 bg-red-600 hover:bg-red-700 text-white text-lg font-bold shadow-md">
            <Download className="h-5 w-5 mr-2" /> تثبيت التطبيق
          </Button>
        ) : (
          <Button disabled size="lg" className="flex-1 bg-green-600 text-white text-lg font-bold">
            اضغط زر المشاركة ثم اختر "Add to Home Screen"
          </Button>
        )}
        <Button onClick={handleDismiss} variant="outline" size="lg" className="text-black border-gray-300 bg-white hover:bg-gray-100">
          لاحقاً
        </Button>
      </div>
    </div>
  )
}
