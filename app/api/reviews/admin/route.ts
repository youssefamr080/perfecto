import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Cache for admin verification (in production use Redis)
const adminCache = new Map<string, { isAdmin: boolean; expiresAt: number }>()
const ADMIN_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Enhanced admin verification with caching
async function verifyAdmin(userId: string, supabase: ReturnType<typeof getServiceSupabase>): Promise<boolean> {
  if (!userId) return false
  
  const cached = adminCache.get(userId)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.isAdmin
  }
  
  try {
    const { data: adminUser, error } = await supabase
      .from('users')
      .select('id, is_admin')
      .eq('id', userId)
      .eq('is_admin', true)
      .single()
    
    const isAdmin = !error && !!adminUser
    adminCache.set(userId, { 
      isAdmin, 
      expiresAt: Date.now() + ADMIN_CACHE_TTL 
    })
    
    return isAdmin
  } catch {
    return false
  }
}

// Rate limiting for admin actions
const adminRateLimit = new Map<string, { count: number; resetAt: number }>()
const ADMIN_RATE_LIMIT = 50 // 50 actions per minute
const ADMIN_RATE_WINDOW = 60 * 1000

const checkAdminRateLimit = (adminId: string): boolean => {
  const now = Date.now()
  const key = `admin:${adminId}`
  const entry = adminRateLimit.get(key)
  
  if (!entry || now > entry.resetAt) {
    adminRateLimit.set(key, { count: 1, resetAt: now + ADMIN_RATE_WINDOW })
    return true
  }
  
  if (entry.count < ADMIN_RATE_LIMIT) {
    entry.count++
    return true
  }
  
  return false
}

