import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json()

    if (!name || !phone) {
      return NextResponse.json({
        success: false,
        error: 'الاسم ورقم الهاتف مطلوبان'
      }, { status: 400 })
    }

    // البحث عن المستخدم الموجود
    let user = await (prisma as any).user.findUnique({
      where: { phone },
      include: {
        addresses: true
      }
    })

    // إذا لم يوجد، إنشاء مستخدم جديد
    if (!user) {
      user = await (prisma as any).user.create({
        data: {
          name,
          phone
        },
        include: {
          addresses: true
        }
      })
    } else {
      // تحديث الاسم إذا تغير
      if (user.name !== name) {
        user = await (prisma as any).user.update({
          where: { id: user.id },
          data: { name },
          include: {
            addresses: true
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        defaultAddress: user.defaultAddress,
        addresses: user.addresses
      }
    })

  } catch (error) {
    console.error('User login error:', error)
    return NextResponse.json({
      success: false,
      error: 'خطأ في الخادم'
    }, { status: 500 })
  }
}
