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
      generator: 'youssef amr'
    };
