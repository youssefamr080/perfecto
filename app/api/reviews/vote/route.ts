import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Rate limiting for vote API
const rateBucket = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30 // 30 requests per minute per user/IP

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

    const adminClient = getServiceSupabase()
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    if (process.env.NODE_ENV === 'production' && !hasServiceKey) {
      console.error('Vote API misconfig: SUPABASE_SERVICE_ROLE_KEY not set in production')
      return NextResponse.json(
        { success: false, error: 'Server misconfiguration' },
        { status: 500 }
      )
    }

    let actor: 'service' | 'userToken' = 'service'
    let userScopedClient: ReturnType<typeof createClient> | null = null

    // Use Authorization header if available
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      userScopedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false }
      })
      actor = 'userToken'
    } else if (!hasServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: missing user token and no service key available' },
        { status: 401 }
      )
    }

    let effectiveUserId = userId
    
    // User validation for service path
    if (actor === 'service') {
  const { data: authUser } = await adminClient.auth.admin.getUserById(userId)
      if (!authUser?.user) {
        // In development, be more permissive
        if (process.env.NODE_ENV === 'development') {
          const { data: publicUser } = await adminClient
            .from('users')
            .select('id')
            .eq('id', userId)
            .single()
          
          if (!publicUser) {
            // Create user in development mode
            try {
              await adminClient.from('users').insert({ id: userId }).single()
            } catch {
              return NextResponse.json(
                { success: false, error: 'Invalid user: could not validate or create user' },
                { status: 401 }
              )
            }
          }
        } else {
          // Production: be strict
          return NextResponse.json(
            { success: false, error: 'Invalid user: not found in auth' },
            { status: 401 }
          )
        }
      } else {
        // Ensure user exists in public.users
  const { error: publicUserErr } = await adminClient
          .from('users')
          .select('id')
          .eq('id', userId)
          .single()
        
        if (publicUserErr?.code === 'PGRST116') {
          await adminClient.from('users').insert({ id: userId }).single()
        }
      }
    } else if (userScopedClient) {
      // Extract user ID from token
  const { data: gotUser } = await userScopedClient.auth.getUser()
      if (gotUser?.user?.id) {
        effectiveUserId = gotUser.user.id
      } else {
        // Fallback to JWT decode
        const raw = authHeader.replace(/^Bearer\s+/i, '')
        try {
          const parts = raw.split('.')
          if (parts.length !== 3) throw new Error('Invalid JWT format')
          const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8')
          const payload = JSON.parse(payloadJson)
          if (payload?.sub) {
            effectiveUserId = payload.sub
          } else {
            return NextResponse.json(
              { success: false, error: 'Invalid user token: no sub claim' },
              { status: 401 }
            )
          }
  } catch {
          return NextResponse.json(
            { success: false, error: 'Invalid user token: JWT decode failed' },
            { status: 401 }
          )
        }
      }
    }

    // Check for existing vote
  const dbClient = actor === 'service' ? adminClient : (userScopedClient as ReturnType<typeof createClient>)
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
        // Remove vote if same type
        const { error: deleteError } = await dbClient.rpc('delete_review_vote', {
          p_vote_id: existingVote.id
        })

        // Fallback to direct delete if RPC fails
        if (deleteError) {
          const { error: directDeleteError } = await adminClient
            .from('review_votes')
            .delete()
            .eq('id', existingVote.id)

          if (directDeleteError) {
            console.error('Error deleting vote:', directDeleteError)
            return NextResponse.json(
              { success: false, error: 'Failed to remove vote' },
              { status: 500 }
            )
          }
        }

        result = { action: 'removed', voteType: null }
      } else {
        // Update vote type
        const { error: updateError } = await dbClient.rpc('update_review_vote', {
          p_vote_id: existingVote.id,
          p_vote_type: voteType
        })

        // Fallback to direct update if RPC fails
        if (updateError) {
          const { error: directUpdateError } = await adminClient
            .from('review_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)

          if (directUpdateError) {
            console.error('Error updating vote:', directUpdateError)
            return NextResponse.json(
              { success: false, error: 'Failed to update vote' },
              { status: 500 }
            )
          }
        }

        result = { action: 'updated', voteType }
      }
    } else {
      // Insert new vote
      const { error: insertError } = await dbClient.rpc('insert_review_vote', {
        p_user_id: effectiveUserId,
        p_review_id: reviewId,
        p_vote_type: voteType
      })

      // Fallback to direct insert if RPC fails
      if (insertError) {
        const { error: directInsertError } = await adminClient
          .from('review_votes')
          .insert([{
            user_id: effectiveUserId,
            review_id: reviewId,
            vote_type: voteType
          }])

        if (directInsertError) {
          console.error('Error inserting vote:', directInsertError)
          return NextResponse.json(
            { success: false, error: 'Failed to add vote' },
            { status: 500 }
          )
        }
      }

      result = { action: 'added', voteType }
    }

    // Get updated review stats
  let updatedReview: { helpful_count: number; not_helpful_count: number } | null = null
    if (actor === 'service') {
      const { data } = await adminClient
        .from('product_reviews')
        .select('helpful_count, not_helpful_count')
        .eq('id', reviewId)
        .single()
      updatedReview = data
    } else {
      // Calculate stats from votes table to avoid RLS issues
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
      
      updatedReview = { 
        helpful_count: helpfulCount || 0, 
        not_helpful_count: notHelpfulCount || 0 
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
      stats: updatedReview
    })

  } catch (error) {
    console.error('Vote API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
