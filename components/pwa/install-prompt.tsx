"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const DISMISS_KEY = 'pwa_install_dismissed_until'

  useEffect(() => {
    // Respect recent dismissal
    try {
      const until = localStorage.getItem(DISMISS_KEY)
      if (until && Date.now() < Number(until)) {
        return
      }
    } catch {}

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
    // Don't show again for 7 days
    try {
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      localStorage.setItem(DISMISS_KEY, String(Date.now() + sevenDays))
    } catch {}
  }

  if (!showPrompt) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-3 left-3 right-3 md:bottom-4 md:left-auto md:right-4 bg-white/95 backdrop-blur border border-gray-200 rounded-lg md:rounded-xl shadow-xl p-3 md:p-4 z-50 md:w-96 animate-fade-in pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
          <h3 className="font-bold text-sm md:text-base text-black">ثبّت تطبيق بيرفكتو</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-7 w-7 p-0 text-black hover:bg-gray-100">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs md:text-sm text-black/80 mb-3 leading-relaxed font-medium">
        تجربة أسرع وأسهل على هاتفك.
      </p>
      <div className="flex gap-2">
        {deferredPrompt ? (
          <Button
            onClick={handleInstall}
            size="sm"
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-bold shadow-sm md:shadow-md md:h-10"
            aria-label="تثبيت التطبيق"
          >
            <Download className="h-4 w-4 mr-2" /> تثبيت
          </Button>
        ) : (
          <Button disabled size="sm" className="flex-1 bg-green-600 text-white text-xs md:text-sm font-bold md:h-10">
            iOS: مشاركة ← Add to Home Screen
          </Button>
        )}
        <Button
          onClick={handleDismiss}
          variant="outline"
          size="sm"
          className="text-black border-gray-300 bg-white hover:bg-gray-100 text-xs md:text-sm md:h-10"
        >
          لاحقاً
        </Button>
      </div>
    </div>
  )
}
