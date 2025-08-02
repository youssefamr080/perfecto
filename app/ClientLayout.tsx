"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { BottomNavigation } from "@/components/navigation/bottom-nav"
import { WhatsAppFloat } from "@/components/ui/whatsapp-float"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { Toaster } from "@/components/ui/toaster"
import { PerformanceOptimizer } from "@/components/performance-optimizer"
import { ErrorBoundary } from "@/components/error-boundary"
// تم حذف CartProvider
import { useAuthStore } from "@/lib/stores/auth-store"
import { useEffect, useState } from "react"

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
      <html lang="ar" dir="rtl">
        <head>
          <title>بيرفكتو تيب - متجر الأطعمة الطبيعية</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#dc2626" />
        </head>
        <body className={`${inter.className} bg-gray-50`}>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>بيرفكتو تيب - متجر الأطعمة الطبيعية</title>
        <meta
          name="description"
          content="أجود المنتجات الطبيعية 100% بدون مواد حافظة - توصيل مجاني للطلبات أكثر من 300 جنيه"
        />
        <meta name="keywords" content="طعام طبيعي، لانشون، أجبان، بسطرمة، توصيل طعام، مصر" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#dc2626" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
        <body className={`${inter.className} pb-16 md:pb-0 bg-white`}>
          <ErrorBoundary>
            <PerformanceOptimizer />
            <Header />
            <main className="min-h-screen">{children}</main>
            <BottomNavigation />
            <WhatsAppFloat />
            <InstallPrompt />
            <Toaster />
          </ErrorBoundary>
      </body>
    </html>
  )
}
