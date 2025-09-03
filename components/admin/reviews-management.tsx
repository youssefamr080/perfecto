import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Star, MessageSquare, Eye, Check, X, AlertCircle, TrendingUp, Users, Clock, Reply } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Review {
  id: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
  store_reply?: string
  store_reply_at?: string
  replied_by_admin?: boolean
  user: { name: string; phone: string }
  product: { name: string; images: string[] }
}

export function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    averageRating: 0,
    totalProducts: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews('all')
  }, [])

  const fetchReviews = async (status: 'all' | 'pending' | 'approved' = 'all') => {
    try {
      const authStorage = (typeof window !== 'undefined' && localStorage.getItem('auth-storage')) ? (() => {
        try { 
          const s = JSON.parse(localStorage.getItem('auth-storage') as string); 
          return s?.state || {} 
        } catch { 
          return {} 
        }
      })() : {}
      const adminId = (authStorage as any)?.user?.id || ''
      const token = (authStorage as any)?.session?.access_token || ''

      if (!adminId) {
        toast({ 
          title: 'Authentication Error', 
          description: 'Admin ID not found. Please log in again.', 
          variant: 'destructive' 
        })
        return
      }

      const res = await fetch(`/api/reviews/admin?status=${status}`, {
        headers: {
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          'x-user-id': adminId,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      })

      if (!res.ok) {
        const errorText = await res.text()
        let errorMessage = `Server error (${res.status})`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage)
      }

      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to load reviews')
      }

      setReviews(json.reviews || [])
      setStats(json.stats || { total: 0, pending: 0, approved: 0, averageRating: 0, totalProducts: 0 })
      
    } catch (error: any) {
      console.error('Error fetching reviews:', error)
      toast({ 
        title: 'خطأ', 
        description: error.message || 'فشل في تحميل المراجعات', 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)
    }
  }

  const approveReview = async (reviewId: string, approved: boolean) => {
    try {
      const authStorage = (typeof window !== 'undefined' && localStorage.getItem('auth-storage')) ? (() => {
        try { 
          const s = JSON.parse(localStorage.getItem('auth-storage') as string); 
          return s?.state || {} 
        } catch { 
          return {} 
        }
      })() : {}
      const adminId = (authStorage as any)?.user?.id || ''
      const token = (authStorage as any)?.session?.access_token || ''

      if (!adminId) {
        toast({ 
          title: 'Authentication Error', 
          description: 'Admin session expired. Please log in again.', 
          variant: 'destructive' 
        })
        return
      }

      // Validate reviewId format
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewId)) {
        toast({ 
          title: 'Validation Error', 
          description: 'Invalid review ID format', 
          variant: 'destructive' 
        })
        return
      }

      const res = await fetch('/api/reviews/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          'x-user-id': adminId
        },
        body: JSON.stringify({ action: 'approve', reviewId, approved })
      })

      if (!res.ok) {
        const errorText = await res.text()
        let errorMessage = `Server error (${res.status})`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage)
      }

      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to update review')
      }

      // Optimistic update
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, is_approved: approved } : r
      ))
      
      toast({
        title: approved ? 'تم الموافقة' : 'تم الرفض',
        description: approved ? 'تم الموافقة على المراجعة' : 'تم رفض المراجعة'
      })
      
      // Refresh stats from server
      fetchReviews(filter)
      
    } catch (error: any) {
      console.error('Error updating review:', error)
      toast({ 
        title: 'خطأ', 
        description: error.message || 'فشل في تحديث المراجعة', 
        variant: 'destructive' 
      })
    }
  }

  const deleteReview = async (reviewId: string) => {
    try {
      const authStorage = (typeof window !== 'undefined' && localStorage.getItem('auth-storage')) ? (() => {
        try { 
          const s = JSON.parse(localStorage.getItem('auth-storage') as string); 
          return s?.state || {} 
        } catch { 
          return {} 
        }
      })() : {}
      const adminId = (authStorage as any)?.user?.id || ''
      const token = (authStorage as any)?.session?.access_token || ''

      if (!adminId) {
        toast({ 
          title: 'Authentication Error', 
          description: 'Admin session expired. Please log in again.', 
          variant: 'destructive' 
        })
        return
      }

      // Validate reviewId format
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewId)) {
        toast({ 
          title: 'Validation Error', 
          description: 'Invalid review ID format', 
          variant: 'destructive' 
        })
        return
      }

      const res = await fetch('/api/reviews/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          'x-user-id': adminId
        },
        body: JSON.stringify({ action: 'delete', reviewId })
      })

      if (!res.ok) {
        const errorText = await res.text()
        let errorMessage = `Server error (${res.status})`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage)
      }

      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to delete review')
      }

      // Optimistic update
      setReviews(prev => prev.filter(r => r.id !== reviewId))
      
      toast({ 
        title: 'تم الحذف', 
        description: 'تم حذف المراجعة بنجاح' 
      })
      
      // Refresh stats from server
      fetchReviews(filter)
      
    } catch (error: any) {
      console.error('Error deleting review:', error)
      toast({ 
        title: 'خطأ', 
        description: error.message || 'فشل في حذف المراجعة', 
        variant: 'destructive' 
      })
    }
  }

  const submitReply = async (reviewId: string) => {
    const text = replyText.trim()
    if (!text) {
      toast({ 
        title: 'خطأ', 
        description: 'يرجى كتابة رد', 
        variant: 'destructive' 
      })
      return
    }

    if (text.length > 1000) {
      toast({ 
        title: 'خطأ', 
        description: 'الرد طويل جداً (الحد الأقصى 1000 حرف)', 
        variant: 'destructive' 
      })
      return
    }

    setSubmittingReply(true)
    try {
      const authStorage = (typeof window !== 'undefined' && localStorage.getItem('auth-storage')) ? (() => {
        try { 
          const s = JSON.parse(localStorage.getItem('auth-storage') as string); 
          return s?.state || {} 
        } catch { 
          return {} 
        }
      })() : {}
      const adminId = (authStorage as any)?.user?.id || ''
      const token = (authStorage as any)?.session?.access_token || ''

      if (!adminId) {
        toast({ 
          title: 'Authentication Error', 
          description: 'Admin session expired. Please log in again.', 
          variant: 'destructive' 
        })
        return
      }

      // Validate reviewId format
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewId)) {
        toast({ 
          title: 'Validation Error', 
          description: 'Invalid review ID format', 
          variant: 'destructive' 
        })
        return
      }

      const res = await fetch('/api/reviews/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          'x-user-id': adminId
        },
        body: JSON.stringify({ action: 'reply', reviewId, replyText: text })
      })

      if (!res.ok) {
        const errorText = await res.text()
        let errorMessage = `Server error (${res.status})`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage)
      }

      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to submit reply')
      }

      // Optimistic update
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { 
          ...r, 
          store_reply: text,
          store_reply_at: new Date().toISOString(),
          replied_by_admin: true
        } : r
      ))
      
      setReplyText('')
      toast({ 
        title: 'تم الرد', 
        description: 'تم إرسال رد المتجر بنجاح' 
      })
      
      if (selectedReview?.id === reviewId) {
        setSelectedReview({
          ...selectedReview,
          store_reply: text,
          store_reply_at: new Date().toISOString(),
          replied_by_admin: true
        })
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
      toast({ title: 'خطأ', description: 'فشل في إرسال الرد', variant: 'destructive' })
    } finally {
      setSubmittingReply(false)
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return !review.is_approved
    if (filter === 'approved') return review.is_approved
    return true
  })

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-sm text-gray-600 mr-1">{rating}/5</span>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المراجعات</h2>
  <Button onClick={() => fetchReviews(filter)} variant="outline">
          تحديث
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">إجمالي المراجعات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">في الانتظار</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">معتمدة</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700 font-medium">متوسط التقييم</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
  <Tabs value={filter} onValueChange={(value: any) => { setFilter(value); fetchReviews(value) }}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">الكل ({reviews.length})</TabsTrigger>
          <TabsTrigger value="pending">في الانتظار ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">معتمدة ({stats.approved})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-700">لا توجد مراجعات في هذا القسم</p>
                </CardContent>
              </Card>
            ) : (
              filteredReviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          {/* Product Image */}
                          <img
                            src={review.product.images[0] || '/placeholder.jpg'}
                            alt={review.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">{review.product.name}</h4>
                            <p className="text-sm text-gray-700 font-medium">{review.user.name}</p>
                          </div>
                          <Badge variant={review.is_approved ? "default" : "secondary"}>
                            {review.is_approved ? 'معتمدة' : 'في الانتظار'}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          {renderStars(review.rating)}
                        </div>

                        <p className="text-gray-900 mb-3 font-medium">{review.comment}</p>

                        {/* Store Reply */}
                        {review.store_reply && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3 rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <img src="/logo.png" alt="المتجر" className="w-6 h-6 rounded-full" />
                              <span className="text-sm font-semibold text-blue-800">رد المتجر</span>
                              <span className="text-xs text-blue-600">
                                {review.store_reply_at && new Date(review.store_reply_at).toLocaleString('ar-EG')}
                              </span>
                            </div>
                            <p className="text-blue-900 text-sm">{review.store_reply}</p>
                          </div>
                        )}

                        <p className="text-xs text-gray-600 font-medium">
                          {new Date(review.created_at).toLocaleString('ar-EG')}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mr-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {!review.store_reply && review.is_approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedReview(review)
                              setReplyText('')
                            }}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Reply className="w-4 h-4" />
                          </Button>
                        )}

                        {!review.is_approved && (
                          <Button
                            size="sm"
                            onClick={() => approveReview(review.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}

                        {review.is_approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveReview(review.id, false)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteReview(review.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Detail Dialog */}
      {selectedReview && (
        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل المراجعة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedReview.product.images[0] || '/placeholder.jpg'}
                  alt={selectedReview.product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{selectedReview.product.name}</h3>
                  <p className="text-gray-600">{selectedReview.user.name}</p>
                  <p className="text-sm text-gray-500">{selectedReview.user.phone}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">التقييم</label>
                {renderStars(selectedReview.rating)}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">التعليق</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{selectedReview.comment}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">الحالة</label>
                <Badge variant={selectedReview.is_approved ? "default" : "secondary"}>
                  {selectedReview.is_approved ? 'معتمدة' : 'في الانتظار'}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">تاريخ الإنشاء</label>
                <p className="text-gray-600">
                  {new Date(selectedReview.created_at).toLocaleString('ar-EG')}
                </p>
              </div>

              {/* Store Reply Section */}
              <div>
                <label className="block text-sm font-medium mb-2">رد المتجر</label>
                {selectedReview.store_reply ? (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <img src="/logo.png" alt="المتجر" className="w-6 h-6 rounded-full" />
                      <span className="text-sm font-semibold text-blue-800">رد المتجر</span>
                      <span className="text-xs text-blue-600">
                        {selectedReview.store_reply_at && new Date(selectedReview.store_reply_at).toLocaleString('ar-EG')}
                      </span>
                    </div>
                    <p className="text-blue-900">{selectedReview.store_reply}</p>
                  </div>
                ) : selectedReview.is_approved ? (
                  <div className="space-y-3">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="اكتب رد المتجر هنا..."
                      className="min-h-[100px]"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{replyText.length}/500</span>
                      <Button 
                        onClick={() => submitReply(selectedReview.id)}
                        disabled={submittingReply || !replyText.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Reply className="w-4 h-4 ml-2" />
                        {submittingReply ? 'جاري الإرسال...' : 'إرسال الرد'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">يجب الموافقة على المراجعة أولاً للرد عليها</p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                {!selectedReview.is_approved && (
                  <Button
                    onClick={() => {
                      approveReview(selectedReview.id, true)
                      setSelectedReview(null)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 ml-2" />
                    الموافقة
                  </Button>
                )}

                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteReview(selectedReview.id)
                    setSelectedReview(null)
                  }}
                >
                  <X className="w-4 h-4 ml-2" />
                  حذف
                </Button>

                <Button variant="outline" onClick={() => setSelectedReview(null)}>
                  إغلاق
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
