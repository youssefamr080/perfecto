"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BottomNavigation } from "@/components/navigation/bottom-nav"
import { WhatsAppFloat } from "@/components/ui/whatsapp-float"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { NotificationPrompt } from "@/components/pwa/notification-prompt"
import { Toaster } from "@/components/ui/toaster"
import { PerformanceOptimizer } from "@/components/performance-optimizer"
import { ErrorBoundary } from "@/components/error-boundary"
// تم حذف CartProvider
import { useAuthStore } from "@/lib/stores/auth-store"
import { useEffect, useState } from "react"
import { RealtimeProvider } from "@/lib/realtime-context"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const { checkAuth } = useAuthStore()

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [checkAuth])

  // Show loading until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className={`${inter.className} bg-gray-50 min-h-screen flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className={`${inter.className} pb-16 md:pb-0 bg-white`}>
      <ErrorBoundary>
        <RealtimeProvider>
          <PerformanceOptimizer />
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <BottomNavigation />
          <WhatsAppFloat />
          <InstallPrompt />
          <NotificationPrompt />
          <Toaster />
        </RealtimeProvider>
      </ErrorBoundary>
    </div>
  )
}
