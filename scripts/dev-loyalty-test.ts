// Quick sanity test for loyaltySystem utils
import { calculateLoyaltyPoints, LOYALTY_CONFIG, getMaxUsablePoints } from '@/lib/utils/loyaltySystem'

function run() {
  const subtotal = 500
  const userPoints = 1500
  const pointsToUse = 400
  const res = calculateLoyaltyPoints(subtotal, pointsToUse, true, userPoints, LOYALTY_CONFIG.SHIPPING_FEE)
  console.log(JSON.stringify({ res, maxUsable: getMaxUsablePoints(subtotal, userPoints) }, null, 2))
}

run()
