"use client"

import { useEffect } from "react"
import { useRealtime } from "@/lib/realtime-context"
import { Badge } from "@/components/ui/badge"
import { Bell, Wifi, WifiOff, Clock } from "lucide-react"
import { Order } from "@/lib/types"

interface RealtimeOrdersProps {
  onNewOrder: (order: Order) => void
}

export function RealtimeOrders({ onNewOrder }: RealtimeOrdersProps) {
  const { newOrders, hasUnreadOrders, connectionStatus, isPollingActive } = useRealtime()
  
  // إرسال الطلبات الجديدة للصفحة الأب
  useEffect(() => {
    if (newOrders.length > 0) {
      // نرسل فقط أحدث طلب
      const latestOrder = newOrders[0]
      onNewOrder(latestOrder)
    }
  }, [newOrders, onNewOrder])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'disconnected': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="h-4 w-4" />
      case 'connecting': return <Clock className="h-4 w-4 animate-spin" />
      case 'disconnected': return <WifiOff className="h-4 w-4" />
      default: return <WifiOff className="h-4 w-4" />
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* مؤشر حالة الاتصال */}
      <div className={`flex items-center ${getStatusColor()}`} title={`حالة الاتصال: ${connectionStatus}`}>
        {getStatusIcon()}
      </div>
      
      {/* أيقونة الإشعارات */}
      <div className="flex items-center">
        <Bell className={`h-5 w-5 ${hasUnreadOrders ? 'text-yellow-500 animate-pulse' : 'text-gray-500'}`} />
        {newOrders.length > 0 && (
          <Badge variant="destructive" className="mr-2 min-w-5 h-5 text-xs flex items-center justify-center">
            {newOrders.length}
          </Badge>
        )}
      </div>
      
      {/* مؤشر نظام المراقبة النشط */}
      {isPollingActive && (
        <div className="flex items-center text-blue-500" title="نظام المراقبة النشط">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  )
}
