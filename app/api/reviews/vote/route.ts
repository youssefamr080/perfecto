import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// بسيط: حد معدّل داخل ذاكرة العملية (قد يعاد تشغيله على السيرفر عديم الحالة)
// المفتاح: userId|ip لكل دقيقة
const rateBucket = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30 // 30 طلب/دقيقة لكل مستخدم/آي بي

function rateLimit(key: string): boolean {
  const now = Date.now()
  const entry = rateBucket.get(key)
  if (!entry || now > entry.resetAt) {
    rateBucket.set(key, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count < RATE_LIMIT) {
    entry.count += 1
    return true
  }
  return false
}

export async function POST(request: NextRequest) {
  try {
    const { reviewId, voteType } = await request.json()
    // اشتقاق هوية المستخدم من الهيدر (بديل بسيط لحين اعتماد جلسة فعلية)
    const userId = request.headers.get('x-user-id') || ''
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
  const authHeader = request.headers.get('authorization') || ''

    if (!reviewId || !voteType || !userId) {
      return NextResponse.json(
        { success: false, error: 'Review ID, vote type, and user ID are required' },
        { status: 400 }
      )
    }

    if (!['helpful', 'not_helpful'].includes(voteType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vote type' },
        { status: 400 }
      )
    }

    // Rate limit
    const ok = rateLimit(`${userId}|${ip}`)
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please slow down.' },
        { status: 429 }
      )
    }

  // استخدام عميل الخدمة لتجاوز RLS (مع تحقق بسيط من المستخدم)
  const adminClient = getServiceSupabase()
    if (process.env.NODE_ENV === 'production' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Vote API misconfig: SUPABASE_SERVICE_ROLE_KEY not set in production')
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration' },
        { status: 500 }
      )
    }

    // مساران: (1) مفتاح خدمة متاح => استخدام صلاحيات الخدمة. (2) لا يوجد => استخدم توكن المستخدم.
    let actor: 'service' | 'userToken' = 'service'
    let userScopedClient: ReturnType<typeof createClient> | null = null

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // بناء عميل مستخدم باستخدام توكن Authorization
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      if (authHeader.toLowerCase().startsWith('bearer ') && supabaseUrl && supabaseAnonKey) {
        userScopedClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: authHeader } },
          auth: { persistSession: false, autoRefreshToken: false }
        })
        actor = 'userToken'
      } else if (process.env.NODE_ENV !== 'production') {
        // في التطوير بدون توكن ولا مفتاح خدمة
        return NextResponse.json(
          { success: false, error: 'Unauthorized: missing user token' },
          { status: 401 }
        )
      }
    }

    let effectiveUserId = userId
    if (actor === 'service') {
      // تحقق من المستخدم من auth (مصدر الحقيقة) عبر Admin API
      const { data: authUser } = await adminClient.auth.admin.getUserById(userId)
      if (!authUser?.user) {
        return NextResponse.json(
          { success: false, error: 'Invalid user' },
          { status: 401 }
        )
      }
      // تأكد من وجود صف للمستخدم في public.users
      const { error: publicUserErr } = await adminClient
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()
      if (publicUserErr && publicUserErr.code === 'PGRST116') {
        await adminClient.from('users').insert({ id: userId }).single()
      }
    } else if (userScopedClient) {
      // استخرج هوية المستخدم من التوكن
      const { data: gotUser, error: getUserErr } = await userScopedClient.auth.getUser()
      if (getUserErr || !gotUser?.user) {
        return NextResponse.json(
          { success: false, error: 'Invalid user token' },
          { status: 401 }
        )
      }
      effectiveUserId = gotUser.user.id
    }

    // البحث عن تصويت موجود
    const dbClient = actor === 'service' ? adminClient : (userScopedClient as any)
    const { data: existingVote, error: fetchError } = await dbClient
      .from('review_votes')
      .select('*')
      .eq('user_id', effectiveUserId)
      .eq('review_id', reviewId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing vote:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    let result

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // إلغاء التصويت إذا كان نفس النوع
  const { error: deleteError } = await dbClient
          .from('review_votes')
          .delete()
          .eq('id', existingVote.id)

        if (deleteError) {
          console.error('Error deleting vote:', deleteError)
          return NextResponse.json(
            { success: false, error: 'Failed to remove vote' },
            { status: 500 }
          )
        }

        result = { action: 'removed', voteType: null }
      } else {
        // تغيير نوع التصويت
  const { error: updateError } = await dbClient
          .from('review_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)

        if (updateError) {
          console.error('Error updating vote:', updateError)
          return NextResponse.json(
            { success: false, error: 'Failed to update vote' },
            { status: 500 }
          )
        }

        result = { action: 'updated', voteType }
      }
    } else {
      // إضافة تصويت جديد
    const { error: insertError } = await dbClient
        .from('review_votes')
        .insert([{
      user_id: effectiveUserId,
          review_id: reviewId,
          vote_type: voteType
        }])

      if (insertError) {
        console.error('Error inserting vote:', insertError)
        return NextResponse.json(
          { success: false, error: 'Failed to add vote' },
          { status: 500 }
        )
      }

      result = { action: 'added', voteType }
    }

  let updatedReview: any = null
  let reviewError: any = null
  if (actor === 'service') {
    const { data, error } = await adminClient
      .from('product_reviews')
      .select('helpful_count, not_helpful_count')
      .eq('id', reviewId)
      .single()
    updatedReview = data
    reviewError = error
  } else {
    // احسب الإحصائيات من جدول الأصوات لتجنب مشاكل RLS على product_reviews
    const { count: helpfulCount } = await dbClient
      .from('review_votes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId)
      .eq('vote_type', 'helpful')
    const { count: notHelpfulCount } = await dbClient
      .from('review_votes')
      .select('*', { count: 'exact', head: true })
      .eq('review_id', reviewId)
      .eq('vote_type', 'not_helpful')
    updatedReview = { helpful_count: helpfulCount || 0, not_helpful_count: notHelpfulCount || 0 }
    reviewError = null
  }

    if (reviewError) {
      console.error('Error fetching updated review stats:', reviewError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch updated stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      ...result,
      stats: {
        helpful_count: updatedReview.helpful_count || 0,
        not_helpful_count: updatedReview.not_helpful_count || 0
      }
    })

  } catch (error) {
    console.error('Vote API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')
    const userId = searchParams.get('userId')
    
  if (!reviewId || !userId) {
      return NextResponse.json(
    { success: false, error: 'Review ID and User ID are required' },
        { status: 400 }
      )
    }

  const adminClient = getServiceSupabase()
  // جلب تصويت المستخدم الحالي
  const { data: userVote, error: voteError } = await adminClient
      .from('review_votes')
      .select('vote_type')
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .single()

  if (voteError && voteError.code !== 'PGRST116') {
      console.error('Error fetching user vote:', voteError)
      return NextResponse.json(
    { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    // جلب إحصائيات المراجعة
  const { data: reviewStats, error: statsError } = await adminClient
      .from('product_reviews')
      .select('helpful_count, not_helpful_count')
      .eq('id', reviewId)
      .single()

    if (statsError) {
      console.error('Error fetching review stats:', statsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch review stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userVote: userVote?.vote_type || null,
      stats: {
        helpful_count: reviewStats.helpful_count || 0,
        not_helpful_count: reviewStats.not_helpful_count || 0
      }
    })

  } catch (error) {
    console.error('Vote GET API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
