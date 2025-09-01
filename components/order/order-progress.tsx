"use client"

import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Truck, Package } from "lucide-react"

interface OrderProgressProps {
  status: "pending" | "confirmed" | "preparing" | "shipping" | "delivered" |
          "PENDING" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"
}

const statusSteps = [
  { key: "pending", label: "تم الطلب", icon: Clock },
  { key: "confirmed", label: "تم التأكيد", icon: CheckCircle },
  { key: "preparing", label: "قيد التحضير", icon: Package },
  { key: "shipping", label: "في الطريق", icon: Truck },
  { key: "delivered", label: "تم التسليم", icon: CheckCircle },
]

export function OrderProgress({ status }: OrderProgressProps) {
  // تطبيع الحالة إلى المفاتيح السفلية المستخدمة في المخطط
  const normalized = (() => {
    if (!status) return "pending"
    const s = String(status)
    switch (s) {
      case 'PENDING': return 'pending'
      case 'CONFIRMED': return 'confirmed'
      case 'PREPARING': return 'preparing'
      case 'OUT_FOR_DELIVERY':
      case 'SHIPPING':
      case 'shipping': return 'shipping'
      case 'DELIVERED': return 'delivered'
      default: return s.toLowerCase()
    }
  })()

  const currentStepIndex = statusSteps.findIndex((step) => step.key === normalized)
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100

  return (
    <div className="w-full">
      <Progress value={progress} className="mb-4" />
      <div className="flex justify-between">
        {statusSteps.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index <= currentStepIndex
          const isCurrent = index === currentStepIndex

          return (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted ? "bg-red-600 text-white" : "bg-gray-300 text-gray-700"
                } ${isCurrent ? "ring-2 ring-red-300" : ""}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs text-center ${isCompleted ? "text-red-600 font-medium" : "text-gray-600"}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
