"use client"

import { useEffect } from "react"
import { useRealtime } from "@/lib/realtime-context"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import { Order } from "@/lib/types"

interface RealtimeOrdersProps {
  onNewOrder: (order: Order) => void
}

export function RealtimeOrders({ onNewOrder }: RealtimeOrdersProps) {
  const { newOrders, hasUnreadOrders } = useRealtime()
  
  // إرسال الطلبات الجديدة للصفحة الأب
  useEffect(() => {
    if (newOrders.length > 0) {
      // نرسل فقط أحدث طلب
      const latestOrder = newOrders[0]
      onNewOrder(latestOrder)
    }
  }, [newOrders, onNewOrder])

  return (
    <div className="flex items-center">
      <Bell className={`h-5 w-5 ${hasUnreadOrders ? 'text-yellow-500 animate-pulse' : 'text-gray-500'}`} />
      {newOrders.length > 0 && (
        <Badge variant="destructive" className="mr-2">
          {newOrders.length}
        </Badge>
      )}
    </div>
  )
}
