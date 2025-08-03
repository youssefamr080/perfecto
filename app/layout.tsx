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
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
