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
    })
  ])

  console.log('👥 تم إنشاء المستخدمين')

  // إنشاء الفئات الرئيسية (حسب ما تبيعه فعلاً)
  const mainCategories = await Promise.all([
    prisma.mainCategory.create({
      data: {
        name: 'لحوم ومصنعات',
        description: 'لحوم طازجة ومصنعات اللحوم',
        image: '/images/categories/meat.jpg',
        icon: '🥩',
        slug: 'meat-products',
        sortOrder: 1
      }
    }),
    prisma.mainCategory.create({
      data: {
        name: 'ألبان ومنتجاتها',
        description: 'منتجات الألبان والأجبان',
        image: '/images/categories/dairy.jpg',
        icon: '🧀',
        slug: 'dairy-products',
        sortOrder: 2
      }
    }),
    prisma.mainCategory.create({
      data: {
        name: 'عسل وطحينة',
        description: 'عسل طبيعي وطحينة بلدي',
        image: '/images/categories/honey.jpg',
        icon: '🍯',
        slug: 'honey-tahini',
        sortOrder: 3
      }
    }),
    prisma.mainCategory.create({
      data: {
        name: 'أخرى',
        description: 'منتجات متنوعة أخرى',
        image: '/images/categories/others.jpg',
        icon: '🛒',
        slug: 'others',
        sortOrder: 4
      }
    })
  ])

  console.log('📂 تم إنشاء الفئات الرئيسية')

  // إنشاء الفئات الفرعية
  const subCategories = await Promise.all([
    // 1. لحوم ومصنعات - 8 فئات
    prisma.subCategory.create({
      data: {
        name: 'برجر',
        description: 'برجر طازج محضر يومياً',
        slug: 'burger',
        categoryType: 'BURGER',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 1
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'كفتة',
        description: 'كفتة طازجة محضرة يومياً',
        slug: 'kofta',
        categoryType: 'KOFTA',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 2
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'سجق',
        description: 'سجق حار وعادي',
        slug: 'sausage',
        categoryType: 'SAUSAGE',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 3
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'كباب',
        description: 'كباب لحمة ودجاج',
        slug: 'kabab',
        categoryType: 'KABAB',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 4
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'كبدة',
        description: 'كبدة طازجة عالية الجودة',
        slug: 'liver',
        categoryType: 'LIVER',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 5
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'لحمة مفرومة',
        description: 'لحمة مفرومة طازجة',
        slug: 'ground-meat',
        categoryType: 'GROUND_MEAT',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 6
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'سوسيس',
        description: 'سوسيس بأنواعه',
        slug: 'sosis',
        categoryType: 'SOSIS',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 7
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'لانشون',
        description: 'لانشون طازج بأنواعه',
        slug: 'luncheon',
        categoryType: 'LUNCHEON',
        mainCategoryId: mainCategories[0].id,
        sortOrder: 8
      }
    }),
    
    // 2. ألبان ومنتجاتها - 4 فئات
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
        name: 'سمن',
        description: 'سمن بلدي وصناعي',
        slug: 'butter',
        categoryType: 'BUTTER',
        mainCategoryId: mainCategories[1].id,
        sortOrder: 3
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'أجبان',
        description: 'جميع أنواع الجبن - شيدر، رومي، كيري، موزاريلا، فيتا، قريش، كريمي وغيرها',
        slug: 'cheese',
        categoryType: 'CHEESE',
        mainCategoryId: mainCategories[1].id,
        sortOrder: 4
      }
    }),
    
    // 3. عسل وطحينة - 2 فئة
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
    
    // 4. أخرى - 3 فئات
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
    prisma.subCategory.create({
      data: {
        name: 'زيت زيتون',
        description: 'زيت زيتون أصلي',
        slug: 'olive-oil',
        categoryType: 'OLIVE_OIL',
        mainCategoryId: mainCategories[3].id,
        sortOrder: 2
      }
    }),
    prisma.subCategory.create({
      data: {
        name: 'حلاوة طحينية',
        description: 'حلاوة طحينية أصلية بأنواعها',
        slug: 'halawa',
        categoryType: 'HALAWA',
        mainCategoryId: mainCategories[3].id,
        sortOrder: 3
      }
    })
  ])

  console.log('📁 تم إنشاء الفئات الفرعية')
  console.log('\n📊 الإحصائيات:')
  console.log(`   📂 الفئات الرئيسية: ${mainCategories.length}`)
  console.log(`   📁 الفئات الفرعية: ${subCategories.length}`)
  console.log('\n📝 الفئات المضافة:')
  
  // عرض الفئات الرئيسية والفرعية
  console.log('\n1️⃣ لحوم ومصنعات:')
  console.log('   - برجر')
  console.log('   - كفتة')
  console.log('   - سجق')
  console.log('   - كباب')
  console.log('   - كبدة')
  console.log('   - لحمة مفرومة')
  console.log('   - سوسيس')
  console.log('   - لانشون')
  
  console.log('\n2️⃣ ألبان ومنتجاتها:')
  console.log('   - زبادي')
  console.log('   - لبن')
  console.log('   - سمن')
  console.log('   - أجبان (شيدر، رومي، كيري، موزاريلا، فيتا، قريش، كريمي...)')
  
  console.log('\n3️⃣ عسل وطحينة:')
  console.log('   - عسل')
  console.log('   - طحينة')
  
  console.log('\n4️⃣ أخرى:')
  console.log('   - بيض')
  console.log('   - زيت زيتون')
  console.log('   - حلاوة طحينية')

  console.log('\n✅ تم إنشاء الفئات بنجاح!')
  console.log('📝 الملاحظة: تم إنشاء الفئات فقط حسب ما تبيعه فعلاً')
  console.log('💡 المجموع: 17 فئة فرعية في 4 فئات رئيسية')
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
