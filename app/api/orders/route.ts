import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type OrdersCacheValue = { success: boolean; orders: unknown[] };
const ordersCache: Record<string, { data: OrdersCacheValue; timestamp: number }> = {};
const ORDERS_CACHE_DURATION = 10 * 60 * 1000; // 10 دقائق

// GET - جلب الطلبات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const orderId = searchParams.get('orderId')

    const cacheKey = `${phone || ''}__${orderId || ''}`;
    const now = Date.now();
    if (ordersCache[cacheKey] && (now - ordersCache[cacheKey].timestamp < ORDERS_CACHE_DURATION)) {
      return NextResponse.json(ordersCache[cacheKey].data);
    }

    let where = {}
    
    if (phone) {
      where = { ...where, customerPhone: { contains: phone } }
    }
    
    if (orderId) {
      where = { ...where, id: orderId }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const responseData = { success: true, orders };
    ordersCache[cacheKey] = { data: responseData, timestamp: now };
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الطلبات' },
      { status: 500 }
    )
  }
}

// POST - إنشاء طلب جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerPhone, customerAddress, notes, items, total, deliveryFee } = body

    // التحقق من البيانات المطلوبة
    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'بيانات مطلوبة مفقودة' },
        { status: 400 }
      )
    }

    // إنشاء مستخدم أولاً أو العثور عليه
    let user = await prisma.user.findUnique({
      where: { phone: customerPhone }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: customerName,
          phone: customerPhone,
          defaultAddress: customerAddress
        }
      })
    }

    // إنشاء الطلب
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        customerAddress: user.defaultAddress || customerAddress,
        notes: notes || '',
        total: parseFloat(total),
        deliveryFee: parseFloat(deliveryFee),
        status: 'PENDING',
        orderItems: {
          create: items.map((item: { productId: string; quantity: string; price: string }) => ({
            productId: item.productId,
            quantity: parseFloat(item.quantity),
            price: parseFloat(item.price)
          }))
        }
      },
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
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في إنشاء الطلب' },
      { status: 500 }
    )
  }
}
