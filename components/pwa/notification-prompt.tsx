"use client"
import { useEffect, useState } from "react"
import { X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotificationPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (Notification && Notification.permission === "default") {
      setTimeout(() => setShow(true), 3000)
    }
  }, [])

  const handleAllow = () => {
    Notification.requestPermission().then((perm) => {
      setShow(false)
    })
  }

  const handleDismiss = () => setShow(false)

  if (!show) return null

  return (
    <div className="fixed bottom-32 left-4 right-4 bg-white border border-gray-200 rounded-xl shadow-lg p-5 z-50 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-green-800" />
          <h3 className="font-bold text-base text-gray-800">تمكين الإشعارات</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </Button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        فعّل الإشعارات لتصلك تنبيهات الطلبات والعروض والفوري.
      </p>
      <Button onClick={handleAllow} className="bg-green-600 hover:bg-green-700 text-white w-full">
        تمكين الإشعارات
      </Button>
    </div>
  )
}