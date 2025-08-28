// نظام نقاط الولاء المحسن والقوي
export const LOYALTY_CONFIG = {
  // النظام الجديد: كل 200 نقطة = 4 جنيه (نسبة 2%)
  POINTS_PER_EGP: 1, // نقطة واحدة لكل جنيه
  POINTS_TO_EGP_RATIO: 200, // 200 نقطة
  DISCOUNT_PER_RATIO: 4, // = 4 جنيه
  
  // التوصيل المجاني: 1000 نقطة
  SHIPPING_POINTS_COST: 1000,
  
  // الحد الأدنى لاستخدام النقاط: 200 نقطة
  MIN_POINTS_USE: 200,
  
  // إعدادات التوصيل
  FREE_SHIPPING_THRESHOLD: 300,
  SHIPPING_FEE: 20,
  
  // حدود الاستخدام
  MAX_POINTS_PERCENTAGE: 10, // لا يمكن استخدام أكثر من 10% من قيمة الطلب
} as const

export type LoyaltyTransaction = {
  userId: string
  orderId: string
  pointsUsed: number
  pointsEarned: number
  currentBalance: number
  transactionType: 'earn' | 'redeem' | 'shipping'
  timestamp: string
}

export type LoyaltyCalculationResult = {
  pointsDiscount: number
  finalShippingFee: number
  finalAmount: number
  pointsEarned: number
  totalPointsUsed: number
  shippingPointsUsed: number
  isValid: boolean
  error?: string
  breakdown: {
    subtotal: number
    pointsDiscountAmount: number
    shippingFee: number
    finalTotal: number
    pointsEarnedFromPurchase: number
  }
}

/**
 * حساب نقاط الولاء المحسن مع التحقق الشامل
 */
export const calculateLoyaltyPoints = (
  subtotal: number,
  pointsToUse: number,
  usePointsForShipping: boolean,
  currentUserPoints: number,
  shippingFee: number = LOYALTY_CONFIG.SHIPPING_FEE
): LoyaltyCalculationResult => {
  
  // التحقق من صحة المدخلات
  const validation = validateInputs(subtotal, pointsToUse, currentUserPoints, usePointsForShipping)
  if (!validation.isValid) {
    return {
      pointsDiscount: 0,
      finalShippingFee: shippingFee,
      finalAmount: subtotal + shippingFee,
      pointsEarned: 0,
      totalPointsUsed: 0,
      shippingPointsUsed: 0,
      isValid: false,
      error: validation.error,
      breakdown: {
        subtotal,
        pointsDiscountAmount: 0,
        shippingFee,
        finalTotal: subtotal + shippingFee,
        pointsEarnedFromPurchase: 0
      }
    }
  }

  // حساب خصم النقاط
  const pointsDiscountRatios = Math.floor(pointsToUse / LOYALTY_CONFIG.POINTS_TO_EGP_RATIO)
  const pointsDiscount = pointsDiscountRatios * LOYALTY_CONFIG.DISCOUNT_PER_RATIO

  // التحقق من أن الخصم لا يتجاوز الحد المسموح
  const maxAllowedDiscount = subtotal * (LOYALTY_CONFIG.MAX_POINTS_PERCENTAGE / 100)
  const finalPointsDiscount = Math.min(pointsDiscount, maxAllowedDiscount)
  
  // إعادة حساب النقاط المستخدمة الفعلية بناءً على الخصم المطبق
  const actualPointsUsed = Math.floor((finalPointsDiscount / LOYALTY_CONFIG.DISCOUNT_PER_RATIO) * LOYALTY_CONFIG.POINTS_TO_EGP_RATIO)

  // حساب رسوم التوصيل
  let finalShippingFee = shippingFee
  let shippingPointsUsed = 0
  
  if (usePointsForShipping && currentUserPoints >= (actualPointsUsed + LOYALTY_CONFIG.SHIPPING_POINTS_COST)) {
    finalShippingFee = 0
    shippingPointsUsed = LOYALTY_CONFIG.SHIPPING_POINTS_COST
  }

  // المبلغ النهائي
  const finalAmount = Math.max(0, subtotal + finalShippingFee - finalPointsDiscount)

  // النقاط المكتسبة من الطلب (قبل خصم النقاط المستخدمة)
  const pointsEarned = Math.floor(subtotal * LOYALTY_CONFIG.POINTS_PER_EGP)

  // إجمالي النقاط المستخدمة
  const totalPointsUsed = actualPointsUsed + shippingPointsUsed

  return {
    pointsDiscount: finalPointsDiscount,
    finalShippingFee,
    finalAmount,
    pointsEarned,
    totalPointsUsed,
    shippingPointsUsed,
    isValid: true,
    breakdown: {
      subtotal,
      pointsDiscountAmount: finalPointsDiscount,
      shippingFee: finalShippingFee,
      finalTotal: finalAmount,
      pointsEarnedFromPurchase: pointsEarned
    }
  }
}

