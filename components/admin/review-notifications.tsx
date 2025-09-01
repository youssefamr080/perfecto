import { useState, useEffect } from 'react'
import { Bell, Star, Eye, CheckCircle, XCircle, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { formatDistance } from "date-fns"
import { ar } from "date-fns/locale"

interface ReviewNotification {
  id: string
  type: 'new_review' | 'review_approved' | 'review_reported'
  review: {
    id: string
    rating: number
    comment: string
    created_at: string
    user: { name: string }
    product: { name: string; images: string[] }
  }
  read: boolean
  created_at: string
}

export function ReviewNotifications() {
  const [notifications, setNotifications] = useState<ReviewNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<ReviewNotification | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel('review-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'review_notifications' },
        () => fetchNotifications()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchNotifications = async () => {
    try {
      const userId = (typeof window !== 'undefined' && localStorage.getItem('auth-storage')) ? (() => {
        try { const s = JSON.parse(localStorage.getItem('auth-storage') as string); return s?.state?.user?.id || '' } catch { return '' }
      })() : ''
      const res = await fetch('/api/reviews/notifications', {
        headers: { 'x-user-id': userId }
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch notifications')
      const rows = json.data
      const mapped: ReviewNotification[] = (rows || []).map((row: any) => ({
        id: row.id,
        type: row.type,
        read: row.read,
        created_at: row.created_at,
        review: {
          id: row.review?.id,
          rating: row.review?.rating,
          comment: row.review?.comment,
          created_at: row.review?.created_at,
          user: { name: row.review?.users?.name || 'مستخدم' },
          product: { name: row.review?.products?.name || 'منتج', images: row.review?.products?.images || ['/placeholder.jpg'] }
        }
      }))
      setNotifications(mapped)
      setUnreadCount(mapped.filter((n: ReviewNotification) => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const handleNewReview = async (_payload?: any) => {
    await fetchNotifications()
    toast({ title: 'تنبيه جديد', description: 'تم تحديث إشعارات المراجعات.' })
    playNotificationSound()
  }

  const handleReviewUpdate = (payload: any) => {
    // التعامل مع تحديثات المراجعات (الموافقة، الرفض، إلخ)
    setNotifications(prev => 
      prev.map(notif => 
        notif.review.id === payload.new.id 
          ? { ...notif, read: payload.new.is_approved }
          : notif
      )
    )
    
    if (payload.new.is_approved && !payload.old.is_approved) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.volume = 0.5
      audio.play().catch(() => {
        // تجاهل أخطاء تشغيل الصوت
      })
    } catch (error) {
      // تجاهل أخطاء الصوت
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const userId = (typeof window !== 'undefined' && localStorage.getItem('auth-storage')) ? (() => {
        try { const s = JSON.parse(localStorage.getItem('auth-storage') as string); return s?.state?.user?.id || '' } catch { return '' }
      })() : ''
      const res = await fetch('/api/reviews/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ id: notificationId, read: true })
      })
      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed')
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (e) {
      // ignore update error for now
    }
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
    setUnreadCount(0)
  }

  const renderStars = (rating: number) => (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_review':
        return <MessageSquare className="w-4 h-4 text-blue-500" />
      case 'review_approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'review_reported':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'new_review':
        return 'مراجعة جديدة'
      case 'review_approved':
        return 'تم اعتماد المراجعة'
      case 'review_reported':
        return 'تم الإبلاغ عن مراجعة'
      default:
        return 'إشعار'
    }
  }

  return (
    <>
      {/* زر الإشعارات */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowNotifications(true)}
          className="relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* مودال الإشعارات */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                إشعارات المراجعات
                {unreadCount > 0 && (
                  <Badge variant="destructive">{unreadCount}</Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  تمييز الكل كمقروء
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => {
                    setSelectedNotification(notification)
                    if (!notification.read) {
                      markAsRead(notification.id)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">
                            {getNotificationTitle(notification.type)}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDistance(new Date(notification.created_at), new Date(), { 
                              addSuffix: true, 
                              locale: ar 
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={notification.review.product.images[0]}
                            alt={notification.review.product.name}
                            className="w-8 h-8 rounded object-cover"
                            loading="lazy"
                            width={32}
                            height={32}
                          />
                          <span className="text-sm font-medium truncate">
                            {notification.review.product.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(notification.review.rating)}
                          <span className="text-xs text-gray-600">
                            بواسطة {notification.review.user.name}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {notification.review.comment}
                        </p>
                      </div>

                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* مودال تفاصيل الإشعار */}
      {selectedNotification && (
        <Dialog 
          open={!!selectedNotification} 
          onOpenChange={() => setSelectedNotification(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>تفاصيل المراجعة</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedNotification.review.product.images[0]}
                  alt={selectedNotification.review.product.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  loading="lazy"
                  width={64}
                  height={64}
                />
                <div>
                  <h3 className="font-semibold">
                    {selectedNotification.review.product.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    بواسطة {selectedNotification.review.user.name}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">التقييم</label>
                {renderStars(selectedNotification.review.rating)}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">التعليق</label>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-800">
                    {selectedNotification.review.comment}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">التاريخ</label>
                <p className="text-gray-600 text-sm">
                  {new Date(selectedNotification.review.created_at).toLocaleString('ar-EG')}
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    // الانتقال إلى صفحة إدارة المراجعات
                    setSelectedNotification(null)
                    setShowNotifications(false)
                  }}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 ml-2" />
                  عرض في الإدارة
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedNotification(null)}
                >
                  إغلاق
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
