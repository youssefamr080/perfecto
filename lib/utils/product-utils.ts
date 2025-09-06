import { supabase } from "@/lib/supabase"

export interface ProductRating {
  average: number
  count: number
}

/**
 * Fetch the average rating and review count for a product
 */
export async function getProductRating(productId: string): Promise<ProductRating> {
  try {
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('is_approved', true)

    if (error) throw error

    if (!reviews || reviews.length === 0) {
      return { average: 0, count: 0 }
    }

  const sum = (reviews as Array<{ rating: number }>).reduce((acc, review) => acc + review.rating, 0)
    const average = sum / reviews.length

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal place
      count: reviews.length
    }
  } catch (error) {
    console.error('Error fetching product rating:', error)
    return { average: 0, count: 0 }
  }
}

/**
 * Fetch ratings for multiple products at once
 */
export async function getProductRatings(productIds: string[]): Promise<Map<string, ProductRating>> {
  try {
  const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('product_id, rating')
      .in('product_id', productIds)
      .eq('is_approved', true)

    if (error) throw error

    const ratingsMap = new Map<string, ProductRating>()

    // Initialize all products with 0 rating
    productIds.forEach(id => {
      ratingsMap.set(id, { average: 0, count: 0 })
    })

    if (reviews && (reviews as Array<{ product_id: string; rating: number }>).length > 0) {
      // Group reviews by product_id
      const groupedReviews = (reviews as Array<{ product_id: string; rating: number }>).reduce((acc, review) => {
        if (!acc[review.product_id]) {
          acc[review.product_id] = []
        }
        acc[review.product_id].push(review.rating)
        return acc
      }, {} as Record<string, number[]>)

      // Calculate averages
      Object.entries(groupedReviews).forEach(([productId, ratings]) => {
        const sum = ratings.reduce((acc, rating) => acc + rating, 0)
        const average = sum / ratings.length
        ratingsMap.set(productId, {
          average: Math.round(average * 10) / 10,
          count: ratings.length
        })
      })
    }

    return ratingsMap
  } catch (error) {
    console.error('Error fetching product ratings:', error)
    return new Map()
  }
}
