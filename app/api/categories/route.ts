import { NextResponse } from 'next/server'
import { getSubCategoriesWithProductCounts } from '@/lib/categories-with-products'

export async function GET() {
  try {
    const categories = await getSubCategoriesWithProductCounts()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
