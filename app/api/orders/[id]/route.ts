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

// GET - جلب طلب واحد
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الطلب' },
      { status: 500 }
    )
  }
}
