import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration
const rateLimit = new Map()

// Rate limiting function
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100 // Maximum requests per minute per IP

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    return false
  }

  const ipData = rateLimit.get(ip)
  
  if (now > ipData.resetTime) {
    // Reset the counter
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    return false
  }

  if (ipData.count >= maxRequests) {
    return true
  }

  ipData.count++
  return false
}

export function middleware(request: NextRequest) {
  // Get the IP address
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  // Check if the IP is rate limited
  if (isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // منع الوصول لمسارات الأدمن إن لم يكن هناك كوكي إثبات أدمن
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminCookie = request.cookies.get('is_admin')?.value
    if (adminCookie !== '1') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // Security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
  '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
