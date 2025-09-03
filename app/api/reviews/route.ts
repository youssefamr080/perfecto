import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { productId, rating, comment } = await req.json()
    const authHeader = req.headers.get('authorization') || ''
    const xUserId = req.headers.get('x-user-id') || ''

    // Basic validation
    if (!productId || !rating || typeof comment !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }
    const r = Number(rating)
    const c = comment.trim()
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return NextResponse.json({ success: false, error: 'Invalid rating' }, { status: 400 })
    }
    if (c.length < 1) {
      return NextResponse.json({ success: false, error: 'Empty comment' }, { status: 400 })
    }

    const admin = getServiceSupabase()
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    // Figure out effective user
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

    if (!effectiveUserId) {
      if (hasServiceKey && xUserId) {
        // fall back to trusted header only if service key is present
        effectiveUserId = xUserId
      } else {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Ensure public.users row exists
    const { error: ensureErr } = await admin
      .from('users')
      .select('id')
      .eq('id', effectiveUserId)
      .single()

    if (ensureErr?.code === 'PGRST116') {
      await admin.from('users').insert({ id: effectiveUserId }).single()
    }

    // Upsert review (unique on user_id, product_id)
    const { data: upserted, error } = await admin
      .from('product_reviews')
      .upsert([
        {
          user_id: effectiveUserId,
          product_id: productId,
          rating: r,
          comment: c,
          is_approved: false,
          updated_at: new Date().toISOString()
        } as any
      ] as any, { onConflict: 'user_id,product_id' })
      .select()

    if (error) {
      const status = error.code === '23514' ? 400 : 500
      return NextResponse.json({ success: false, error: error.message }, { status })
    }

    return NextResponse.json({ success: true, review: upserted?.[0] || null })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server error' }, { status: 500 })
  }
}
