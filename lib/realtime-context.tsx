"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { supabase } from './supabase'
import { safePlayNotificationSound, requestNotificationPermission, initializeSound, enableAudioByUserGesture } from './notification-sound'
import { useToast } from '@/hooks/use-toast'
import { Order } from './types'

interface RealtimeContextType {
  newOrders: Order[]
  hasUnreadOrders: boolean
  markOrdersAsRead: () => void
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
  isPollingActive: boolean
}

const RealtimeContext = createContext<RealtimeContextType>({
  newOrders: [],
  hasUnreadOrders: false,
  markOrdersAsRead: () => {},
  connectionStatus: 'disconnected',
  isPollingActive: false,
})

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [newOrders, setNewOrders] = useState<Order[]>([])
  const [hasUnreadOrders, setHasUnreadOrders] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  const [isPollingActive, setIsPollingActive] = useState(false)
  const [lastOrderId, setLastOrderId] = useState<string | null>(null)
  const { toast } = useToast()

  // جلب آخر طلب للتحقق من الطلبات الجديدة
  const checkForNewOrders = useCallback(async () => {
    try {
      const { data: latestOrder, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(*),
          order_items(
            *,
            product:products(*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error('خطأ في جلب آخر طلب:', error)
        return
      }

      if (latestOrder && (latestOrder as Order).id !== lastOrderId) {
        setLastOrderId((latestOrder as Order).id)
        
        // إذا لم يكن هذا أول تحميل
        if (lastOrderId !== null) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🎯 تم اكتشاف طلب جديد:', (latestOrder as Order).id)
          }
          
          // إضافة الطلب الجديد
          setNewOrders(prev => [(latestOrder as Order), ...prev.slice(0, 9)]) // احتفظ بآخر 10 طلبات فقط
          setHasUnreadOrders(true)
          
          // تشغيل الصوت والإشعار فوراً
          try {
            await safePlayNotificationSound()
          } catch (soundError) {
            if (process.env.NODE_ENV === 'development') {
              console.error('❌ فشل في تشغيل الصوت:', soundError)
            }
          }

          // إرسال إيميل للمدير
          try {
            const emailResponse = await fetch('/api/send-order-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ order: latestOrder })
            })
            
            if (emailResponse.ok) {
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ تم إرسال إيميل الطلب بنجاح')
              }
            } else {
              console.error('❌ فشل في إرسال إيميل الطلب:', await emailResponse.text())
            }
          } catch (emailError) {
            console.error('❌ خطأ في إرسال إيميل الطلب:', emailError)
          }
          
          toast({
            title: "🛒 طلب جديد وصل!",
            description: `من ${(latestOrder as Order).user?.name || 'عميل'} - بقيمة ${(latestOrder as Order).final_amount} ج.م`,
            variant: "default",
          })
        }
      }
    } catch (error) {
      console.error('خطأ في التحقق من الطلبات الجديدة:', error)
    }
  }, [lastOrderId, toast])

  // نظام Polling كبديل قوي
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout

    const startPolling = () => {
      setIsPollingActive(true)
      
      // تحقق كل 10 ثوانٍ
      pollingInterval = setInterval(() => {
        checkForNewOrders()
      }, 10000)
      
      // تحقق فوري عند البداية
      checkForNewOrders()
    }

    startPolling()

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
      setIsPollingActive(false)
    }
  }, [checkForNewOrders])

  // تهيئة الصوت والإشعارات عند التحميل
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // طلب إذن الإشعارات
        await requestNotificationPermission()
        
        // تهيئة الصوت
        await initializeSound()
        
        if (process.env.NODE_ENV === 'development') {
          console.log('تم تهيئة نظام الإشعارات')
        }
      } catch (error) {
        console.error('فشل في تهيئة الإشعارات:', error)
      }
    }

    initializeNotifications()
  }, [])

  // محاولة اتصال Realtime (كنظام إضافي)
  useEffect(() => {
    let channel: any = null

    const setupRealtime = () => {
      try {
        setConnectionStatus('connecting')
        
        channel = supabase
          .channel('admin-orders-realtime')
          .on('postgres_changes', 
            { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'orders' 
            }, 
            async (payload) => {
              if (process.env.NODE_ENV === 'development') {
                console.log('🔥 Realtime: طلب جديد مباشر:', payload.new?.id)
              }
              
              // تشغيل الصوت فوراً
              try {
                await safePlayNotificationSound()
              } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                  console.error('❌ فشل صوت Realtime:', error)
                }
              }

              // إرسال إيميل سريع بالبيانات الأولية (إذا كانت متوفرة)
              if (payload.new) {
                try {
                  const quickEmailResponse = await fetch('/api/send-order-email', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ order: payload.new })
                  })
                  
                  if (process.env.NODE_ENV === 'development' && quickEmailResponse.ok) {
                    console.log('✅ تم إرسال إيميل سريع من Realtime')
                  }
                } catch (emailError) {
                  // تجاهل الأخطاء في الإيميل السريع - سيتم إرسال إيميل كامل لاحقاً
                  if (process.env.NODE_ENV === 'development') {
                    console.log('⚠️ فشل إيميل Realtime، سيتم المحاولة مرة أخرى')
                  }
                }
              }
              
              // تشغيل فحص الطلبات للحصول على البيانات الكاملة
              setTimeout(async () => {
                await checkForNewOrders()
              }, 500) // تأخير صغير للتأكد من حفظ البيانات
            }
          )
          .subscribe((status) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('حالة Realtime:', status)
            }
            setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected')
          })
      } catch (error) {
        console.error('خطأ في إعداد Realtime:', error)
        setConnectionStatus('disconnected')
      }
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [checkForNewOrders])

  const markOrdersAsRead = () => {
    setHasUnreadOrders(false)
    setNewOrders([])
  }

  const value = {
    newOrders,
    hasUnreadOrders,
    markOrdersAsRead,
    connectionStatus,
    isPollingActive,
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

export const useRealtime = () => useContext(RealtimeContext)
