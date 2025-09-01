import { Star, ThumbsUp, ThumbsDown, Flag, User, Verified, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    isVerified?: boolean
  }
  helpful?: number
  notHelpful?: number
  isHelpful?: boolean
  isVerifiedPurchase?: boolean
}

interface EnhancedReviewDisplayProps {
  reviews: Review[]
  onHelpfulClick?: (reviewId: string, helpful: boolean) => void
  onReportClick?: (reviewId: string) => void
}

export function EnhancedReviewDisplay({ 
  reviews, 
  onHelpfulClick, 
  onReportClick 
}: EnhancedReviewDisplayProps) {

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
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-500 text-lg mb-2">لا توجد مراجعات بعد</div>
        <div className="text-gray-400 text-sm">كن أول من يكتب مراجعة لهذا المنتج</div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="border border-gray-200 hover:shadow-lg transition-all duration-200 bg-white mx-1 sm:mx-0">
          <CardContent className="p-3 sm:p-6">
            {/* Header with user info and rating */}
            <div className="flex flex-col gap-3 mb-3 sm:mb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <Avatar className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-gray-100">
                    <AvatarImage src={review.user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-red-100 to-red-200 text-red-700 font-semibold text-xs sm:text-sm">
                      <User className="w-3 h-3 sm:w-5 sm:h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-xs sm:text-base truncate">{review.user.name}</h4>
                      {review.user.isVerified && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200 px-1 py-0">
                          <Verified className="w-2 h-2 sm:w-3 sm:h-3 ml-1" />
                          <span className="hidden sm:inline">موثق</span>
                        </Badge>
                      )}
                      {review.isVerifiedPurchase && (
                        <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50 px-1 py-0">
                          <span className="hidden sm:inline">مشتري موثق</span>
                          <span className="sm:hidden">✓</span>
                        </Badge>
                      )}
                    </div>
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
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 sm:p-2"
                >
                  <Flag className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            {/* Review content */}
            <div className="mb-3 sm:mb-4">
              <p className="text-gray-800 leading-relaxed text-sm sm:text-base bg-gray-50 p-2 sm:p-3 rounded-lg border-r-4 border-red-200">
                {review.comment}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onHelpfulClick?.(review.id, true)}
                  className={`text-xs sm:text-sm transition-all duration-200 px-2 sm:px-3 py-1 sm:py-2 ${
                    review.isHelpful === true 
                      ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                      : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  <span className="hidden sm:inline">مفيد</span> ({review.helpful || 0})
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onHelpfulClick?.(review.id, false)}
                  className={`text-xs sm:text-sm transition-all duration-200 px-2 sm:px-3 py-1 sm:py-2 ${
                    review.isHelpful === false 
                      ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  <span className="hidden sm:inline">غير مفيد</span> ({review.notHelpful || 0})
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
