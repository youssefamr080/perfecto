import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH - تحديث حالة الطلب
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { status } = body

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'حالة غير صحيحة' },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في تحديث الطلب' },
      { status: 500 }
    )
  }
}

type OrderDetailsCacheValue = { success: boolean; order: unknown };
const orderDetailsCache: Record<string, { data: OrderDetailsCacheValue; timestamp: number }> = {};
const ORDER_DETAILS_CACHE_DURATION = 10 * 60 * 1000; // 10 دقائق

// GET - جلب طلب واحد
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cacheKey = id;
    const now = Date.now();
    if (orderDetailsCache[cacheKey] && (now - orderDetailsCache[cacheKey].timestamp < ORDER_DETAILS_CACHE_DURATION)) {
      return NextResponse.json(orderDetailsCache[cacheKey].data);
    }
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }
    const responseData = { success: true, order };
    orderDetailsCache[cacheKey] = { data: responseData, timestamp: now };
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الطلب' },
      { status: 500 }
    );
  }
}
