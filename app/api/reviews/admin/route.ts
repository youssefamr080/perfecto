import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

function forbid() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
}

export async function POST(req: NextRequest) {
  try {
  const adminId = req.headers.get('x-user-id') || undefined
  if (!adminId) return forbid()

    const body = await req.json()
    const { action, reviewId, approved, replyText } = body as {
      action: 'approve' | 'delete' | 'reply'
      reviewId: string
      approved?: boolean
      replyText?: string
    }

    if (!action || !reviewId) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Verify admin against DB
    const { data: adminUser, error: adminErr } = await supabase
      .from('users')
      .select('id, is_admin')
      .eq('id', adminId)
      .eq('is_admin', true)
      .single()
    if (adminErr || !adminUser) return forbid()

    if (action === 'approve') {
      const { error } = await supabase
        .from('product_reviews')
        .update({ is_approved: !!approved })
        .eq('id', reviewId)

      if (error) {
        console.error('Approve error', error)
        return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'delete') {
      const { error } = await supabase.from('product_reviews').delete().eq('id', reviewId)
      if (error) {
        console.error('Delete error', error)
        return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (action === 'reply') {
      const text = (replyText || '').trim()
      if (!text) {
        return NextResponse.json({ success: false, error: 'Empty reply' }, { status: 400 })
      }
      const { error } = await supabase
        .from('product_reviews')
        .update({
          store_reply: text,
          store_reply_at: new Date().toISOString(),
          replied_by_admin: true,
        })
        .eq('id', reviewId)
      if (error) {
        console.error('Reply error', error)
        return NextResponse.json({ success: false, error: 'Failed to add reply' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 })
  } catch (e) {
    console.error('Admin review POST error', e)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
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
    const userIds = Array.from(new Set(reviews.map(r => r.user_id).filter(Boolean)))
    const productIds = Array.from(new Set(reviews.map(r => r.product_id).filter(Boolean)))

    // Batch fetch users and products
    const [{ data: users, error: usersErr }, { data: products, error: productsErr }] = await Promise.all([
      userIds.length ? supabase.from('users').select('id, name, phone').in('id', userIds) : Promise.resolve({ data: [], error: null } as any),
      productIds.length ? supabase.from('products').select('id, name, images').in('id', productIds) : Promise.resolve({ data: [], error: null } as any)
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
      user: userMap.get(r.user_id) || { name: 'غير معروف', phone: '' },
      product: productMap.get(r.product_id) || { name: 'منتج محذوف', images: ['/placeholder.jpg'] }
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
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 })
  }
}
