/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'iekthsayqhsqywlpaapc.supabase.co' },
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
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' }
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'max-age=0, must-revalidate' },
        ],
      },
    ]
  }
}

export default nextConfig
