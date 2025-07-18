import { NextRequest, NextResponse } from 'next/server'
import { getMainCategoriesWithSubs } from '@/lib/categories-with-products'

export async function GET() {
  try {
    const mainCategories = await getMainCategoriesWithSubs()
    return NextResponse.json(mainCategories)
  } catch (error) {
    console.error('Error fetching main categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch main categories' },
      { status: 500 }
    )
  }
}
