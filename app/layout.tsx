import type React from "react"
import ClientLayout from "./ClientLayout"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&family=Amiri:wght@400;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
  {/* PWA iOS integration */}
  <link rel="apple-touch-icon" href="/icon-192x192.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Perfecto" />
  {/* iOS splash screens (example for iPhone SE) */}
  <link rel="apple-touch-startup-image" href="/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'youssef amr'
    };
