import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getServiceSupabase()
    // minimal lightweight query
    const { data, error } = await supabase.from('products').select('id').limit(1)
    if (error) throw error
    return NextResponse.json({ ok: true, products_seen: data?.length ?? 0 })
  } catch (e: unknown) {
    const message = typeof e === 'object' && e && 'message' in e ? String((e as { message?: unknown }).message) : 'db error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