function forbid() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    const adminId = req.headers.get('x-user-id') || undefined
    if (!adminId) return forbid()

    const supabase = getServiceSupabase()
    
    // Verify admin with caching
    const isAdmin = await verifyAdmin(adminId, supabase)
    if (!isAdmin) return forbid()
    
    // Rate limiting
    if (!checkAdminRateLimit(adminId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Too many admin actions. Please slow down.' 
      }, { status: 429 })
    }

    type ApproveBody = { action: 'approve'; reviewId: string; approved?: boolean }
    type DeleteBody = { action: 'delete'; reviewId: string }
    type ReplyBody = { action: 'reply'; reviewId: string; replyText?: string }
    type AdminActionBody = ApproveBody | DeleteBody | ReplyBody

    let body: AdminActionBody
    try {
      body = await req.json() as AdminActionBody
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON payload' 
      }, { status: 400 })
    }

  const { action, reviewId } = body
  const approved = 'approved' in body ? body.approved : undefined
  const replyText = 'replyText' in body ? body.replyText : undefined

    if (!action || !reviewId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Validate reviewId format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid review ID format' 
      }, { status: 400 })
    }

    if (action === 'approve') {
  const { error } = await supabase
        .from('product_reviews')
        .update({ 
          is_approved: !!approved,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)

      if (error) {
        console.error('Approve error:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to update review' 
        }, { status: 500 })
      }

      const duration = Date.now() - startTime
      console.log(`Review ${approved ? 'approved' : 'rejected'} in ${duration}ms by admin ${adminId}`)
      
      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)
        
      if (error) {
        console.error('Delete error:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to delete review' 
        }, { status: 500 })
      }
      
      const duration = Date.now() - startTime
      console.log(`Review deleted in ${duration}ms by admin ${adminId}`)
      
      return NextResponse.json({ success: true })
    }

    if (action === 'reply') {
      const text = (replyText || '').trim()
      if (!text) {
        return NextResponse.json({ 
          success: false, 
          error: 'Reply text is required' 
        }, { status: 400 })
      }
      
      if (text.length > 1000) {
        return NextResponse.json({ 
          success: false, 
          error: 'Reply too long (max 1000 chars)' 
        }, { status: 400 })
      }
      
    const { error } = await supabase
        .from('product_reviews')
        .update({
          store_reply: text,
      store_reply_at: new Date().toISOString(),
          replied_by_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', reviewId)
        
      if (error) {
        console.error('Reply error:', error)
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to add reply' 
        }, { status: 500 })
      }
      
      const duration = Date.now() - startTime
      console.log(`Reply added in ${duration}ms by admin ${adminId}`)
      
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid action. Must be approve, delete, or reply' 
    }, { status: 400 })
    
  } catch (e: unknown) {
    const duration = Date.now() - startTime
    const err = e as { message?: unknown }
    console.error('Admin review POST error:', { 
      error: err?.message, 
      duration 
    })
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const status = url.searchParams.get('status') as 'all' | 'pending' | 'approved' | null
    const authHeader = req.headers.get('authorization') || ''
    const adminId = req.headers.get('x-user-id') || ''

    const supabase = getServiceSupabase()

    // Determine user ID via token if provided
    let effectiveUserId: string | null = null
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false }
      })
      const { data } = await userClient.auth.getUser()
      effectiveUserId = data.user?.id || null
    }
    if (!effectiveUserId) effectiveUserId = adminId || null

    if (!effectiveUserId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // Verify admin
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('id, is_admin')
      .eq('id', effectiveUserId)
      .eq('is_admin', true)
      .single()
    if (adminErr || !adminUser) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    // Fetch base reviews
  let query = supabase
      .from('product_reviews')
      .select('id, rating, comment, is_approved, created_at, store_reply, store_reply_at, replied_by_admin, user_id, product_id')
      .order('created_at', { ascending: false })

    if (status === 'pending') query = query.eq('is_approved', false)
    if (status === 'approved') query = query.eq('is_approved', true)

    const { data: baseReviews, error: reviewsErr } = await query
    if (reviewsErr) return NextResponse.json({ success: false, error: reviewsErr.message }, { status: 500 })

    const reviews = baseReviews || []
    const userIds: string[] = Array.from(
      new Set(
        reviews
          .map((r) => r.user_id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0)
      )
    )
    const productIds: string[] = Array.from(
      new Set(
        reviews
          .map((r) => r.product_id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0)
      )
    )

    // Batch fetch users and products
    const emptyOk = { data: [] as unknown[], error: null as unknown }
    const [{ data: users, error: usersErr }, { data: products, error: productsErr }] = await Promise.all([
      userIds.length ? supabase.from('users').select('id, name, phone').in('id', userIds) : Promise.resolve(emptyOk),
      productIds.length ? supabase.from('products').select('id, name, images').in('id', productIds) : Promise.resolve(emptyOk)
    ])
    if (usersErr || productsErr) return NextResponse.json({ success: false, error: 'Failed to load references' }, { status: 500 })

  type U = { id: string; name?: string | null; phone?: string | null }
  type P = { id: string; name: string; images: string[] }
  const userMap = new Map<string, U>((users as U[] || []).map((u: U) => [u.id, u]))
  const productMap = new Map<string, P>((products as P[] || []).map((p: P) => [p.id, p]))

    const merged = reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      is_approved: r.is_approved,
      created_at: r.created_at,
      store_reply: r.store_reply,
      store_reply_at: r.store_reply_at,
      replied_by_admin: r.replied_by_admin,
      user: userMap.get(r.user_id || '') || { name: 'غير معروف', phone: '' },
      product: productMap.get(r.product_id || '') || { name: 'منتج محذوف', images: ['/placeholder.jpg'] }
    }))

    // Stats
    const total = reviews.length
    const approved = reviews.filter(r => r.is_approved).length
    const pending = total - approved
    const averageRating = total > 0 ? Math.round((reviews.reduce((s, r) => s + (r.rating || 0), 0) / total) * 10) / 10 : 0
    // total products in DB (not only those with reviews)
    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      reviews: merged,
      stats: {
        total,
        pending,
        approved,
        averageRating,
        totalProducts: productCount || 0
      }
    })
  } catch (e: unknown) {
    const message = typeof e === 'object' && e && 'message' in e ? String((e as { message?: unknown }).message) : 'Server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
