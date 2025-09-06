import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServiceSupabase } from '@/lib/supabase'

// Rate limiting store (in production use Redis/DB)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5 // 5 reviews per 10 minutes per user
const RATE_WINDOW = 10 * 60 * 1000 // 10 minutes

// Input validation schemas
type ReviewInput = { productId?: unknown; rating?: unknown; comment?: unknown }
const validateReviewInput = (input: ReviewInput) => {
  const { productId, rating, comment } = input || {}
  
  if (!productId || typeof productId !== 'string' || productId.length < 10) {
    return { valid: false, error: 'Invalid product ID' }
  }
  
  const r = Number(rating)
  if (!Number.isFinite(r) || r < 1 || r > 5 || !Number.isInteger(r)) {
    return { valid: false, error: 'Rating must be integer 1-5' }
  }
  
  if (typeof comment !== 'string') {
    return { valid: false, error: 'Comment must be string' }
  }
  
  const c = comment.trim()
  if (c.length < 5) {
    return { valid: false, error: 'Comment too short (min 5 chars)' }
  }
  if (c.length > 1000) {
    return { valid: false, error: 'Comment too long (max 1000 chars)' }
  }
  
  return { valid: true, rating: r, comment: c, productId }
}

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now()
  const key = `review:${userId}`
  const entry = rateLimitStore.get(key)
  
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  
  if (entry.count < RATE_LIMIT) {
    entry.count++
    return true
  }
  
  return false
}

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Parse and validate input
  let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid JSON payload' 
      }, { status: 400 })
    }

  const validation = validateReviewInput(body as ReviewInput)
    if (!validation.valid) {
      return NextResponse.json({ 
        success: false, 
        error: validation.error 
      }, { status: 400 })
    }

    const { productId, rating, comment } = validation
    const authHeader = req.headers.get('authorization') || ''
    const xUserId = req.headers.get('x-user-id') || ''

    const admin = getServiceSupabase()
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    // Authenticate user with enhanced security
    let effectiveUserId: string | null = null

    if (authHeader.toLowerCase().startsWith('bearer ')) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false }
      })
      const { data, error } = await userClient.auth.getUser()
      if (error) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid auth token' 
        }, { status: 401 })
      }
      effectiveUserId = data.user?.id || null
    }

    if (!effectiveUserId) {
      if (hasServiceKey && xUserId) {
        // Validate x-user-id format in development
        if (process.env.NODE_ENV === 'development' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(xUserId)) {
          return NextResponse.json({ 
            success: false, 
            error: 'Invalid user ID format' 
          }, { status: 400 })
        }
        effectiveUserId = xUserId
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Authentication required' 
        }, { status: 401 })
      }
    }

    // Rate limiting
    if (!checkRateLimit(effectiveUserId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Too many reviews. Please wait before submitting again.' 
      }, { status: 429 })
    }

    // Verify product exists
    const { data: product, error: productError } = await admin
      .from('products')
      .select('id, is_available')
      .eq('id', productId)
      .single()

    if (productError || !product) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 })
    }

    if (!product.is_available) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot review unavailable product' 
      }, { status: 400 })
    }

    // Ensure user exists with optimistic handling
    const { error: userError } = await admin
      .from('users')
      .select('id')
      .eq('id', effectiveUserId)
      .single()

    if (userError?.code === 'PGRST116') {
      const { error: insertError } = await admin
        .from('users')
        .insert({ id: effectiveUserId })
        .single()
      
      if (insertError) {
        console.error('Failed to create user record:', insertError)
        return NextResponse.json({ 
          success: false, 
          error: 'User setup failed' 
        }, { status: 500 })
      }
    }

    // Upsert review with transaction-like behavior
    const { data: upserted, error } = await admin
      .from('product_reviews')
      .upsert([
        {
          user_id: effectiveUserId,
          product_id: productId,
          rating: rating,
          comment: comment,
          is_approved: false,
          updated_at: new Date().toISOString()
        }
      ], { onConflict: 'user_id,product_id' })
      .select('id, rating, comment, created_at, updated_at')

    if (error) {
      console.error('Database error:', error)
      const status = error.code === '23514' ? 400 : 500
      const message = error.code === '23514' ? 'Invalid review data' : 'Database error'
      return NextResponse.json({ 
        success: false, 
        error: message 
      }, { status })
    }

    const duration = Date.now() - startTime
    console.log(`Review submission completed in ${duration}ms for user ${effectiveUserId}`)

    return NextResponse.json({ 
      success: true, 
      review: upserted?.[0] || null,
      message: 'Review submitted successfully. It will be visible after approval.'
    })
  } catch (e: unknown) {
    const duration = Date.now() - startTime
    const err = e as { message?: unknown, stack?: unknown }
    console.error('Review submission error:', { 
      error: err?.message, 
      stack: err?.stack, 
      duration 
    })
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
