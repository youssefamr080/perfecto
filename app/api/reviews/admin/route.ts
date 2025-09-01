import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

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
