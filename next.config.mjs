/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'localhost',
      'iekthsayqhsqywlpaapc.supabase.co'
    ],
    unoptimized: false,
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // تفعيل ضغط الملفات
  compress: true,
  // تحسين عمليات البناء
  poweredByHeader: false,
  // تحسين استخدام الذاكرة
  swcMinify: true,
  // إزالة console.log في الإنتاج
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false
  }
}

export default nextConfig
