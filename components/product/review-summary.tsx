import { useState, useEffect } from 'react'
import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { supabase } from "@/lib/supabase"

interface ReviewSummaryProps {
  productId: string
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
}

export function ReviewSummary({ productId }: ReviewSummaryProps) {
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [productId])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('rating, is_approved')
        .eq('product_id', productId)
        .eq('is_approved', true)

      if (error) throw error

      const total = reviews.length
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
      const avgRating = total > 0 ? sum / total : 0

      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      reviews.forEach(review => {
        distribution[review.rating as keyof typeof distribution]++
      })

      setStats({
        totalReviews: total,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingDistribution: distribution
      })
    } catch (error) {
      console.error('Error fetching review stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, showNumber = true) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      {showNumber && <span className="text-sm font-medium text-gray-900 mr-2">{rating}</span>}
    </div>
  )

  const getPercentage = (count: number) => {
    return stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0
  }

  if (loading) {
    return (
      <Card className="mx-1 sm:mx-0">
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (stats.totalReviews === 0) {
    return (
      <Card className="mx-1 sm:mx-0">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="text-gray-500 text-sm sm:text-base mb-2">لا توجد مراجعات بعد</div>
          <div className="text-gray-400 text-xs sm:text-sm">كن أول من يكتب مراجعة!</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-1 sm:mx-0">
      <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
        <CardTitle className="text-sm sm:text-lg text-gray-900">تقييم العملاء</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        {/* Overall Rating */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
          <div className="text-center sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.averageRating}</div>
            <div className="flex justify-center sm:justify-start mt-1">
              {renderStars(stats.averageRating, false)}
            </div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1">
              {stats.totalReviews} مراجعة
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1 w-12 sm:w-16">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-gray-900 font-medium">{rating}</span>
              </div>
              <div className="flex-1">
                <Progress 
                  value={getPercentage(stats.ratingDistribution[rating])} 
                  className="h-2"
                />
              </div>
              <span className="text-gray-600 w-8 sm:w-10 text-right font-medium">
                {getPercentage(stats.ratingDistribution[rating])}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
