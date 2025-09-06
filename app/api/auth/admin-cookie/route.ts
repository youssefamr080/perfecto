import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || ''
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Missing user id' }, { status: 400 })
    }

    const admin = getServiceSupabase()
    const { data, error } = await admin
      .from('users')
      .select('id')
      .eq('id', userId)
      .eq('is_admin', true)
      .single()

    if (error || !data) {
      // لا تسرّب التفاصيل
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set('is_admin', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    })
    return res
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('is_admin', '', { path: '/', maxAge: 0 })
  return res
}
