import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { reviewId, voteType, userId } = await request.json()
    
    if (!reviewId || !voteType || !userId) {
      return NextResponse.json(
        { error: 'Review ID, vote type, and user ID are required' },
        { status: 400 }
      )
    }

    if (!['helpful', 'not_helpful'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      )
    }

    // البحث عن تصويت موجود
    const { data: existingVote, error: fetchError } = await supabase
      .from('review_votes')
      .select('*')
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing vote:', fetchError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    let result

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // إلغاء التصويت إذا كان نفس النوع
        const { error: deleteError } = await supabase
          .from('review_votes')
          .delete()
          .eq('id', existingVote.id)

        if (deleteError) {
          console.error('Error deleting vote:', deleteError)
          return NextResponse.json(
            { error: 'Failed to remove vote' },
            { status: 500 }
          )
        }

        result = { action: 'removed', voteType: null }
      } else {
        // تغيير نوع التصويت
        const { error: updateError } = await supabase
          .from('review_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)

        if (updateError) {
          console.error('Error updating vote:', updateError)
          return NextResponse.json(
            { error: 'Failed to update vote' },
            { status: 500 }
          )
        }

        result = { action: 'updated', voteType }
      }
    } else {
      // إضافة تصويت جديد
      const { error: insertError } = await supabase
        .from('review_votes')
        .insert([{
          user_id: userId,
          review_id: reviewId,
          vote_type: voteType
        }])

      if (insertError) {
        console.error('Error inserting vote:', insertError)
        return NextResponse.json(
          { error: 'Failed to add vote' },
          { status: 500 }
        )
      }

      result = { action: 'added', voteType }
    }

    // جلب الإحصائيات المحدثة
    const { data: updatedReview, error: reviewError } = await supabase
      .from('product_reviews')
      .select('helpful_count, not_helpful_count')
      .eq('id', reviewId)
      .single()

    if (reviewError) {
      console.error('Error fetching updated review stats:', reviewError)
      return NextResponse.json(
        { error: 'Failed to fetch updated stats' },
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
      { error: 'Internal server error' },
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
        { error: 'Review ID and User ID are required' },
        { status: 400 }
      )
    }

    // جلب تصويت المستخدم الحالي
    const { data: userVote, error: voteError } = await supabase
      .from('review_votes')
      .select('vote_type')
      .eq('user_id', userId)
      .eq('review_id', reviewId)
      .single()

    if (voteError && voteError.code !== 'PGRST116') {
      console.error('Error fetching user vote:', voteError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // جلب إحصائيات المراجعة
    const { data: reviewStats, error: statsError } = await supabase
      .from('product_reviews')
      .select('helpful_count, not_helpful_count')
      .eq('id', reviewId)
      .single()

    if (statsError) {
      console.error('Error fetching review stats:', statsError)
      return NextResponse.json(
        { error: 'Failed to fetch review stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      userVote: userVote?.vote_type || null,
      stats: {
        helpful_count: reviewStats.helpful_count || 0,
        not_helpful_count: reviewStats.not_helpful_count || 0
      }
    })

  } catch (error) {
    console.error('Vote GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
