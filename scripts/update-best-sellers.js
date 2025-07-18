import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateBestSellers() {
  try {
    console.log('🏆 تحديث المنتجات الأكثر مبيعاً...\n');

    // منتجات مختارة لتكون الأكثر مبيعاً
    const bestSellerProducts = [
      'سجق دجاج',
      'جبن شيدر أحمر', 
      'لانشون دجاج',
      'زبادي طبيعي',
      'عسل نحل طبيعي',
      'بيض دجاج أبيض',
      'كفتة لحمة',
      'طحينة سمسم'
    ];

    console.log('🌟 المنتجات المختارة كأكثر مبيعاً:');
    
    for (const productName of bestSellerProducts) {
      const updated = await prisma.product.updateMany({
        where: {
          name: {
            contains: productName
          }
        },
        data: {
          isBestSeller: true
        }
      });
      
      if (updated.count > 0) {
        console.log(`✅ ${productName} - تم تعييه كأكثر مبيعاً`);
      } else {
        console.log(`❌ ${productName} - لم يتم العثور عليه`);
      }
    }

    // عرض النتائج النهائية
    const bestSellers = await prisma.product.findMany({
      where: {
        isBestSeller: true,
        isAvailable: true
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        subCategory: {
          select: {
            name: true,
            mainCategory: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`\n🏆 الأكثر مبيعاً (${bestSellers.length} منتج):`);
    bestSellers.forEach(product => {
      const categoryPath = product.subCategory 
        ? `${product.subCategory.mainCategory.name} > ${product.subCategory.name}`
        : 'غير محدد';
      console.log(`   🌟 ${product.name} - ${product.price} جنيه (${categoryPath})`);
    });

    console.log('\n✅ تم تحديث المنتجات الأكثر مبيعاً بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في تحديث المنتجات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBestSellers().catch(console.error);
