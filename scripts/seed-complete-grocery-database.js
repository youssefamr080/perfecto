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

  // إنشاء الفئات الرئيسية
  const mainCategories = await Promise.all([
    prisma.mainCategory.create({
      data: {
        name: 'اللحوم والدواجن',
        description: 'أجود أنواع اللحوم والدواجن الطازجة',
        image: '/images/categories/meat.jpg',
        icon: '🥩',
        slug: 'meat-poultry',
        sortOrder: 1
      }
    }),
    prisma.mainCategory.create({
      data: {
        name: 'الألبان ومنتجاتها',
        description: 'منتجات الألبان الطازجة والجبن',
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
        name: 'البيض والمخبوزات',
        description: 'بيض طازج ومخبوزات يومية',
        image: '/images/categories/eggs.jpg',
        icon: '🥚',
        slug: 'eggs-bakery',
        sortOrder: 4
      }
    }),
    prisma.mainCategory.create({
      data: {
        name: 'الحلويات',
        description: 'حلاوة طحينية وحلويات شرقية',
        image: '/images/categories/sweets.jpg',
        icon: '🍬',
        slug: 'sweets',
        sortOrder: 5
      }
    })
  ])

  console.log('📂 تم إنشاء الفئات الرئيسية')

  // إنشاء الفئات الفرعية
  const subCategories = await Promise.all([
    // اللحوم والدواجن
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
    
    // الألبان ومنتجاتها
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
    
    // العسل والطحينة
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
    
    // البيض
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
    
    // الحلويات
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

  // إنشاء المنتجات
  const products = []

  // منتجات اللانشون
  const luncheonProducts = [
    {
      name: 'لانشون دواجن الوطنية 250 جرام',
      description: 'لانشون دواجن طازج من الوطنية، محضر من أجود قطع الدجاج',
      price: 45.00,
      oldPrice: 52.00,
      images: ['/images/products/luncheon-watania-250.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 50,
      category: 'LUNCHEON',
      subCategoryId: subCategories[0].id,
      subcategory: 'لانشون دواجن'
    },
    {
      name: 'لانشون لحمة الوطنية 200 جرام',
      description: 'لانشون لحمة بقري طازج، عالي الجودة ومليء بالنكهة',
      price: 58.00,
      images: ['/images/products/luncheon-meat-watania-200.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 30,
      category: 'LUNCHEON',
      subCategoryId: subCategories[0].id,
      subcategory: 'لانشون لحمة'
    },
    {
      name: 'لانشون بيف الوطنية 300 جرام',
      description: 'لانشون بيف فاخر، طعم مميز ومثالي للساندويتشات',
      price: 72.00,
      images: ['/images/products/luncheon-beef-watania-300.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 25,
      category: 'LUNCHEON',
      subCategoryId: subCategories[0].id,
      subcategory: 'لانشون بيف'
    },
    {
      name: 'لانشون مدخن دومتي 250 جرام',
      description: 'لانشون مدخن بطعم رائع من دومتي، مثالي للإفطار',
      price: 48.00,
      oldPrice: 55.00,
      images: ['/images/products/luncheon-smoked-domty-250.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 40,
      category: 'LUNCHEON',
      subCategoryId: subCategories[0].id,
      subcategory: 'لانشون مدخن'
    }
  ]

  // منتجات البسطرمة
  const pastramiProducts = [
    {
      name: 'بسطرمة لحمة الوطنية 200 جرام',
      description: 'بسطرمة لحمة مدخنة ومتبلة بالتوابل الطبيعية',
      price: 85.00,
      images: ['/images/products/pastrami-meat-watania-200.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 20,
      category: 'PASTRAMI',
      subCategoryId: subCategories[1].id,
      subcategory: 'بسطرمة لحمة'
    },
    {
      name: 'بسطرمة هبرة الوطنية 150 جرام',
      description: 'بسطرمة هبرة فاخرة، طعم أصيل ونكهة مميزة',
      price: 125.00,
      oldPrice: 140.00,
      images: ['/images/products/pastrami-habra-watania-150.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 15,
      category: 'PASTRAMI',
      subCategoryId: subCategories[1].id,
      subcategory: 'بسطرمة هبرة'
    },
    {
      name: 'بسطرمة مفروم الوطنية 200 جرام',
      description: 'بسطرمة مفروم للساندويتشات والمعجنات',
      price: 65.00,
      images: ['/images/products/pastrami-minced-watania-200.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 25,
      category: 'PASTRAMI',
      subCategoryId: subCategories[1].id,
      subcategory: 'بسطرمة مفروم'
    }
  ]

  // منتجات الكفتة
  const koftaProducts = [
    {
      name: 'كفتة لحمة نعناع طازجة كيلو',
      description: 'كفتة لحمة بقري طازجة بالنعناع، محضرة يومياً',
      price: 180.00,
      images: ['/images/products/kofta-meat-mint-1kg.jpg'],
      unitType: 'WEIGHT',
      isBestSeller: true,
      inStock: 10,
      category: 'KOFTA',
      subCategoryId: subCategories[2].id,
      subcategory: 'كفتة لحمة'
    },
    {
      name: 'كفتة دجاج بالخضار نصف كيلو',
      description: 'كفتة دجاج بالخضار الطازجة، صحية ولذيذة',
      price: 95.00,
      images: ['/images/products/kofta-chicken-vegetables-500g.jpg'],
      unitType: 'WEIGHT',
      isBestSeller: false,
      inStock: 15,
      category: 'KOFTA',
      subCategoryId: subCategories[2].id,
      subcategory: 'كفتة دجاج'
    },
    {
      name: 'كفتة مشكل لحمة ودجاج كيلو',
      description: 'كفتة مشكل من اللحمة والدجاج، نكهة رائعة',
      price: 165.00,
      oldPrice: 180.00,
      images: ['/images/products/kofta-mixed-1kg.jpg'],
      unitType: 'WEIGHT',
      isBestSeller: true,
      inStock: 8,
      category: 'KOFTA',
      subCategoryId: subCategories[2].id,
      subcategory: 'كفتة مشكل'
    }
  ]

  // منتجات السجق
  const sausageProducts = [
    {
      name: 'سجق حار الوطنية 500 جرام',
      description: 'سجق حار محضر من أجود أنواع اللحوم والتوابل',
      price: 75.00,
      images: ['/images/products/sausage-hot-watania-500g.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 30,
      category: 'SAUSAGE',
      subCategoryId: subCategories[3].id,
      subcategory: 'سجق حار'
    },
    {
      name: 'سجق عادي الوطنية 500 جرام',
      description: 'سجق عادي بطعم كلاسيكي، مناسب لجميع الأعمار',
      price: 72.00,
      images: ['/images/products/sausage-regular-watania-500g.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 35,
      category: 'SAUSAGE',
      subCategoryId: subCategories[3].id,
      subcategory: 'سجق عادي'
    },
    {
      name: 'سجق دجاج الوطنية 400 جرام',
      description: 'سجق دجاج صحي ولذيذ، قليل الدهون',
      price: 68.00,
      oldPrice: 75.00,
      images: ['/images/products/sausage-chicken-watania-400g.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 20,
      category: 'SAUSAGE',
      subCategoryId: subCategories[3].id,
      subcategory: 'سجق دجاج'
    }
  ]

  // منتجات اللحمة المفرومة
  const groundMeatProducts = [
    {
      name: 'لحمة مفرومة بقري كيلو',
      description: 'لحمة مفرومة بقري طازجة، مفرومة طازج يومياً',
      price: 220.00,
      images: ['/images/products/ground-beef-1kg.jpg'],
      unitType: 'WEIGHT',
      isBestSeller: true,
      inStock: 12,
      category: 'GROUND_MEAT',
      subCategoryId: subCategories[4].id,
      subcategory: 'لحمة مفرومة بقري'
    },
    {
      name: 'لحمة مفرومة ضاني نصف كيلو',
      description: 'لحمة مفرومة ضاني طازجة، نكهة مميزة',
      price: 140.00,
      images: ['/images/products/ground-lamb-500g.jpg'],
      unitType: 'WEIGHT',
      isBestSeller: false,
      inStock: 8,
      category: 'GROUND_MEAT',
      subCategoryId: subCategories[4].id,
      subcategory: 'لحمة مفرومة ضاني'
    },
    {
      name: 'لحمة مفرومة مشكل كيلو',
      description: 'خليط من اللحمة البقري والضاني، طعم رائع',
      price: 195.00,
      oldPrice: 210.00,
      images: ['/images/products/ground-mixed-1kg.jpg'],
      unitType: 'WEIGHT',
      isBestSeller: true,
      inStock: 10,
      category: 'GROUND_MEAT',
      subCategoryId: subCategories[4].id,
      subcategory: 'لحمة مفرومة مشكل'
    }
  ]

  // منتجات الكبدة
  const liverProducts = [
    {
      name: 'كبدة بقري طازجة كيلو',
      description: 'كبدة بقري طازجة، غنية بالحديد والفيتامينات',
      price: 145.00,
      images: ['/images/products/liver-beef-1kg.jpg'],
      unitType: 'WEIGHT',
      isBestSeller: true,
      inStock: 8,
      category: 'LIVER',
      subCategoryId: subCategories[5].id,
      subcategory: 'كبدة بقري'
    },
    {
      name: 'كبدة دجاج طازجة 500 جرام',
      description: 'كبدة دجاج طازجة، طرية ولذيذة',
      price: 65.00,
      images: ['/images/products/liver-chicken-500g.jpg'],
      unitType: 'WEIGHT',
      isBestSeller: false,
      inStock: 15,
      category: 'LIVER',
      subCategoryId: subCategories[5].id,
      subcategory: 'كبدة دجاج'
    }
  ]

  // منتجات الزبادي
  const yogurtProducts = [
    {
      name: 'زبادي كامل الدسم جهينة 400 جرام',
      description: 'زبادي كامل الدسم طبيعي وكريمي من جهينة',
      price: 18.00,
      images: ['/images/products/yogurt-juhayna-400g.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 60,
      category: 'YOGURT',
      subCategoryId: subCategories[6].id,
      subcategory: 'زبادي كامل الدسم'
    },
    {
      name: 'زبادي قليل الدسم دانون 150 جرام',
      description: 'زبادي قليل الدسم صحي ومناسب للدايت',
      price: 12.00,
      images: ['/images/products/yogurt-danone-150g.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 40,
      category: 'YOGURT',
      subCategoryId: subCategories[6].id,
      subcategory: 'زبادي قليل الدسم'
    },
    {
      name: 'زبادي بالفواكه المراعي كوب',
      description: 'زبادي بالفواكه المشكلة، طعم رائع ومغذي',
      price: 15.00,
      oldPrice: 18.00,
      images: ['/images/products/yogurt-almarai-fruits.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 50,
      category: 'YOGURT',
      subCategoryId: subCategories[6].id,
      subcategory: 'زبادي بالفواكه'
    },
    {
      name: 'زبادي يوناني لبنيتا 200 جرام',
      description: 'زبادي يوناني كثيف وغني بالبروتين',
      price: 22.00,
      images: ['/images/products/yogurt-greek-labanita-200g.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 25,
      category: 'YOGURT',
      subCategoryId: subCategories[6].id,
      subcategory: 'زبادي يوناني'
    }
  ]

  // منتجات اللبن
  const milkProducts = [
    {
      name: 'لبن طازج كامل الدسم لتر',
      description: 'لبن طازج كامل الدسم من مزارع محلية',
      price: 25.00,
      images: ['/images/products/milk-fresh-whole-1l.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 40,
      category: 'MILK',
      subCategoryId: subCategories[7].id,
      subcategory: 'لبن كامل الدسم'
    },
    {
      name: 'لبن قليل الدسم جهينة لتر',
      description: 'لبن قليل الدسم صحي ومبستر',
      price: 28.00,
      images: ['/images/products/milk-low-fat-juhayna-1l.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 35,
      category: 'MILK',
      subCategoryId: subCategories[7].id,
      subcategory: 'لبن قليل الدسم'
    },
    {
      name: 'لبن خالي الدسم المراعي لتر',
      description: 'لبن خالي الدسم للدايت ومرضى السكر',
      price: 32.00,
      oldPrice: 35.00,
      images: ['/images/products/milk-fat-free-almarai-1l.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 20,
      category: 'MILK',
      subCategoryId: subCategories[7].id,
      subcategory: 'لبن خالي الدسم'
    },
    {
      name: 'لبن رايب جهينة 200 مل',
      description: 'لبن رايب منعش ومفيد للهضم',
      price: 8.00,
      images: ['/images/products/milk-buttermilk-juhayna-200ml.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 80,
      category: 'MILK',
      subCategoryId: subCategories[7].id,
      subcategory: 'لبن رايب'
    }
  ]

  // منتجات الجبن والسمنة
  const cheeseProducts = [
    {
      name: 'جبنة شيدر كيري مثلثات 8 قطع',
      description: 'جبنة شيدر كيري كريمية ولذيذة، مثالية للساندويتشات',
      price: 35.00,
      images: ['/images/products/cheese-cheddar-kiri-8pieces.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 60,
      category: 'CHEESE',
      subCategoryId: subCategories[8].id,
      subcategory: 'جبنة شيدر'
    },
    {
      name: 'جبنة رومي بلدي 250 جرام',
      description: 'جبنة رومي بلدي أصلية، طعم قوي ومميز',
      price: 65.00,
      images: ['/images/products/cheese-romy-local-250g.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 30,
      category: 'CHEESE_BUTTER',
      subCategoryId: subCategories[8].id,
      subcategory: 'جبنة رومي'
    },
    {
      name: 'جبنة موزاريلا دومتي 200 جرام',
      description: 'جبنة موزاريلا طازجة، مثالية للبيتزا والمعجنات',
      price: 42.00,
      oldPrice: 48.00,
      images: ['/images/products/cheese-mozzarella-domty-200g.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 45,
      category: 'CHEESE_BUTTER',
      subCategoryId: subCategories[8].id,
      subcategory: 'جبنة موزاريلا'
    },
    {
      name: 'جبنة فيتا بلغارية 400 جرام',
      description: 'جبنة فيتا بلغارية أصلية، مملحة ولذيذة',
      price: 55.00,
      images: ['/images/products/cheese-feta-bulgarian-400g.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 25,
      category: 'CHEESE_BUTTER',
      subCategoryId: subCategories[8].id,
      subcategory: 'جبنة فيتا'
    },
    {
      name: 'جبنة قريش طازجة 500 جرام',
      description: 'جبنة قريش طازجة ومنزوعة الملح، صحية ومفيدة',
      price: 28.00,
      images: ['/images/products/cheese-cottage-fresh-500g.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 20,
      category: 'CHEESE_BUTTER',
      subCategoryId: subCategories[8].id,
      subcategory: 'جبنة قريش'
    },
    {
      name: 'جبنة كريمي فيلادلفيا 200 جرام',
      description: 'جبنة كريمي ناعمة، مثالية للحلويات والساندويتشات',
      price: 48.00,
      images: ['/images/products/cheese-cream-philadelphia-200g.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 40,
      category: 'CHEESE_BUTTER',
      subCategoryId: subCategories[8].id,
      subcategory: 'جبنة كريمي'
    },
    {
      name: 'سمنة بلدي طبيعية 500 جرام',
      description: 'سمنة بلدي طبيعية 100%، طعم أصيل ورائحة مميزة',
      price: 85.00,
      oldPrice: 95.00,
      images: ['/images/products/butter-local-natural-500g.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 15,
      category: 'CHEESE_BUTTER',
      subCategoryId: subCategories[8].id,
      subcategory: 'سمنة بلدي'
    }
  ]

  // منتجات العسل
  const honeyProducts = [
    {
      name: 'عسل جبلي طبيعي 500 جرام',
      description: 'عسل جبلي طبيعي 100%، من مناحل الصعيد',
      price: 120.00,
      images: ['/images/products/honey-mountain-natural-500g.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 20,
      category: 'HONEY',
      subCategoryId: subCategories[9].id,
      subcategory: 'عسل جبلي'
    },
    {
      name: 'عسل برسيم طبيعي كيلو',
      description: 'عسل برسيم طبيعي، حلو المذاق وغني بالفوائد',
      price: 180.00,
      oldPrice: 200.00,
      images: ['/images/products/honey-clover-natural-1kg.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 15,
      category: 'HONEY',
      subCategoryId: subCategories[9].id,
      subcategory: 'عسل برسيم'
    },
    {
      name: 'عسل سدر جبلي 250 جرام',
      description: 'عسل سدر جبلي فاخر، طعم مميز وفوائد عظيمة',
      price: 150.00,
      images: ['/images/products/honey-sidr-mountain-250g.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 10,
      category: 'HONEY',
      subCategoryId: subCategories[9].id,
      subcategory: 'عسل سدر'
    },
    {
      name: 'عسل حبة البركة 350 جرام',
      description: 'عسل مخلوط بحبة البركة، مفيد للصحة العامة',
      price: 95.00,
      images: ['/images/products/honey-black-seed-350g.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 25,
      category: 'HONEY',
      subCategoryId: subCategories[9].id,
      subcategory: 'عسل حبة البركة'
    }
  ]

  // منتجات الطحينة
  const tahiniProducts = [
    {
      name: 'طحينة سمسم بلدي 500 جرام',
      description: 'طحينة سمسم بلدي خالص، محضرة تقليدياً',
      price: 55.00,
      images: ['/images/products/tahini-sesame-local-500g.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 30,
      category: 'TAHINI',
      subCategoryId: subCategories[10].id,
      subcategory: 'طحينة سمسم'
    },
    {
      name: 'طحينة سمسم العلالي كيلو',
      description: 'طحينة سمسم عالية الجودة من العلالي',
      price: 85.00,
      oldPrice: 95.00,
      images: ['/images/products/tahini-alali-1kg.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 20,
      category: 'TAHINI',
      subCategoryId: subCategories[10].id,
      subcategory: 'طحينة العلالي'
    },
    {
      name: 'طحينة حلاوة فاخرة 750 جرام',
      description: 'طحينة خاصة لصنع الحلاوة، كريمية ولذيذة',
      price: 70.00,
      images: ['/images/products/tahini-halawa-luxury-750g.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 15,
      category: 'TAHINI',
      subCategoryId: subCategories[10].id,
      subcategory: 'طحينة حلاوة'
    }
  ]

  // منتجات البيض
  const eggProducts = [
    {
      name: 'بيض أحمر طازج 30 بيضة',
      description: 'بيض أحمر طازج من مزارع محلية، غني بالبروتين',
      price: 90.00,
      images: ['/images/products/eggs-red-fresh-30pieces.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 25,
      category: 'EGGS',
      subCategoryId: subCategories[11].id,
      subcategory: 'بيض أحمر'
    },
    {
      name: 'بيض أبيض طازج 24 بيضة',
      description: 'بيض أبيض طازج، جودة عالية وطعم رائع',
      price: 72.00,
      oldPrice: 80.00,
      images: ['/images/products/eggs-white-fresh-24pieces.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 30,
      category: 'EGGS',
      subCategoryId: subCategories[11].id,
      subcategory: 'بيض أبيض'
    },
    {
      name: 'بيض عضوي طازج 12 بيضة',
      description: 'بيض عضوي من دجاج حر، خالي من المضادات الحيوية',
      price: 65.00,
      images: ['/images/products/eggs-organic-fresh-12pieces.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 15,
      category: 'EGGS',
      subCategoryId: subCategories[11].id,
      subcategory: 'بيض عضوي'
    }
  ]

  // منتجات الحلاوة الطحينية
  const halawaProducts = [
    {
      name: 'حلاوة طحينية سادة 500 جرام',
      description: 'حلاوة طحينية سادة تقليدية، طعم أصيل',
      price: 45.00,
      images: ['/images/products/halawa-plain-500g.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 40,
      category: 'HALAWA',
      subCategoryId: subCategories[12].id,
      subcategory: 'حلاوة سادة'
    },
    {
      name: 'حلاوة طحينية بالفستق 400 جرام',
      description: 'حلاوة طحينية بالفستق الحلبي، نكهة مميزة',
      price: 85.00,
      oldPrice: 95.00,
      images: ['/images/products/halawa-pistachio-400g.jpg'],
      unitType: 'PIECE',
      isBestSeller: true,
      inStock: 25,
      category: 'HALAWA',
      subCategoryId: subCategories[12].id,
      subcategory: 'حلاوة بالفستق'
    },
    {
      name: 'حلاوة طحينية بالكاكاو 350 جرام',
      description: 'حلاوة طحينية بالكاكاو، طعم الشوكولاتة الرائع',
      price: 52.00,
      images: ['/images/products/halawa-cocoa-350g.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 30,
      category: 'HALAWA',
      subCategoryId: subCategories[12].id,
      subcategory: 'حلاوة بالكاكاو'
    },
    {
      name: 'حلاوة طحينية باللوز 300 جرام',
      description: 'حلاوة طحينية باللوز المقشر، غنية ومغذية',
      price: 75.00,
      images: ['/images/products/halawa-almond-300g.jpg'],
      unitType: 'PIECE',
      isBestSeller: false,
      inStock: 20,
      category: 'HALAWA',
      subCategoryId: subCategories[12].id,
      subcategory: 'حلاوة باللوز'
    }
  ]

  // جمع جميع المنتجات
  const allProducts = [
    ...luncheonProducts,
    ...pastramiProducts,
    ...koftaProducts,
    ...sausageProducts,
    ...groundMeatProducts,
    ...liverProducts,
    ...yogurtProducts,
    ...milkProducts,
    ...cheeseProducts,
    ...honeyProducts,
    ...tahiniProducts,
    ...eggProducts,
    ...halawaProducts
  ]

  // إضافة المنتجات إلى قاعدة البيانات
  for (const productData of allProducts) {
    await prisma.product.create({
      data: productData
    })
  }

  console.log('🛍️ تم إنشاء المنتجات')

  // إنشاء بعض الطلبات النموذجية
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        userId: users[0].id,
        customerName: users[0].name,
        customerPhone: users[0].phone,
        customerAddress: users[0].defaultAddress || 'المعادي، شارع 9',
        status: 'DELIVERED',
        total: 235.00,
        deliveryFee: 20.00,
        notes: 'يرجى التوصيل قبل الساعة 6 مساءً',
        orderItems: {
          create: [
            {
              productId: (await prisma.product.findFirst({ where: { name: { contains: 'لانشون دواجن الوطنية' } } })).id,
              quantity: 2,
              price: 45.00
            },
            {
              productId: (await prisma.product.findFirst({ where: { name: { contains: 'جبنة شيدر كيري' } } })).id,
              quantity: 1,
              price: 35.00
            },
            {
              productId: (await prisma.product.findFirst({ where: { name: { contains: 'عسل جبلي طبيعي' } } })).id,
              quantity: 1,
              price: 120.00
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        userId: users[1].id,
        customerName: users[1].name,
        customerPhone: users[1].phone,
        customerAddress: users[1].defaultAddress || 'مدينة نصر، التجمع الأول',
        status: 'PREPARING',
        total: 185.00,
        deliveryFee: 20.00,
        notes: 'طلب عاجل',
        orderItems: {
          create: [
            {
              productId: (await prisma.product.findFirst({ where: { name: { contains: 'بسطرمة هبرة الوطنية' } } })).id,
              quantity: 1,
              price: 125.00
            },
            {
              productId: (await prisma.product.findFirst({ where: { name: { contains: 'بيض أحمر طازج' } } })).id,
              quantity: 1,
              price: 90.00
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        userId: users[2].id,
        customerName: users[2].name,
        customerPhone: users[2].phone,
        customerAddress: users[2].defaultAddress || 'الزمالك، شارع الكمال',
        status: 'PENDING',
        total: 145.00,
        deliveryFee: 20.00,
        orderItems: {
          create: [
            {
              productId: (await prisma.product.findFirst({ where: { name: { contains: 'كفتة لحمة نعناع' } } })).id,
              quantity: 0.5, // نصف كيلو
              price: 90.00
            },
            {
              productId: (await prisma.product.findFirst({ where: { name: { contains: 'حلاوة طحينية بالفستق' } } })).id,
              quantity: 1,
              price: 85.00
            }
          ]
        }
      }
    })
  ])

  console.log('📦 تم إنشاء الطلبات النموذجية')

  console.log('✅ تم إنشاء جميع البيانات بنجاح!')
  console.log(`📊 الإحصائيات:`)
  console.log(`   👥 المستخدمين: ${users.length}`)
  console.log(`   📂 الفئات الرئيسية: ${mainCategories.length}`)
  console.log(`   📁 الفئات الفرعية: ${subCategories.length}`)
  console.log(`   🛍️ المنتجات: ${allProducts.length}`)
  console.log(`   📦 الطلبات: ${orders.length}`)
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
