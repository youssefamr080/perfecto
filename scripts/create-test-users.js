import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('👥 إنشاء مستخدمين تجريبيين...\n');

    // حذف المستخدمين السابقين إن وجدوا
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.address.deleteMany();
    await prisma.user.deleteMany();

    // مستخدم تجريبي 1
    const user1 = await prisma.user.create({
      data: {
        name: 'أحمد محمد',
        phone: '01012345678',
        addresses: {
          create: [
            {
              title: 'البيت',
              fullAddress: 'شارع الجمهورية، المعادي، القاهرة',
              area: 'المعادي',
              building: '15',
              floor: '3',
              apartment: '8',
              landmark: 'بجوار مسجد النور',
              isDefault: true
            },
            {
              title: 'الشغل',
              fullAddress: 'شارع التحرير، وسط البلد، القاهرة',
              area: 'وسط البلد',
              building: '25',
              floor: '5',
              apartment: '12',
              landmark: 'بجوار بنك مصر',
              isDefault: false
            }
          ]
        }
      },
      include: {
        addresses: true
      }
    });

    // مستخدم تجريبي 2
    const user2 = await prisma.user.create({
      data: {
        name: 'فاطمة علي',
        phone: '01098765432',
        addresses: {
          create: [
            {
              title: 'البيت',
              fullAddress: 'شارع مصر الجديدة، هليوبوليس، القاهرة',
              area: 'هليوبوليس',
              building: '30',
              floor: '2',
              apartment: '5',
              landmark: 'أمام صيدلية العزبي',
              isDefault: true
            }
          ]
        }
      },
      include: {
        addresses: true
      }
    });

    // إنشاء طلب تجريبي
    const testOrder = await prisma.order.create({
      data: {
        userId: user1.id,
        addressId: user1.addresses[0].id,
        customerName: user1.name,
        customerPhone: user1.phone,
        customerAddress: user1.addresses[0].fullAddress,
        total: 0, // سيتم حسابه من المنتجات
        status: 'PENDING',
        orderItems: {
          create: [
            {
              productId: (await prisma.product.findFirst({ where: { name: { contains: 'سجق دجاج' } } }))?.id,
              quantity: 2,
              price: 85
            },
            {
              productId: (await prisma.product.findFirst({ where: { name: { contains: 'جبن شيدر' } } }))?.id,
              quantity: 1,
              price: 180
            },
            {
              productId: (await prisma.product.findFirst({ where: { name: { contains: 'بيض دجاج أبيض' } } }))?.id,
              quantity: 1,
              price: 45
            }
          ]
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    // حساب إجمالي الطلب
    const totalAmount = testOrder.orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    // تحديث إجمالي الطلب
    await prisma.order.update({
      where: { id: testOrder.id },
      data: { total: totalAmount }
    });

    console.log('✅ تم إنشاء المستخدمين التجريبيين:');
    console.log(`👤 ${user1.name} (${user1.phone}) - ${user1.addresses.length} عناوين`);
    user1.addresses.forEach(addr => {
      console.log(`   📍 ${addr.title}: ${addr.fullAddress} ${addr.isDefault ? '(افتراضي)' : ''}`);
    });
    
    console.log(`👤 ${user2.name} (${user2.phone}) - ${user2.addresses.length} عناوين`);
    user2.addresses.forEach(addr => {
      console.log(`   📍 ${addr.title}: ${addr.fullAddress} ${addr.isDefault ? '(افتراضي)' : ''}`);
    });

    console.log(`\n🛒 طلب تجريبي تم إنشاؤه:`);
    console.log(`   📋 رقم الطلب: ${testOrder.id.slice(-8)}`);
    console.log(`   👤 العميل: ${testOrder.customerName}`);
    console.log(`   💰 الإجمالي: ${totalAmount} جنيه`);
    console.log(`   📦 المنتجات: ${testOrder.orderItems.length}`);
    testOrder.orderItems.forEach(item => {
      console.log(`     - ${item.product.name} × ${item.quantity} = ${item.quantity * item.price} جنيه`);
    });

    console.log('\n🎉 تم إكمال إنشاء البيانات التجريبية!');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدمين التجريبيين:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers().catch(console.error);
