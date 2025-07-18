import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// بيانات الأدمن - يجب تغييرها في بيئة الإنتاج
const ADMIN_PHONE = '01000000000'
const ADMIN_PASSWORD = 'admin123'

export async function POST(request: NextRequest) {
  try {
    const { name, phone, address, password } = await request.json()

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'الاسم ورقم الهاتف مطلوبان' },
        { status: 400 }
      )
    }

    // فحص تسجيل دخول الأدمن
    if (phone === ADMIN_PHONE && password === ADMIN_PASSWORD) {
      return NextResponse.json({
        id: 'admin',
        name: 'المدير',
        phone: ADMIN_PHONE,
        address: 'مكتب الإدارة',
        role: 'admin'
      })
    }

    // للمستخدمين العاديين - لا يحتاجون كلمة مرور
    if (password && phone !== ADMIN_PHONE) {
      return NextResponse.json(
        { error: 'كلمة المرور خاطئة أو هذا الرقم غير مخول للإدارة' },
        { status: 401 }
      )
    }

    // البحث عن المستخدم بناءً على رقم الهاتف
    let user = await prisma.user.findUnique({
      where: { phone }
    })

    if (!user) {
      // إنشاء مستخدم جديد
      user = await prisma.user.create({
        data: {
          name,
          phone,
          defaultAddress: address || null
        }
      })
    } else {
      // تحديث بيانات المستخدم الموجود إذا لزم الأمر
      if (user.name !== name || (address && user.defaultAddress !== address)) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name,
            defaultAddress: address || user.defaultAddress
          }
        })
      }
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      address: user.defaultAddress,
      role: 'user'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    )
  }
}
