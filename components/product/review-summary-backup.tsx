import { useState, useEffect } from 'react'
import { Star, TrendingUp, Users, Filter, SortDesc } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

interface ReviewSummaryProps {
  productId: string
  onFilterChange?: (filter: ReviewFilter) => void
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
  verifiedPurchases: number
  recentReviews: number
}

interface ReviewFilter {
  rating?: number
  verified?: boolean
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'
}

export function ReviewSummary({ productId, onFilterChange }: ReviewSummaryProps) {
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    verifiedPurchases: 0,
    recentReviews: 0
  })
  const [filter, setFilter] = useState<ReviewFilter>({
    sortBy: 'newest'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [productId])

  useEffect(() => {
    onFilterChange?.(filter)
  }, [filter, onFilterChange])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch all approved reviews for this product
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('rating, created_at, is_verified_purchase')
        .eq('product_id', productId)
        .eq('is_approved', true)

      if (error) throw error

      const total = reviews?.length || 0
      
      if (total === 0) {
        setStats({
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          verifiedPurchases: 0,
          recentReviews: 0
        })
        return
      }

      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      const avgRating = totalRating / total

      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      reviews.forEach(review => {
        distribution[review.rating as keyof typeof distribution]++
      })

      // Count verified purchases
      const verified = reviews.filter(r => r.is_verified_purchase).length

      // Recent reviews (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const recent = reviews.filter(r => new Date(r.created_at) > thirtyDaysAgo).length

      setStats({
        totalReviews: total,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingDistribution: distribution,
        verifiedPurchases: verified,
        recentReviews: recent
      })
    } catch (error) {
      console.error('Error fetching review stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, showNumber = true) => (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              i < Math.floor(rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-lg sm:text-xl font-bold text-gray-900">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )

  const updateFilter = (key: keyof ReviewFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilter = (key: keyof ReviewFilter) => {
    setFilter(prev => {
      const newFilter = { ...prev }
      delete newFilter[key]
      return newFilter
    })
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Card */}
      <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-red-600" />
            تقييمات العملاء
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Rating */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-center sm:text-right">
              {renderStars(stats.averageRating)}
              <p className="text-sm text-gray-600 mt-1">
                بناءً على {stats.totalReviews} مراجعة
              </p>
            </div>
            
            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats.ratingDistribution[rating] || 0
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                
                return (
                  <div key={rating} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 w-16">
                      <span className="font-medium text-gray-700">{rating}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <Progress 
                      value={percentage} 
                      className="flex-1 h-2 bg-gray-200"
                    />
                    <span className="text-gray-600 w-12 text-left">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-red-200">
            <div className="text-center bg-white rounded-lg p-3 border border-red-100">
              <div className="text-lg sm:text-xl font-bold text-red-600">
                {stats.verifiedPurchases}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                مشتري موثق
              </div>
            </div>
            
            <div className="text-center bg-white rounded-lg p-3 border border-red-100">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {stats.recentReviews}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                مراجعة حديثة
              </div>
            </div>

            <div className="text-center bg-white rounded-lg p-3 border border-red-100 col-span-2 sm:col-span-1">
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {stats.totalReviews > 0 ? Math.round((stats.verifiedPurchases / stats.totalReviews) * 100) : 0}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                نسبة التوثيق
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters Card */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            تصفية وترتيب المراجعات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                التقييم
              </label>
              <Select
                value={filter.rating?.toString() || 'all'}
                onValueChange={(value) => 
                  updateFilter('rating', value === 'all' ? undefined : parseInt(value))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="جميع التقييمات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع التقييمات</SelectItem>
                  <SelectItem value="5">5 نجوم</SelectItem>
                  <SelectItem value="4">4 نجوم</SelectItem>
                  <SelectItem value="3">3 نجوم</SelectItem>
                  <SelectItem value="2">نجمتان</SelectItem>
                  <SelectItem value="1">نجمة واحدة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Verified Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع المراجعة
              </label>
              <Select
                value={filter.verified === undefined ? 'all' : filter.verified ? 'verified' : 'unverified'}
                onValueChange={(value) => 
                  updateFilter('verified', value === 'all' ? undefined : value === 'verified')
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="جميع المراجعات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المراجعات</SelectItem>
                  <SelectItem value="verified">مشتري موثق فقط</SelectItem>
                  <SelectItem value="unverified">غير موثق</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الترتيب
              </label>
              <Select
                value={filter.sortBy}
                onValueChange={(value) => updateFilter('sortBy', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث أولاً</SelectItem>
                  <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                  <SelectItem value="highest">أعلى تقييم</SelectItem>
                  <SelectItem value="lowest">أقل تقييم</SelectItem>
                  <SelectItem value="helpful">الأكثر إفادة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(filter.rating || filter.verified !== undefined) && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">المرشحات النشطة:</span>
              
              {filter.rating && (
                <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                  {filter.rating} نجوم
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-red-200"
                    onClick={() => clearFilter('rating')}
                  >
                    ×
                  </Button>
                </Badge>
              )}

              {filter.verified !== undefined && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                  {filter.verified ? 'موثق' : 'غير موثق'}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-blue-200"
                    onClick={() => clearFilter('verified')}
                  >
                    ×
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
