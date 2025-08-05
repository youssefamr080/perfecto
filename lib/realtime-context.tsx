"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from './supabase'
import { playNotificationSound } from './notification-sound'
import { useToast } from '@/hooks/use-toast'
import { Order } from './types'

interface RealtimeContextType {
  newOrders: Order[]
  hasUnreadOrders: boolean
  markOrdersAsRead: () => void
}

const RealtimeContext = createContext<RealtimeContextType>({
  newOrders: [],
  hasUnreadOrders: false,
  markOrdersAsRead: () => {},
})

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [newOrders, setNewOrders] = useState<Order[]>([])
  const [hasUnreadOrders, setHasUnreadOrders] = useState(false)
  const { toast } = useToast()

  // تابع إشعارات الطلبات الجديدة
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders' 
        }, 
        async (payload) => {
          console.log('New order received:', payload)
          
          // جلب بيانات الطلب الكاملة
          const { data: orderData, error } = await supabase
            .from('orders')
            .select(`
              *,
              user:users(*),
              order_items(
                *,
                product:products(*)
              )
            `)
            .eq('id', payload.new.id)
            .single()
          
          if (error) {
            console.error('Error fetching order details:', error)
            return
          }
          
          // تحديث قائمة الطلبات الجديدة
          setNewOrders(prev => [orderData, ...prev])
          setHasUnreadOrders(true)
          
          // تشغيل صوت الإشعار
          playNotificationSound()
          
          // عرض إشعار
          toast({
            title: "طلب جديد! 🛒",
            description: `تم استلام طلب جديد بقيمة ${payload.new.final_amount} ج.م`,
            variant: "default",
          })
        }
      )
      .subscribe()

    // تنظيف عند إلغاء التحميل
    return () => {
      supabase.removeChannel(channel)
    }
  }, [toast])

  const markOrdersAsRead = () => {
    setHasUnreadOrders(false)
  }

  const value = {
    newOrders,
    hasUnreadOrders,
    markOrdersAsRead,
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
}

export const useRealtime = () => useContext(RealtimeContext)
