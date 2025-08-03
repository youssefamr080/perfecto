// utils/loyaltySystem.ts
export const LOYALTY_CONFIG = {
  POINTS_PER_EGP: 1,
  POINTS_TO_EGP: 100,
  SHIPPING_POINTS_COST: 2000,
  MIN_POINTS_USE: 100,
  FREE_SHIPPING_THRESHOLD: 300,
  SHIPPING_FEE: 20,
} as const

export type LoyaltyTransaction = {
  userId: string
  orderId: string
  pointsUsed: number
  pointsEarned: number
  currentBalance: number
}

export const calculateLoyaltyPoints = (
  subtotal: number,
  pointsToUse: number,
  usePointsForShipping: boolean,
  shippingFee: number
) => {
  // التحقق من صحة المدخلات
  if (pointsToUse % LOYALTY_CONFIG.MIN_POINTS_USE !== 0) {
    throw new Error('يجب أن تكون النقاط المستخدمة من مضاعفات 100')
  }

  const pointsDiscount = Math.floor(pointsToUse / LOYALTY_CONFIG.POINTS_TO_EGP)
  const finalShippingFee = usePointsForShipping && shippingFee > 0 ? 0 : shippingFee
  const finalAmount = Math.max(0, subtotal + finalShippingFee - pointsDiscount)
  const pointsEarned = Math.floor(subtotal * LOYALTY_CONFIG.POINTS_PER_EGP)
  const totalPointsUsed = pointsToUse + (usePointsForShipping ? LOYALTY_CONFIG.SHIPPING_POINTS_COST : 0)

  return {
    pointsDiscount,
    finalShippingFee,
    finalAmount,
    pointsEarned,
    totalPointsUsed,
  }
}

export const validateLoyaltyTransaction = (
  userPoints: number,
  totalPointsUsed: number,
  finalAmount: number
): { isValid: boolean; error?: string } => {
  if (totalPointsUsed > userPoints) {
    return { isValid: false, error: 'النقاط المستخدمة تتجاوز النقاط المتاحة' }
  }

  if (finalAmount < 0) {
    return { isValid: false, error: 'النقاط المستخدمة أكثر من قيمة الطلب' }
  }

  return { isValid: true }
}
