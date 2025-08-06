import { Progress } from "@/components/ui/progress"
import { Truck } from "lucide-react"
import { LOYALTY_CONFIG } from "@/lib/utils/loyaltySystem"

const { FREE_SHIPPING_THRESHOLD } = LOYALTY_CONFIG

interface FreeShippingProgressProps {
  currentAmount: number
  className?: string
}

export function FreeShippingProgress({ currentAmount, className = "" }: FreeShippingProgressProps) {
  const remainingAmount = Math.max(0, FREE_SHIPPING_THRESHOLD - currentAmount)
  const progressPercentage = Math.min(100, (currentAmount / FREE_SHIPPING_THRESHOLD) * 100)
  const isEligible = currentAmount >= FREE_SHIPPING_THRESHOLD

  return (
    <div className={`relative rounded-lg border border-gray-200 p-3 ${isEligible ? 'bg-green-50' : 'bg-blue-50'} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Truck className={`h-4 w-4 ${isEligible ? 'text-green-600' : 'text-blue-600'}`} />
          <span className="text-sm font-medium text-black">
            {isEligible ? "توصيل مجاني! 🎉" : "توصيل مجاني"}
          </span>
        </div>
        <span className="text-xs text-gray-600">
          {currentAmount.toFixed(0)} / {FREE_SHIPPING_THRESHOLD} ج.م
        </span>
      </div>

      <div className="relative mb-2">
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-white/70"
        />
      </div>

      <div className="text-center">
        {isEligible ? (
          <span className="text-sm text-green-700 font-medium">
            تم الحصول على التوصيل المجاني!
          </span>
        ) : (
          <span className="text-sm text-gray-700">
            أضف <span className="font-bold text-blue-600">{remainingAmount.toFixed(0)} ج.م</span> للتوصيل المجاني
          </span>
        )}
      </div>
    </div>
  )
}
