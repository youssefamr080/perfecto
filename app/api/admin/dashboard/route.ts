import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type DashboardCacheValue = {
  products: unknown[];
  orders: unknown[];
  customers: unknown[];
  stats: Record<string, number>;
};
let dashboardCache: { data: DashboardCacheValue; timestamp: number } | null = null;
const DASHBOARD_CACHE_DURATION = 10 * 60 * 1000; // 10 دقائق

export async function GET() {
  try {
    const now = Date.now();
    if (dashboardCache && (now - dashboardCache.timestamp < DASHBOARD_CACHE_DURATION)) {
      return NextResponse.json(dashboardCache.data);
    }
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

    const responseData = {
      products,
      orders,
      customers,
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue
      }
    };
    dashboardCache = { data: responseData, timestamp: now };
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { error: 'فشل في تحميل بيانات لوحة الإدارة' },
      { status: 500 }
    )
  }
}
