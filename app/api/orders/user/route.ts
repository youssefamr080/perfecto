import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type UserOrdersCacheValue = unknown[];
const userOrdersCache: Record<string, { data: UserOrdersCacheValue; timestamp: number }> = {};
const USER_ORDERS_CACHE_DURATION = 10 * 60 * 1000; // 10 دقائق

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const orderPhone = searchParams.get('phone')

    const cacheKey = `${userId || ''}__${orderPhone || ''}`;
    const now = Date.now();
    if (userOrdersCache[cacheKey] && (now - userOrdersCache[cacheKey].timestamp < USER_ORDERS_CACHE_DURATION)) {
      return NextResponse.json(userOrdersCache[cacheKey].data);
    }

    if (!userId && !orderPhone) {
      return NextResponse.json(
        { error: 'معرف المستخدم أو رقم الهاتف مطلوب' },
        { status: 400 }
      )
    }

    // Use Record<string, unknown> instead of any for whereClause
    const whereClause: Record<string, unknown> = {}

    if (userId) {
      whereClause.userId = userId
    } else if (orderPhone) {
      whereClause.customerPhone = orderPhone
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unitType: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    userOrdersCache[cacheKey] = { data: orders, timestamp: now };
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Get user orders error:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}
