"use client"

import { useEffect } from "react"

export function PerformanceOptimizer() {
  useEffect(() => {
    // تسجيل Service Worker
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration)
            // الاستماع لرسائل التحديث من SW
            navigator.serviceWorker.addEventListener('message', (event: any) => {
              if (event?.data?.type === 'NEW_VERSION') {
                // اطلب من SW تجاوز الانتظار ثم أعد تحميل الصفحة عندما يصبح المتحكم الجديد فعالاً
                if (registration.waiting) {
                  registration.waiting.postMessage({ type: 'SKIP_WAITING' })
                }
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                  window.location.reload()
                })
              }
            })
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError)
          })
      })
    }

    // تحسين أداء الخط
    if (typeof window !== "undefined") {
      const link = document.createElement("link")
      link.rel = "preconnect"
      link.href = "https://fonts.googleapis.com"
      document.head.appendChild(link)

      const link2 = document.createElement("link")
      link2.rel = "preconnect"
      link2.href = "https://fonts.gstatic.com"
      link2.crossOrigin = "anonymous"
      document.head.appendChild(link2)
    }

    // تحسين الصور المهمة (تم تقليل القائمة لتجنب تحذيرات preload غير المستخدم)
    const criticalImages: string[] = [
      // "/banner-dairy.jpg", // مؤقتاً معطل لتجنب تحذير preload
      // "/banner-meat.jpg"   // مؤقتاً معطل لتجنب تحذير preload
    ]

    criticalImages.forEach(src => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.as = "image"
      link.href = src
      document.head.appendChild(link)
    })

    // تحسين استخدام الذاكرة
    const cleanup = () => {
      // مسح المؤقتات القديمة
      if ("caches" in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            if (name.includes("old") || name.includes("v0")) {
              caches.delete(name)
            }
          })
        })
      }
    }

    // تشغيل التنظيف بعد 5 ثوان
    const timer = setTimeout(cleanup, 5000)
    return () => clearTimeout(timer)
  }, [])

  return null
}
