import { useState } from 'react'
import { Star, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface EnhancedReviewFormProps {
  productId: string
  userId: string
  orderId?: string
  onReviewSubmitted?: () => void
}

export function EnhancedReviewForm({ 
  productId, 
  userId, 
  orderId,
  onReviewSubmitted 
}: EnhancedReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Check if form is valid
  const isButtonDisabled = submitting || rating === 0 || comment.trim().length < 5

  // Quick comment presets - shorter and more mobile-friendly
  const quickComments = [
    "ممتاز 👌",
    "جودة عالية",
    "سريع الوصول",
    "توقعت أفضل",
    "كما موضح",
    "خدمة رائعة",
    "قيمة ممتازة",
    "لا أنصح",
    "يستحق الثمن",
    "معقول",
    "مناسب جداً",
    "مفيد"
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast({
        title: "⭐ يجب اختيار التقييم أولاً!",
        description: "اضغط على النجوم أعلاه لاختيار تقييمك للمنتج قبل الإرسال",
        variant: "destructive"
      })
      return
    }

    if (comment.trim().length < 5) {
      toast({
        title: "التعليق قصير جداً",
        description: "يرجى كتابة تعليق لا يقل عن 5 أحرف",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      // Submit review
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          user_id: userId,
          product_id: productId,
          rating,
          comment: comment.trim(),
          is_approved: false // Requires admin approval
        })

      if (error) throw error

      toast({
        title: "تم إرسال المراجعة",
        description: "شكراً لك! مراجعتك في انتظار الموافقة",
      })

      // Reset form
      setRating(0)
      setComment('')
      
      onReviewSubmitted?.()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "خطأ",
        description: "فشل في إرسال المراجعة، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = () => (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => setRating(index + 1)}
          onMouseEnter={() => setHoveredRating(index + 1)}
          onMouseLeave={() => setHoveredRating(0)}
          className="transition-colors focus:outline-none"
        >
          <Star
            className={`w-6 h-6 sm:w-8 sm:h-8 ${
              index < (hoveredRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      ))}
    </div>
  )

  return (
    <Card className="border border-gray-200 bg-white shadow-sm mx-1 sm:mx-0">
      <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-gray-900 text-sm sm:text-base">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          اكتب مراجعة
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white p-3 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-gray-900">
              تقييمك للمنتج *
            </label>
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
              {renderStars()}
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {rating === 0 ? 'اختر التقييم' : `${rating} نجوم`}
              </span>
            </div>
          </div>

          {/* Quick Comments */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-gray-900">
              تعليقات سريعة (اختيارية)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2">
              {quickComments.map((preset, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setComment(preset)}
                  className="text-xs text-gray-700 hover:text-red-700 hover:border-red-300 border-gray-300 bg-white h-7 sm:h-auto py-1 sm:py-2 px-1 sm:px-3 whitespace-nowrap text-center transition-all duration-200"
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-gray-900">
              تعليقك *
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="شاركنا رأيك في المنتج..."
              className="min-h-[80px] sm:min-h-[120px] resize-none border-gray-300 focus:border-red-500 focus:ring-red-500 text-gray-900 placeholder-gray-500 bg-white text-sm sm:text-base"
              maxLength={500}
            />
            <div className="flex justify-between mt-1 sm:mt-2">
              <span className={`text-xs font-medium ${
                comment.trim().length >= 5 && rating > 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {rating === 0 
                  ? 'يجب اختيار التقييم والكتابة (5 أحرف)'
                  : comment.trim().length >= 5 
                    ? 'جاهز للإرسال ✓' 
                    : 'الحد الأدنى 5 أحرف'
                }
              </span>
              <span className="text-xs text-gray-600 font-medium">
                {comment.length}/500
              </span>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2 sm:pt-4">
            <Button
              type="submit"
              disabled={isButtonDisabled}
              className={`w-full font-semibold py-2 sm:py-3 text-sm sm:text-base transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                isButtonDisabled 
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  جاري الإرسال...
                </div>
              ) : (
                'إرسال المراجعة'
              )}
            </Button>
          </div>

          {/* Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-3 sm:mt-6">
            <p className="text-xs sm:text-sm text-blue-900 font-medium">
              <strong className="text-blue-900">ملاحظة:</strong> ستتم مراجعة تعليقك من قبل فريقنا قبل النشر. 
              نحن نقدر آراءكم الصادقة والبناءة.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
