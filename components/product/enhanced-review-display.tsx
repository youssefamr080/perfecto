"use client"
import { getSupabaseClient } from "@/lib/supabase"
import { Star, ThumbsUp, ThumbsDown, Flag, User, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistance } from "date-fns"
import { ar } from "date-fns/locale"

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  user: {
    name: string
    avatar?: string
  }
  helpful_count?: number
  not_helpful_count?: number
  isHelpful?: boolean
  store_reply?: string
  store_reply_at?: string
  is_verified_purchase?: boolean
  flagged_count?: number
  is_featured?: boolean
}

interface EnhancedReviewDisplayProps {
  reviews: Review[]
  onHelpfulClick?: (reviewId: string, helpful: boolean) => void
  onReportClick?: (reviewId: string) => void
  currentUserId?: string
}

export function EnhancedReviewDisplay({ 
  reviews, 
  onHelpfulClick, 
  onReportClick,
  currentUserId 
}: EnhancedReviewDisplayProps) {
  const supabaseClient = getSupabaseClient()

  const handleVoteClick = async (reviewId: string, voteType: 'helpful' | 'not_helpful') => {
    if (!currentUserId) {
      // إظهار رسالة تسجيل الدخول
      alert('يجب تسجيل الدخول للتصويت على المراجعات')
      return
    }

    try {
      // إذا قام المكون الأب بتمرير معالج، نفوض إليه لمنع الازدواجية
      if (onHelpfulClick) {
        onHelpfulClick(reviewId, voteType === 'helpful')
        return
      }

      const session = await supabaseClient.auth.getSession()
      const token = session.data.session?.access_token
      
      // إذا لم نحصل على token، جرّب الحصول على المستخدم مباشرة
      if (!token) {
        const { data: user, error: userError } = await supabaseClient.auth.getUser()
        
        if (!user.user) {
          alert('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.')
          return
        }
      }

      const response = await fetch('/api/reviews/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
          ...(token ? { 'authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          reviewId,
          voteType,
        })
      })

      const result = await response.json()

      if (result.success) {
        // يمكن إضافة تحديث محلي بسيط عند عدم وجود معالج أب
      } else {
        console.error('Vote failed:', result.error)
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const renderStars = (rating: number, size = 'w-4 h-4') => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg mx-1 sm:mx-0">
        <div className="text-gray-500 text-sm sm:text-lg mb-2">لا توجد مراجعات بعد</div>
        <div className="text-gray-400 text-xs sm:text-sm">كن أول من يكتب مراجعة لهذا المنتج</div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="border border-gray-200 hover:shadow-md transition-all duration-200 bg-white mx-1 sm:mx-0">
          <CardContent className="p-3 sm:p-4">
            {/* Header with user info and rating */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border border-gray-200">
                  <AvatarImage src={review.user.avatar} />
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-xs sm:text-sm">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate mb-1">{review.user.name}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    {renderStars(review.rating, 'w-3 h-3 sm:w-4 sm:h-4')}
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-2 h-2 sm:w-3 sm:h-3" />
                      {formatDistance(new Date(review.created_at), new Date(), { 
                        addSuffix: true, 
                        locale: ar 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Report button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReportClick?.(review.id)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1"
              >
                <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>

            {/* Review content */}
            <div className="mb-3">
              <p className="text-gray-800 leading-relaxed text-xs sm:text-sm bg-gray-50 p-2 sm:p-3 rounded border-r-2 border-red-200">
                {review.comment}
              </p>
            </div>

            {/* Store Reply */}
            {review.store_reply && (
              <div className="mb-3">
                <div className="bg-blue-50 border-r-4 border-blue-500 p-2 sm:p-3 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/logo.png" alt="المتجر" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full" />
                    <span className="text-xs sm:text-sm font-semibold text-blue-800">رد المتجر</span>
                    <span className="text-xs text-blue-600">
                      {review.store_reply_at && formatDistance(new Date(review.store_reply_at), new Date(), { 
                        addSuffix: true, 
                        locale: ar 
                      })}
                    </span>
                  </div>
                  <p className="text-blue-900 text-xs sm:text-sm leading-relaxed">{review.store_reply}</p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVoteClick(review.id, 'helpful')}
                  className={`text-xs transition-all duration-200 px-2 py-1 h-auto ${
                    review.isHelpful === true 
                      ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                      : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3 ml-1" />
                  مفيد ({review.helpful_count || 0})
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVoteClick(review.id, 'not_helpful')}
                  className={`text-xs transition-all duration-200 px-2 py-1 h-auto ${
                    review.isHelpful === false 
                      ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3 ml-1" />
                  ({review.not_helpful_count || 0})
                </Button>
              </div>

              {/* Rating display on mobile */}
              <div className="sm:hidden">
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700">
                  <span>{review.rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