/**
 * التحقق من صحة المدخلات
 */
export const validateInputs = (
  subtotal: number,
  pointsToUse: number,
  currentUserPoints: number,
  usePointsForShipping: boolean
): { isValid: boolean; error?: string } => {
  
  // التحقق من المبلغ الفرعي
  if (subtotal <= 0) {
    return { isValid: false, error: 'مبلغ الطلب يجب أن يكون أكبر من صفر' }
  }

  // التحقق من النقاط المستخدمة
  if (pointsToUse < 0) {
    return { isValid: false, error: 'النقاط المستخدمة لا يمكن أن تكون سالبة' }
  }

  // التحقق من أن النقاط من مضاعفات الحد الأدنى
  if (pointsToUse > 0 && pointsToUse % LOYALTY_CONFIG.MIN_POINTS_USE !== 0) {
    return { isValid: false, error: `يجب أن تكون النقاط المستخدمة من مضاعفات ${LOYALTY_CONFIG.MIN_POINTS_USE}` }
  }

  // التحقق من توفر النقاط الكافية
  const requiredPoints = pointsToUse + (usePointsForShipping ? LOYALTY_CONFIG.SHIPPING_POINTS_COST : 0)
  if (requiredPoints > currentUserPoints) {
    return { isValid: false, error: 'ليس لديك نقاط كافية لهذه العملية' }
  }

  // التحقق من حد الاستخدام الأقصى
  const maxPointsDiscount = subtotal * (LOYALTY_CONFIG.MAX_POINTS_PERCENTAGE / 100)
  const requestedDiscount = Math.floor(pointsToUse / LOYALTY_CONFIG.POINTS_TO_EGP_RATIO) * LOYALTY_CONFIG.DISCOUNT_PER_RATIO
  
  if (requestedDiscount > maxPointsDiscount) {
    return { isValid: false, error: `لا يمكن استخدام أكثر من ${LOYALTY_CONFIG.MAX_POINTS_PERCENTAGE}% من قيمة الطلب كخصم` }
  }

  return { isValid: true }
}

/**
 * تسجيل معاملة نقاط الولاء
 */
export const createLoyaltyTransaction = (
  userId: string,
  orderId: string,
  result: LoyaltyCalculationResult,
  transactionType: 'earn' | 'redeem' | 'shipping' = 'redeem'
): LoyaltyTransaction => {
  return {
    userId,
    orderId,
    pointsUsed: result.totalPointsUsed,
    pointsEarned: result.pointsEarned,
    currentBalance: 0, // سيتم تحديثه من قاعدة البيانات
    transactionType,
    timestamp: new Date().toISOString()
  }
}

/**
 * تحويل النقاط إلى قيمة نقدية
 */
export const convertPointsToEGP = (points: number): number => {
  const ratios = Math.floor(points / LOYALTY_CONFIG.POINTS_TO_EGP_RATIO)
  return ratios * LOYALTY_CONFIG.DISCOUNT_PER_RATIO
}

/**
 * حساب النقاط المطلوبة لخصم معين
 */
export const calculatePointsNeededForDiscount = (discountAmount: number): number => {
  const ratios = Math.ceil(discountAmount / LOYALTY_CONFIG.DISCOUNT_PER_RATIO)
  return ratios * LOYALTY_CONFIG.POINTS_TO_EGP_RATIO
}

/**
 * التحقق من إمكانية استخدام نقاط التوصيل المجاني
 */
export const canUseShippingPoints = (userPoints: number, pointsUsedForDiscount: number = 0): boolean => {
  return (userPoints - pointsUsedForDiscount) >= LOYALTY_CONFIG.SHIPPING_POINTS_COST
}

/**
 * حساب أقصى نقاط يمكن استخدامها لطلب معين
 */
export const getMaxUsablePoints = (subtotal: number, userPoints: number): number => {
  const maxDiscountAllowed = subtotal * (LOYALTY_CONFIG.MAX_POINTS_PERCENTAGE / 100)
  const maxPointsByDiscount = calculatePointsNeededForDiscount(maxDiscountAllowed)
  const maxPointsByBalance = Math.floor(userPoints / LOYALTY_CONFIG.MIN_POINTS_USE) * LOYALTY_CONFIG.MIN_POINTS_USE
  
  return Math.min(maxPointsByDiscount, maxPointsByBalance)
}
