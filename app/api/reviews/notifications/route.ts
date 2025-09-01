import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function forbid() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
}

async function assertAdmin(req: NextRequest, supabase = getServiceSupabase()) {
  const adminId = req.headers.get('x-user-id') || undefined
  if (!adminId) return false
  const { data } = await supabase
    .from('users')
    .select('id, is_admin')
    .eq('id', adminId)
    .eq('is_admin', true)
    .single()
  return Boolean(data)
}

export async function GET(req: NextRequest) {
  const supabase = getServiceSupabase()
  const isAdmin = await assertAdmin(req, supabase)
  if (!isAdmin) return forbid()

  const { data, error } = await supabase
    .from('review_notifications')
    .select(`id, type, read, created_at, review:review_id(
      id, rating, comment, created_at,
      users!user_id(name),
      products!product_id(name, images)
    )`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

export async function PATCH(req: NextRequest) {
  const supabase = getServiceSupabase()
  const isAdmin = await assertAdmin(req, supabase)
  if (!isAdmin) return forbid()

  const { id, read } = await req.json()
  if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 })
  const { error } = await supabase
    .from('review_notifications')
    .update({ read: read ?? true })
    .eq('id', id)
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
