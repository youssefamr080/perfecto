import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, TrendingUp, Users, MessageSquare, Award } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
  pendingReviews: number
  recentReviews: number
  topRatedProducts: Array<{
    id: string
    name: string
    averageRating: number
    reviewCount: number
    image: string
  }>
  reviewGrowth: {
    thisMonth: number
    lastMonth: number
    growth: number
  }
}

export function ReviewsStats() {
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    pendingReviews: 0,
    recentReviews: 0,
    topRatedProducts: [],
    reviewGrowth: { thisMonth: 0, lastMonth: 0, growth: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Get all reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('product_reviews')
        .select('rating, is_approved, created_at, product_id')

      if (reviewsError) throw reviewsError

      const total = reviews?.length || 0
      const approved = reviews?.filter(r => r.is_approved) || []
      const pending = reviews?.filter(r => !r.is_approved).length || 0

      // Average rating calculation
      const avgRating = approved.length > 0 
        ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length 
        : 0

      // Rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      approved.forEach(review => {
        distribution[review.rating as keyof typeof distribution]++
      })

      // Recent reviews (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const recent = reviews?.filter(r => new Date(r.created_at) > sevenDaysAgo).length || 0

      // Monthly growth
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      const thisMonth = reviews?.filter(r => new Date(r.created_at) >= thisMonthStart).length || 0
      const lastMonth = reviews?.filter(r => {
        const date = new Date(r.created_at)
        return date >= lastMonthStart && date <= lastMonthEnd
      }).length || 0

      const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

      // Top rated products
      const productRatings: { [key: string]: { ratings: number[], count: number } } = {}
      approved.forEach(review => {
        if (!productRatings[review.product_id]) {
          productRatings[review.product_id] = { ratings: [], count: 0 }
        }
        productRatings[review.product_id].ratings.push(review.rating)
        productRatings[review.product_id].count++
      })

      // Get product details for top rated products
      const topProductIds = Object.entries(productRatings)
        .filter(([, data]) => data.count >= 3) // At least 3 reviews
        .map(([id, data]) => ({
          id,
          averageRating: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
          reviewCount: data.count
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5)
        .map(p => p.id)

      let topRatedProducts: any[] = []
      if (topProductIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, images')
          .in('id', topProductIds)

        topRatedProducts = products?.map(product => {
          const rating = productRatings[product.id]
          return {
            ...product,
            averageRating: rating.ratings.reduce((sum, r) => sum + r, 0) / rating.ratings.length,
            reviewCount: rating.count,
            image: product.images[0] || '/placeholder.jpg'
          }
        }).sort((a, b) => b.averageRating - a.averageRating) || []
      }

      setStats({
        totalReviews: total,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingDistribution: distribution,
        pendingReviews: pending,
        recentReviews: recent,
        topRatedProducts,
        reviewGrowth: { thisMonth, lastMonth, growth: Math.round(growth * 10) / 10 }
      })
    } catch (error) {
      console.error('Error fetching review stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, size = 'w-4 h-4') => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-sm text-gray-600 mr-1">{rating}/5</span>
    </div>
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المراجعات</p>
                <p className="text-2xl font-bold">{stats.totalReviews}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط التقييم</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.averageRating}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(stats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">في الانتظار</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">هذا الأسبوع</p>
                <p className="text-2xl font-bold text-green-600">{stats.recentReviews}</p>
                {stats.reviewGrowth.growth !== 0 && (
                  <p className={`text-xs ${stats.reviewGrowth.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.reviewGrowth.growth > 0 ? '+' : ''}{stats.reviewGrowth.growth}%
                  </p>
                )}
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              توزيع التقييمات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-left">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Rated Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              أفضل المنتجات تقييماً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topRatedProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">لا توجد منتجات بتقييمات كافية</p>
              ) : (
                stats.topRatedProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                      {index + 1}
                    </div>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <div className="flex items-center gap-2">
                        {renderStars(product.averageRating, 'w-3 h-3')}
                        <span className="text-xs text-gray-500">({product.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            نمو المراجعات الشهري
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">هذا الشهر</p>
              <p className="text-2xl font-bold text-blue-600">{stats.reviewGrowth.thisMonth}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">الشهر الماضي</p>
              <p className="text-2xl font-bold text-gray-600">{stats.reviewGrowth.lastMonth}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">النمو</p>
              <p className={`text-2xl font-bold ${stats.reviewGrowth.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.reviewGrowth.growth >= 0 ? '+' : ''}{stats.reviewGrowth.growth}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
