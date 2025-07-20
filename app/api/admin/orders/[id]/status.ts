import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ error: 'الحالة مطلوبة' }, { status: 400 });
    }
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });
    return NextResponse.json({ success: true, order });
  } catch {
    return NextResponse.json({ error: 'فشل في تحديث حالة الطلب' }, { status: 500 });
  }
}
