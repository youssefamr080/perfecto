import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get products
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        price: true,
        oldPrice: true,
        images: true,
        category: true,
        isAvailable: true,
        unitType: true,
        description: true,
        createdAt: true
      }
    })

    // Get orders with items
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Get customers
    const customers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        phone: true,
        defaultAddress: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      }
    })

    // Get stats
    const totalProducts = await prisma.product.count()
    const totalOrders = await prisma.order.count()
    const totalCustomers = await prisma.user.count()

    // Calculate total revenue
    const totalRevenueData = await prisma.order.findMany({
      where: {
        status: {
          in: ['DELIVERED']
        }
      }
    })

    const totalRevenue = totalRevenueData.reduce((sum: number, order) => sum + order.total, 0)

    return NextResponse.json({
      products,
      orders,
      customers,
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue
      }
    })

  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل بيانات لوحة الإدارة' },
      { status: 500 }
    )
  }
}
