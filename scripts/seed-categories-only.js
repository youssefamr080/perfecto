const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء إضافة البيانات...')

  // حذف البيانات الموجودة
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.subCategory.deleteMany()
  await prisma.mainCategory.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ تم حذف البيانات القديمة')

  // إنشاء المستخدمين
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'أحمد محمد',
        phone: '01234567890',
        defaultAddress: 'المعادي، شارع 9، فيلا 12'
      }
    }),
    prisma.user.create({
      data: {
        name: 'فاطمة علي',
        phone: '01098765432',
        defaultAddress: 'مدينة نصر، التجمع الأول، شقة 15'
      }
    }),
    prisma.user.create({
      data: {
        name: 'محمود حسن',
        phone: '01555123456',
        defaultAddress: 'الزمالك، شارع الكمال، عمارة 8'
      }
    })
  ])

  console.log('👥 تم إنشاء المستخدمين')

  // إنشاء عناوين متعددة
  await Promise.all([
    prisma.address.create({
      data: {
        userId: users[0].id,
        title: 'البيت',
        fullAddress: 'المعادي، شارع 9، فيلا 12',
        area: 'المعادي',
        building: '12',
        landmark: 'قريب من مترو المعادي',
        isDefault: true
      }
    }),
    prisma.address.create({
      data: {
        userId: users[0].id,
        title: 'الشغل',
        fullAddress: 'وسط البلد، شارع طلعت حرب، برج النهضة',
        area: 'وسط البلد',
        building: 'برج النهضة',
        floor: '5',
        apartment: '15',
        landmark: 'مقابل فندق كوزموبوليتان'
      }
    })
  ])

  console.log('📍 تم إنشاء العناوين')

  // إنشاء الفئات الرئيسية (الموجودة فعلاً عندك)
  const mainCategories = await Promise.all([
    prisma.mainCategory.create({
      data: {
        name: 'اللحوم والدواجن',
        description: 'أجود أنواع اللحوم والدواجن الطازجة - لانشون، بسطرمة، كفتة، سجق، لحمة مفرومة، كبدة',
        image: '/images/categories/meat.jpg',
        icon: '🥩',
        slug: 'meat-poultry',
        sortOrder: 1
      }
    }),
    prisma.mainCategory.create({
      data: {
        name: 'الألبان ومنتجاتها',
        description: 'منتجات الألبان الطازجة - زبادي، لبن، جبن وسمنة',
        image: '/images/categories/dairy.jpg',
        icon: '🧀',
        slug: 'dairy-products',
        sortOrder: 2
      }
    }),
    prisma.mainCategory.create({
      data: {
        name: 'العسل والطحينة',
        description: 'عسل طبيعي وطحينة بلدي',
        image: '/images/categories/honey.jpg',
        icon: '🍯',
        slug: 'honey-tahini',
        sortOrder: 3
      }
    }),
    prisma.mainCategory.create({
      data: {
        name: 'البيض',
        description: 'بيض طازج من المزرعة',
        image: '/images/categories/eggs.jpg',
        icon: '🥚',
        slug: 'eggs',
        sortOrder: 4
      }
    }),
    prisma.mainCategory.create({
      data: {
        name: 'الحلاوة الطحينية',
        description: 'حلاوة طحينية أصلية بأنواعها',
        image: '/images/categories/halawa.jpg',
        icon: '🍬',
        slug: 'halawa',
        sortOrder: 5
      }
    })
  ])

  console.log('📂 تم إنشاء الفئات الرئيسية')

  // إنشاء الفئات الفرعية (حسب ما تبيعه فعلاً)
  const subCategories = await Promise.all([
    // اللحوم والدواجن - 6 فئات
    prisma.subCategory.create({
      data: {
        name: 'لانشون',
        description: 'لانشون طازج بأنواعه',
        slug: 'luncheon',
        categoryType: 'LUNCHEON',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 1
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'بسطرمة',
        description: 'بسطرمة مدخنة عالية الجودة',
        slug: 'pastrami',
        categoryType: 'PASTRAMI',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 2
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'كفتة',
        description: 'كفتة طازجة محضرة يومياً',
        slug: 'kofta',
        categoryType: 'KOFTA',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 3
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'سجق',
        description: 'سجق حار وعادي',
        slug: 'sausage',
        categoryType: 'SAUSAGE',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 4
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'لحمة مفرومة',
        description: 'لحمة مفرومة طازجة',
        slug: 'ground-meat',
        categoryType: 'GROUND_MEAT',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 5
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'كبدة',
        description: 'كبدة طازجة عالية الجودة',
        slug: 'liver',
        categoryType: 'LIVER',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 6
      }
    }),
    
    // الألبان ومنتجاتها - 3 فئات
    prisma.subCategory.create({
      data: {
        name: 'زبادي',
        description: 'زبادي طازج وكريمي',
        slug: 'yogurt',
        categoryType: 'YOGURT',
        mainCategoryId: mainCategories[1].id,
        sortOrder: 1
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'لبن',
        description: 'لبن طازج ومبستر',
        slug: 'milk',
        categoryType: 'MILK',
        mainCategoryId: mainCategories[1].id,
        sortOrder: 2
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'جبن وسمنة',
        description: 'أجود أنواع الجبن والسمنة',
        slug: 'cheese-butter',
        categoryType: 'CHEESE_BUTTER',
        mainCategoryId: mainCategories[1].id,
        sortOrder: 3
      }
    }),
    
    // العسل والطحينة - 2 فئة
    prisma.subCategory.create({
      data: {
        name: 'عسل',
        description: 'عسل طبيعي مضمون',
        slug: 'honey',
        categoryType: 'HONEY',
        mainCategoryId: mainCategories[2].id,
        sortOrder: 1
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'طحينة',
        description: 'طحينة سمسم بلدي',
        slug: 'tahini',
        categoryType: 'TAHINI',
        mainCategoryId: mainCategories[2].id,
        sortOrder: 2
      }
    }),
    
    // البيض - 1 فئة
    prisma.subCategory.create({
      data: {
        name: 'بيض',
        description: 'بيض طازج من المزرعة',
        slug: 'eggs',
        categoryType: 'EGGS',
        mainCategoryId: mainCategories[3].id,
        sortOrder: 1
      }
    }),
    
    // الحلاوة الطحينية - 1 فئة
    prisma.subCategory.create({
      data: {
        name: 'حلاوة طحينية',
        description: 'حلاوة طحينية أصلية',
        slug: 'halawa',
        categoryType: 'HALAWA',
        mainCategoryId: mainCategories[4].id,
        sortOrder: 1
      }
    })
  ])

  console.log('📁 تم إنشاء الفئات الفرعية')
  console.log('📊 الإحصائيات:')
  console.log(`   📂 الفئات الرئيسية: ${mainCategories.length}`)
  console.log(`   📁 الفئات الفرعية: ${subCategories.length}`)
  console.log('   📝 الفئات الفرعية المضافة:')
  
  // عرض الفئات الرئيسية والفرعية
  mainCategories.forEach((mainCat, index) => {
    console.log(`   ${index + 1}. ${mainCat.name}`)
    const subCats = subCategories.filter(sub => sub.mainCategoryId === mainCat.id)
    subCats.forEach(subCat => {
      console.log(`      - ${subCat.name} (${subCat.categoryType})`)
    })
  })

  console.log('\n✅ تم إنشاء الفئات بنجاح!')
  console.log('📝 الملاحظة: تم إنشاء الفئات فقط، لم يتم إضافة المنتجات بعد')
  console.log('💡 هل تريد إضافة المنتجات أيضاً؟ قل "نعم" للمتابعة')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ خطأ في إضافة البيانات:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
