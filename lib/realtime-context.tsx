"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { supabase } from './supabase'
import { playNotificationSound, requestNotificationPermission, initializeSound } from './notification-sound'
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

      if (latestOrder && latestOrder.id !== lastOrderId) {
        setLastOrderId(latestOrder.id)
        
        // إذا لم يكن هذا أول تحميل
        if (lastOrderId !== null) {
          console.log('🎯 تم اكتشاف طلب جديد:', latestOrder)
          
          // إضافة الطلب الجديد
          setNewOrders(prev => [latestOrder, ...prev.slice(0, 9)]) // احتفظ بآخر 10 طلبات فقط
          setHasUnreadOrders(true)
          
          // تشغيل الصوت والإشعار فوراً
          console.log('🔊 بدء تشغيل صوت الإشعار...')
          try {
            await playNotificationSound()
            console.log('✅ تم تشغيل صوت الإشعار بنجاح')
          } catch (soundError) {
            console.error('❌ فشل في تشغيل الصوت:', soundError)
          }
          
          toast({
            title: "🛒 طلب جديد وصل!",
            description: `من ${latestOrder.user?.name || 'عميل'} - بقيمة ${latestOrder.final_amount} ج.م`,
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
        
        console.log('تم تهيئة نظام الإشعارات')
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
              console.log('🔥 Realtime: طلب جديد مباشر:', payload)
              
              // تشغيل الصوت فوراً
              console.log('🔊 تشغيل صوت فوري من Realtime...')
              try {
                await playNotificationSound()
                console.log('✅ تم تشغيل الصوت من Realtime')
              } catch (error) {
                console.error('❌ فشل صوت Realtime:', error)
              }
              
              // تشغيل فحص الطلبات للحصول على البيانات الكاملة
              setTimeout(async () => {
                await checkForNewOrders()
              }, 500) // تأخير صغير للتأكد من حفظ البيانات
            }
          )
          .subscribe((status) => {
            console.log('حالة Realtime:', status)
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
