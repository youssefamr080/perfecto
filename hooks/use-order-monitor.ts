"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// نظام مراقبة الاتصال والتحقق من الطلبات الجديدة
export function useOrderMonitor() {
  const [lastCheckTime, setLastCheckTime] = useState<Date>(new Date())
  const [connectionHealth, setConnectionHealth] = useState<'good' | 'warning' | 'error'>('good')
  
  // فحص صحة الاتصال
  const checkConnectionHealth = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .limit(1)
      
      if (error) {
        console.error('فشل في فحص الاتصال:', error)
        setConnectionHealth('error')
        return false
      }
      
      setConnectionHealth('good')
      setLastCheckTime(new Date())
      return true
    } catch (error) {
      console.error('خطأ في فحص الاتصال:', error)
      setConnectionHealth('error')
      return false
    }
  }

  // فحص الطلبات الجديدة منذ آخر فحص
  const checkForNewOrdersSince = async (since: Date) => {
    try {
      const { data: newOrders, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(*),
          order_items(
            *,
            product:products(*)
          )
        `)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('خطأ في فحص الطلبات الجديدة:', error)
        return []
      }

      return newOrders || []
    } catch (error) {
      console.error('خطأ في جلب الطلبات الجديدة:', error)
      return []
    }
  }

  // مراقبة دورية
  useEffect(() => {
    const interval = setInterval(async () => {
      const isHealthy = await checkConnectionHealth()
      
      if (!isHealthy) {
        console.warn('تم اكتشاف مشكلة في الاتصال')
        setConnectionHealth('warning')
      }
    }, 30000) // فحص كل 30 ثانية

    // فحص أولي
    checkConnectionHealth()

    return () => clearInterval(interval)
  }, [])

  return {
    lastCheckTime,
    connectionHealth,
    checkConnectionHealth,
    checkForNewOrdersSince,
  }
}
