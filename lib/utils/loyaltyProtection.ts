/**
 * نظام حماية نقاط الولاء من التلاعب
 * يتضمن: تتبع المعاملات، التحقق من الصحة، معالجة الإلغاء
 */

import { supabase } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
const db = supabase as unknown as SupabaseClient<Database>

export interface LoyaltyTransaction {
  id: string
  user_id: string
  order_id?: string
  transaction_type: 'EARNED' | 'USED' | 'REFUNDED' | 'DEDUCTED'
  points_amount: number
  points_before: number
  points_after: number
  description?: string
  created_at: string
  created_by: string
}

export interface PointsValidation {
  is_valid: boolean
  current_points: number
  calculated_points: number
  difference: number
  error_message: string
}

export interface CancellationResult {
  success: boolean
  message: string
  points_deducted: number
  points_refunded: number
}

/**
 * إضافة معاملة نقاط جديدة مع التحقق
 */
export async function addLoyaltyTransaction(
  userId: string,
  transactionType: 'EARNED' | 'USED' | 'REFUNDED' | 'DEDUCTED',
  pointsAmount: number,
  orderId?: string,
  description?: string
): Promise<{ success: boolean; error?: string; transaction?: LoyaltyTransaction }> {
  try {
    console.log(`🔐 Adding loyalty transaction: ${transactionType} ${pointsAmount} points for user ${userId}`)
    
  const { error } = await (db.rpc as unknown as <T extends string, A extends object>(fn: T, args: A) => Promise<{ data: unknown; error: { message: string } | null }>)(
    'add_loyalty_transaction',
    {
      p_user_id: userId,
      p_order_id: orderId || null,
      p_transaction_type: transactionType,
      p_points_amount: pointsAmount,
      p_description: description || null
    }
  )

    if (error) {
      console.error('❌ Error adding loyalty transaction:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Loyalty transaction added successfully')
    return { success: true }
  } catch (error) {
    console.error('❌ Unexpected error in addLoyaltyTransaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * التحقق من صحة نقاط المستخدم
 */
export async function validateUserPoints(userId: string): Promise<PointsValidation | null> {
  try {
    console.log(`🔍 Validating points for user ${userId}`)
    
  const { data: validationData, error } = await (db.rpc as unknown as <T extends string, A extends object>(fn: T, args: A) => Promise<{ data: unknown; error: { message: string } | null }>)('validate_user_points', { user_uuid: userId })

    if (error) {
      console.error('❌ Error validating user points:', error)
      return null
    }

    if (Array.isArray(validationData) && (validationData as unknown[]).length > 0) {
      const validation = (validationData as unknown[])[0] as PointsValidation
      console.log(`📊 Points validation result:`, validation)
      
      if (!validation.is_valid) {
        console.warn(`⚠️ Points mismatch detected for user ${userId}:`, {
          current: validation.current_points,
          calculated: validation.calculated_points,
          difference: validation.difference
        })
      }
      
      return validation
    }

    return null
  } catch (error) {
    console.error('❌ Unexpected error in validateUserPoints:', error)
    return null
  }
}

/**
 * جلب تاريخ معاملات نقاط المستخدم
 */
export async function getUserLoyaltyHistory(
  userId: string,
  limit: number = 50
): Promise<LoyaltyTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching loyalty history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('❌ Unexpected error in getUserLoyaltyHistory:', error)
    return []
  }
}

/**
 * معالجة إلغاء الطلب مع نظام العقوبات
 */
export async function handleOrderCancellation(orderId: string): Promise<CancellationResult> {
  try {
    console.log(`🚫 Processing order cancellation: ${orderId}`)
    
  const { data, error } = await (db.rpc as unknown as <T extends string, A extends object>(fn: T, args: A) => Promise<{ data: unknown; error: { message: string } | null }>)('handle_order_cancellation', { p_order_id: orderId })

    if (error) {
      console.error('❌ Error cancelling order:', error)
      return {
        success: false,
        message: error.message,
        points_deducted: 0,
        points_refunded: 0
      }
    }

    if (Array.isArray(data) && (data as unknown[]).length > 0) {
      const result = (data as unknown[])[0] as CancellationResult
      console.log(`✅ Order cancellation processed:`, result)
      return result
    }

    return {
      success: false,
      message: 'No result returned',
      points_deducted: 0,
      points_refunded: 0
    }
  } catch (error) {
    console.error('❌ Unexpected error in handleOrderCancellation:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      points_deducted: 0,
      points_refunded: 0
    }
  }
}

/**
 * تدقيق شامل لنقاط جميع المستخدمين (للأدمن)
 */
export async function auditAllUserPoints(): Promise<{
  total_users: number
  valid_users: number
  invalid_users: number
  invalid_details: Array<{
    user_id: string
    current_points: number
    calculated_points: number
    difference: number
  }>
}> {
  try {
    console.log('🔍 Starting comprehensive points audit...')
    
    // جلب جميع المستخدمين الذين لديهم نقاط
    const { data: users, error: usersError } = await db
      .from('users')
      .select('id, loyalty_points')
      .gt('loyalty_points', 0)

    if (usersError) {
      console.error('❌ Error fetching users for audit:', usersError)
      throw usersError
    }

    const results = {
      total_users: users?.length || 0,
      valid_users: 0,
      invalid_users: 0,
      invalid_details: [] as Array<{
        user_id: string
        current_points: number
        calculated_points: number
        difference: number
      }>
    }

    if (!users || users.length === 0) {
      return results
    }

    // التحقق من كل مستخدم
  for (const user of users as Array<{ id: string; loyalty_points: number }>) {
      const validation = await validateUserPoints(user.id)
      
      if (validation) {
        if (validation.is_valid) {
          results.valid_users++
        } else {
          results.invalid_users++
          results.invalid_details.push({
            user_id: user.id,
            current_points: validation.current_points,
            calculated_points: validation.calculated_points,
            difference: validation.difference
          })
        }
      }
    }

    console.log('📊 Points audit completed:', results)
    return results

  } catch (error) {
    console.error('❌ Error in comprehensive points audit:', error)
    throw error
  }
}

/**
 * إصلاح نقاط المستخدم بناءً على تاريخ المعاملات
 */
export async function fixUserPoints(userId: string): Promise<{
  success: boolean
  old_points: number
  new_points: number
  difference: number
}> {
  try {
    console.log(`🔧 Fixing points for user ${userId}`)
    
    const validation = await validateUserPoints(userId)
    if (!validation) {
      throw new Error('Could not validate user points')
    }

    if (validation.is_valid) {
      return {
        success: true,
        old_points: validation.current_points,
        new_points: validation.current_points,
        difference: 0
      }
    }

    // تحديث النقاط للقيمة الصحيحة
    const { error } = await db
      .from('users')
      .update({ loyalty_points: validation.calculated_points } as Database['public']['Tables']['users']['Update'])
      .eq('id', userId)

    if (error) {
      throw error
    }

    // إضافة معاملة توثيق الإصلاح
    await addLoyaltyTransaction(
      userId,
      validation.difference > 0 ? 'DEDUCTED' : 'EARNED',
      Math.abs(validation.difference),
      undefined,
      `Points correction: Fixed mismatch (${validation.difference} points)`
    )

    console.log(`✅ Points fixed for user ${userId}:`, {
      old: validation.current_points,
      new: validation.calculated_points,
      difference: validation.difference
    })

    return {
      success: true,
      old_points: validation.current_points,
      new_points: validation.calculated_points,
      difference: validation.difference
    }

  } catch (error) {
    console.error(`❌ Error fixing points for user ${userId}:`, error)
    throw error
  }
}

/**
 * معالجة نقاط الطلب الجديد مع الحماية
 */
export async function processOrderPoints(
  userId: string,
  orderId: string,
  pointsUsed: number,
  pointsEarned: number,
  orderNumber: string,
  orderAmount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`💳 Processing order points for order ${orderNumber}`)
    
    // التحقق من صحة النقاط قبل المعالجة
    const validation = await validateUserPoints(userId)
    if (!validation?.is_valid) {
      console.warn(`⚠️ User points invalid before order processing: ${userId}`)
    }

    // خصم النقاط المستخدمة أولاً
    if (pointsUsed > 0) {
      const usedResult = await addLoyaltyTransaction(
        userId,
        'USED',
        pointsUsed,
        orderId,
        `Points used for order #${orderNumber} (${orderAmount} EGP)`
      )

      if (!usedResult.success) {
        return usedResult
      }
    }

    // إضافة النقاط المكتسبة
    if (pointsEarned > 0) {
      const earnedResult = await addLoyaltyTransaction(
        userId,
        'EARNED',
        pointsEarned,
        orderId,
        `Points earned from order #${orderNumber} (${orderAmount} EGP)`
      )

      if (!earnedResult.success) {
        // في حالة فشل إضافة النقاط المكتسبة، نحاول إرجاع النقاط المستخدمة
        if (pointsUsed > 0) {
          await addLoyaltyTransaction(
            userId,
            'REFUNDED',
            pointsUsed,
            orderId,
            `Rollback: Refund points due to earning failure for order #${orderNumber}`
          )
        }
        return earnedResult
      }
    }

    console.log(`✅ Order points processed successfully for order ${orderNumber}`)
    return { success: true }

  } catch (error) {
    console.error('❌ Error processing order points:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
