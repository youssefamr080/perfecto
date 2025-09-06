import type React from "react"
import ClientLayout from "./ClientLayout"
import "./globals.css"
import { Noto_Sans_Arabic, Tajawal, Amiri } from "next/font/google"

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-arabic",
})
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-tajawal",
})
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-amiri",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
  {/* PWA iOS integration */}
  <link rel="apple-touch-icon" href="/icon-192x192.png" />
  {/* Deprecated on some platforms; retain only if needed for iOS < 11 */}
  {/* <meta name="apple-mobile-web-app-capable" content="yes" /> */}
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Perfecto" />
  {/* iOS splash screens (example for iPhone SE) */}
  <link rel="apple-touch-startup-image" href="/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
      </head>
  <body className={`${notoSansArabic.className} ${tajawal.variable} ${amiri.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

export const metadata = {
  title: {
    default: 'بيرفكتو - منتجات طبيعية وجودة عالية',
    template: '%s | بيرفكتو',
  },
  description: 'تسوق منتجات طبيعية عالية الجودة مع توصيل سريع ونقاط ولاء.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://perfecto.example.com'),
  applicationName: 'Perfecto',
  generator: 'youssef amr',
  referrer: 'origin-when-cross-origin',
  keywords: ['بيرفكتو', 'منتجات طبيعية', 'لانشون', 'جبنة', 'عسل', 'توصيل'],
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    siteName: 'بيرفكتو',
    title: 'بيرفكتو - منتجات طبيعية وجودة عالية',
    description: 'تسوق منتجات طبيعية عالية الجودة مع توصيل سريع ونقاط ولاء.',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'بيرفكتو' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بيرفكتو - منتجات طبيعية وجودة عالية',
    description: 'تسوق منتجات طبيعية عالية الجودة مع توصيل سريع ونقاط ولاء.',
    images: ['/icon-512.png'],
  },
  alternates: {
    canonical: '/',
  },
}
