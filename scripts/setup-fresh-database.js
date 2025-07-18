const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 إعادة تعيين قاعدة البيانات...')

  // حذف البيانات الموجودة بالترتيب الصحيح
  console.log('❌ حذف البيانات الموجودة...')
  
  await prisma.product.deleteMany({})
  console.log('   ✅ تم حذف جميع المنتجات')
  
  await prisma.subCategory.deleteMany({})
  console.log('   ✅ تم حذف جميع الفئات الفرعية')
  
  await prisma.mainCategory.deleteMany({})
  console.log('   ✅ تم حذف جميع الفئات الرئيسية')
  
  await prisma.user.deleteMany({})
  console.log('   ✅ تم حذف جميع المستخدمين')

  console.log('\n🏗️ إنشاء المستخدمين...')
  
  // إنشاء مستخدم إداري
  const adminUser = await prisma.user.create({
    data: {
      name: 'مدير المتجر',
      phone: '+201234567890',
      address: 'عنوان المتجر',
      role: 'ADMIN'
    }
  })
  console.log(`   👤 تم إنشاء المدير: ${adminUser.name}`)

  // إنشاء مستخدمين تجريبيين
  const testUsers = [
    {
      name: 'أحمد محمد',
      phone: '+201111111111',
      address: 'المعادي، القاهرة',
      role: 'USER'
    },
    {
      name: 'فاطمة علي', 
      phone: '+201222222222',
      address: 'مدينة نصر، القاهرة',
      role: 'USER'
    },
    {
      name: 'محمود حسن',
      phone: '+201333333333', 
      address: 'الهرم، الجيزة',
      role: 'USER'
    }
  ]

  for (const userData of testUsers) {
    const user = await prisma.user.create({ data: userData })
    console.log(`   👤 تم إنشاء المستخدم: ${user.name}`)
  }

  console.log('\n📁 إنشاء الفئات الرئيسية...')
  
  // إنشاء الفئات الرئيسية
  const mainCategories = [
    { name: 'لحوم ومصنعات', description: 'جميع أنواع اللحوم والمنتجات المصنعة' },
    { name: 'ألبان ومنتجاتها', description: 'منتجات الألبان والأجبان' },
    { name: 'عسل وطحينة', description: 'العسل الطبيعي والطحينة' },
    { name: 'أخرى', description: 'منتجات متنوعة أخرى' }
  ]

  const createdMainCategories = {}
  for (const catData of mainCategories) {
    const category = await prisma.mainCategory.create({ data: catData })
    createdMainCategories[catData.name] = category
    console.log(`   📁 تم إنشاء فئة: ${category.name}`)
  }

  console.log('\n📂 إنشاء الفئات الفرعية...')
  
  // إنشاء الفئات الفرعية
  const subCategoriesData = [
    // لحوم ومصنعات
    { name: 'برجر', categoryType: 'BURGER', mainCategoryName: 'لحوم ومصنعات' },
    { name: 'كفتة', categoryType: 'KOFTA', mainCategoryName: 'لحوم ومصنعات' },
    { name: 'سجق', categoryType: 'SAUSAGE', mainCategoryName: 'لحوم ومصنعات' },
    { name: 'كباب', categoryType: 'KABAB', mainCategoryName: 'لحوم ومصنعات' },
    { name: 'كبدة', categoryType: 'LIVER', mainCategoryName: 'لحوم ومصنعات' },
    { name: 'لحمة مفرومة', categoryType: 'GROUND_MEAT', mainCategoryName: 'لحوم ومصنعات' },
    { name: 'سوسيس', categoryType: 'SOSIS', mainCategoryName: 'لحوم ومصنعات' },
    { name: 'لانشون', categoryType: 'LUNCHEON', mainCategoryName: 'لحوم ومصنعات' },
    
    // ألبان ومنتجاتها
    { name: 'زبادي', categoryType: 'YOGURT', mainCategoryName: 'ألبان ومنتجاتها' },
    { name: 'لبن', categoryType: 'MILK', mainCategoryName: 'ألبان ومنتجاتها' },
    { name: 'سمن', categoryType: 'BUTTER', mainCategoryName: 'ألبان ومنتجاتها' },
    { name: 'أجبان', categoryType: 'CHEESE', mainCategoryName: 'ألبان ومنتجاتها' },
    
    // عسل وطحينة
    { name: 'عسل', categoryType: 'HONEY', mainCategoryName: 'عسل وطحينة' },
    { name: 'طحينة', categoryType: 'TAHINI', mainCategoryName: 'عسل وطحينة' },
    
    // أخرى
    { name: 'بيض', categoryType: 'EGGS', mainCategoryName: 'أخرى' },
    { name: 'زيت زيتون', categoryType: 'OLIVE_OIL', mainCategoryName: 'أخرى' },
    { name: 'حلاوة طحينية', categoryType: 'HALAWA', mainCategoryName: 'أخرى' }
  ]

  const createdSubCategories = {}
  for (const subCatData of subCategoriesData) {
    const mainCategory = createdMainCategories[subCatData.mainCategoryName]
    const subCategory = await prisma.subCategory.create({
      data: {
        name: subCatData.name,
        categoryType: subCatData.categoryType,
        mainCategoryId: mainCategory.id
      }
    })
    createdSubCategories[subCatData.categoryType] = subCategory
    console.log(`   📂 تم إنشاء فئة فرعية: ${subCategory.name}`)
  }

  console.log('\n🛍️ إنشاء المنتجات...')
  
  // البيانات المنتجات (مبسطة للسرعة)
  const productsData = [
    // برجر
    { name: 'برجر لحمة طازج نصف كيلو', price: 85.00, unitType: 'WEIGHT', category: 'BURGER', subcategory: 'برجر لحمة', isBestSeller: true },
    { name: 'برجر دجاج طازج نصف كيلو', price: 75.00, unitType: 'WEIGHT', category: 'BURGER', subcategory: 'برجر دجاج' },
    { name: 'برجر مشكل كيلو', price: 150.00, oldPrice: 170.00, unitType: 'WEIGHT', category: 'BURGER', subcategory: 'برجر مشكل', isBestSeller: true },
    
    // كفتة
    { name: 'كفتة لحمة نعناع كيلو', price: 180.00, unitType: 'WEIGHT', category: 'KOFTA', subcategory: 'كفتة لحمة', isBestSeller: true },
    { name: 'كفتة دجاج بالخضار نصف كيلو', price: 95.00, unitType: 'WEIGHT', category: 'KOFTA', subcategory: 'كفتة دجاج' },
    { name: 'كفتة مشكل لحمة ودجاج كيلو', price: 165.00, oldPrice: 180.00, unitType: 'WEIGHT', category: 'KOFTA', subcategory: 'كفتة مشكل', isBestSeller: true },
    
    // سجق
    { name: 'سجق حار الوطنية 500 جرام', price: 75.00, unitType: 'PIECE', category: 'SAUSAGE', subcategory: 'سجق حار', isBestSeller: true },
    { name: 'سجق عادي الوطنية 500 جرام', price: 72.00, unitType: 'PIECE', category: 'SAUSAGE', subcategory: 'سجق عادي' },
    
    // لبن
    { name: 'لبن طازج كامل الدسم لتر', price: 25.00, unitType: 'PIECE', category: 'MILK', subcategory: 'لبن كامل الدسم', isBestSeller: true },
    { name: 'لبن قليل الدسم جهينة لتر', price: 28.00, unitType: 'PIECE', category: 'MILK', subcategory: 'لبن قليل الدسم' },
    
    // زبادي
    { name: 'زبادي كامل الدسم جهينة 400 جرام', price: 18.00, unitType: 'PIECE', category: 'YOGURT', subcategory: 'زبادي كامل الدسم', isBestSeller: true },
    { name: 'زبادي بالفواكه المراعي كوب', price: 15.00, oldPrice: 18.00, unitType: 'PIECE', category: 'YOGURT', subcategory: 'زبادي بالفواكه', isBestSeller: true },
    
    // أجبان
    { name: 'جبنة شيدر كيري مثلثات 8 قطع', price: 35.00, unitType: 'PIECE', category: 'CHEESE', subcategory: 'جبنة شيدر', isBestSeller: true },
    { name: 'جبنة رومي بلدي 250 جرام', price: 65.00, unitType: 'PIECE', category: 'CHEESE', subcategory: 'جبنة رومي', isBestSeller: true },
    
    // عسل
    { name: 'عسل جبلي طبيعي 500 جرام', price: 120.00, unitType: 'PIECE', category: 'HONEY', subcategory: 'عسل جبلي', isBestSeller: true },
    { name: 'عسل برسيم طبيعي كيلو', price: 180.00, oldPrice: 200.00, unitType: 'PIECE', category: 'HONEY', subcategory: 'عسل برسيم', isBestSeller: true },
    
    // طحينة
    { name: 'طحينة سمسم بلدي 500 جرام', price: 55.00, unitType: 'PIECE', category: 'TAHINI', subcategory: 'طحينة سمسم', isBestSeller: true },
    { name: 'طحينة سمسم العلالي كيلو', price: 85.00, oldPrice: 95.00, unitType: 'PIECE', category: 'TAHINI', subcategory: 'طحينة العلالي', isBestSeller: true },
    
    // بيض
    { name: 'بيض أحمر طازج 30 بيضة', price: 90.00, unitType: 'PIECE', category: 'EGGS', subcategory: 'بيض أحمر', isBestSeller: true },
    { name: 'بيض أبيض طازج 24 بيضة', price: 72.00, oldPrice: 80.00, unitType: 'PIECE', category: 'EGGS', subcategory: 'بيض أبيض', isBestSeller: true },
    
    // حلاوة طحينية  
    { name: 'حلاوة طحينية سادة 500 جرام', price: 45.00, unitType: 'PIECE', category: 'HALAWA', subcategory: 'حلاوة سادة', isBestSeller: true },
    { name: 'حلاوة طحينية بالفستق 400 جرام', price: 85.00, oldPrice: 95.00, unitType: 'PIECE', category: 'HALAWA', subcategory: 'حلاوة بالفستق', isBestSeller: true }
  ]

  let productCount = 0
  for (const prodData of productsData) {
    const subCategory = createdSubCategories[prodData.category]
    
    const productCreateData = {
      name: prodData.name,
      description: `وصف ${prodData.name}`,
      price: prodData.price,
      images: [`/images/products/${prodData.name.replace(/\s+/g, '-').toLowerCase()}.jpg`],
      unitType: prodData.unitType,
      isAvailable: true,
      isBestSeller: prodData.isBestSeller || false,
      inStock: Math.floor(Math.random() * 50) + 10,
      category: prodData.category,
      subCategoryId: subCategory.id,
      subcategory: prodData.subcategory
    }

    if (prodData.oldPrice) {
      productCreateData.oldPrice = prodData.oldPrice
    }

    await prisma.product.create({ data: productCreateData })
    productCount++
    
    if (productCount % 5 === 0) {
      console.log(`   📦 تم إنشاء ${productCount} منتج...`)
    }
  }

  console.log(`\n✅ تم إنشاء ${productCount} منتج بنجاح!`)
  
  // إحصائيات نهائية
  const finalStats = {
    users: await prisma.user.count(),
    mainCategories: await prisma.mainCategory.count(),
    subCategories: await prisma.subCategory.count(), 
    products: await prisma.product.count()
  }

  console.log('\n📊 الإحصائيات النهائية:')
  console.log(`   👥 المستخدمين: ${finalStats.users}`)
  console.log(`   📁 الفئات الرئيسية: ${finalStats.mainCategories}`)
  console.log(`   📂 الفئات الفرعية: ${finalStats.subCategories}`)
  console.log(`   🛍️ المنتجات: ${finalStats.products}`)
  
  console.log('\n🎉 تم إعداد قاعدة البيانات بنجاح!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ خطأ في إعداد قاعدة البيانات:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
