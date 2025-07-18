const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء إضافة المنتجات...')

  // جلب الفئات الفرعية
  const subCategories = await prisma.subCategory.findMany({
    include: {
      mainCategory: true
    }
  })

  // تنظيم الفئات حسب النوع
  const categoryMap = {}
  subCategories.forEach(subCat => {
    categoryMap[subCat.categoryType] = subCat.id
  })

  // إضافة المنتجات حسب الفئات

  // 1. برجر
  const burgerProducts = [
    {
      name: 'برجر لحمة طازج نصف كيلو',
      description: 'برجر لحمة بقري طازج محضر يومياً، مثالي للشواء',
      price: 85.00,
      images: ['/images/products/burger-beef-500g.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: true,
      inStock: 20,
      category: 'BURGER',
      subCategoryId: categoryMap['BURGER'],
      subcategory: 'برجر لحمة'
    },
    {
      name: 'برجر دجاج طازج نصف كيلو',
      description: 'برجر دجاج طازج وصحي، مناسب للدايت',
      price: 75.00,
      images: ['/images/products/burger-chicken-500g.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: false,
      inStock: 15,
      category: 'BURGER',
      subCategoryId: categoryMap['BURGER'],
      subcategory: 'برجر دجاج'
    },
    {
      name: 'برجر مشكل كيلو',
      description: 'برجر مشكل من اللحمة والدجاج، طعم رائع',
      price: 150.00,
      oldPrice: 170.00,
      images: ['/images/products/burger-mixed-1kg.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: true,
      inStock: 12,
      category: 'BURGER',
      subCategoryId: categoryMap['BURGER'],
      subcategory: 'برجر مشكل'
    }
  ]

  // 2. كفتة
  const koftaProducts = [
    {
      name: 'كفتة لحمة نعناع كيلو',
      description: 'كفتة لحمة بقري طازجة بالنعناع، محضرة يومياً',
      price: 180.00,
      images: ['/images/products/kofta-meat-mint-1kg.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: true,
      inStock: 10,
      category: 'KOFTA',
      subCategoryId: categoryMap['KOFTA'],
      subcategory: 'كفتة لحمة'
    },
    {
      name: 'كفتة دجاج بالخضار نصف كيلو',
      description: 'كفتة دجاج بالخضار الطازجة، صحية ولذيذة',
      price: 95.00,
      images: ['/images/products/kofta-chicken-vegetables-500g.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: false,
      inStock: 15,
      category: 'KOFTA',
      subCategoryId: categoryMap['KOFTA'],
      subcategory: 'كفتة دجاج'
    },
    {
      name: 'كفتة مشكل لحمة ودجاج كيلو',
      description: 'كفتة مشكل من اللحمة والدجاج، نكهة رائعة',
      price: 165.00,
      oldPrice: 180.00,
      images: ['/images/products/kofta-mixed-1kg.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: true,
      inStock: 8,
      category: 'KOFTA',
      subCategoryId: categoryMap['KOFTA'],
      subcategory: 'كفتة مشكل'
    }
  ]

  // 3. سجق
  const sausageProducts = [
    {
      name: 'سجق حار الوطنية 500 جرام',
      description: 'سجق حار محضر من أجود أنواع اللحوم والتوابل',
      price: 75.00,
      images: ['/images/products/sausage-hot-watania-500g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 30,
      category: 'SAUSAGE',
      subCategoryId: categoryMap['SAUSAGE'],
      subcategory: 'سجق حار'
    },
    {
      name: 'سجق عادي الوطنية 500 جرام',
      description: 'سجق عادي بطعم كلاسيكي، مناسب لجميع الأعمار',
      price: 72.00,
      images: ['/images/products/sausage-regular-watania-500g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 35,
      category: 'SAUSAGE',
      subCategoryId: categoryMap['SAUSAGE'],
      subcategory: 'سجق عادي'
    },
    {
      name: 'سجق دجاج الوطنية 400 جرام',
      description: 'سجق دجاج صحي ولذيذ، قليل الدهون',
      price: 68.00,
      oldPrice: 75.00,
      images: ['/images/products/sausage-chicken-watania-400g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 20,
      category: 'SAUSAGE',
      subCategoryId: categoryMap['SAUSAGE'],
      subcategory: 'سجق دجاج'
    }
  ]

  // 4. كباب
  const kababProducts = [
    {
      name: 'كباب لحمة ضاني كيلو',
      description: 'كباب لحمة ضاني طازج ومتبل بالطريقة البلدي',
      price: 220.00,
      images: ['/images/products/kabab-lamb-1kg.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: true,
      inStock: 8,
      category: 'KABAB',
      subCategoryId: categoryMap['KABAB'],
      subcategory: 'كباب لحمة'
    },
    {
      name: 'كباب دجاج مشوي نصف كيلو',
      description: 'كباب دجاج طازج ومتبل، جاهز للشواء',
      price: 110.00,
      images: ['/images/products/kabab-chicken-500g.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: false,
      inStock: 12,
      category: 'KABAB',
      subCategoryId: categoryMap['KABAB'],
      subcategory: 'كباب دجاج'
    },
    {
      name: 'كباب مشكل لحمة ودجاج كيلو',
      description: 'كباب مشكل من اللحمة والدجاج، نكهة مميزة',
      price: 185.00,
      oldPrice: 200.00,
      images: ['/images/products/kabab-mixed-1kg.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: true,
      inStock: 6,
      category: 'KABAB',
      subCategoryId: categoryMap['KABAB'],
      subcategory: 'كباب مشكل'
    }
  ]

  // 5. كبدة
  const liverProducts = [
    {
      name: 'كبدة بقري طازجة كيلو',
      description: 'كبدة بقري طازجة، غنية بالحديد والفيتامينات',
      price: 145.00,
      images: ['/images/products/liver-beef-1kg.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: true,
      inStock: 8,
      category: 'LIVER',
      subCategoryId: categoryMap['LIVER'],
      subcategory: 'كبدة بقري'
    },
    {
      name: 'كبدة دجاج طازجة 500 جرام',
      description: 'كبدة دجاج طازجة، طرية ولذيذة',
      price: 65.00,
      images: ['/images/products/liver-chicken-500g.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: false,
      inStock: 15,
      category: 'LIVER',
      subCategoryId: categoryMap['LIVER'],
      subcategory: 'كبدة دجاج'
    },
    {
      name: 'كبدة ضاني طازجة نصف كيلو',
      description: 'كبدة ضاني طازجة، طعم مميز ومغذية',
      price: 120.00,
      images: ['/images/products/liver-lamb-500g.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: false,
      inStock: 10,
      category: 'LIVER',
      subCategoryId: categoryMap['LIVER'],
      subcategory: 'كبدة ضاني'
    }
  ]

  // 6. لحمة مفرومة
  const groundMeatProducts = [
    {
      name: 'لحمة مفرومة بقري كيلو',
      description: 'لحمة مفرومة بقري طازجة، مفرومة طازج يومياً',
      price: 220.00,
      images: ['/images/products/ground-beef-1kg.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: true,
      inStock: 12,
      category: 'GROUND_MEAT',
      subCategoryId: categoryMap['GROUND_MEAT'],
      subcategory: 'لحمة مفرومة بقري'
    },
    {
      name: 'لحمة مفرومة ضاني نصف كيلو',
      description: 'لحمة مفرومة ضاني طازجة، نكهة مميزة',
      price: 140.00,
      images: ['/images/products/ground-lamb-500g.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: false,
      inStock: 8,
      category: 'GROUND_MEAT',
      subCategoryId: categoryMap['GROUND_MEAT'],
      subcategory: 'لحمة مفرومة ضاني'
    },
    {
      name: 'لحمة مفرومة مشكل كيلو',
      description: 'خليط من اللحمة البقري والضاني، طعم رائع',
      price: 195.00,
      oldPrice: 210.00,
      images: ['/images/products/ground-mixed-1kg.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: true,
      inStock: 10,
      category: 'GROUND_MEAT',
      subCategoryId: categoryMap['GROUND_MEAT'],
      subcategory: 'لحمة مفرومة مشكل'
    }
  ]

  // 7. سوسيس
  const sosisProducts = [
    {
      name: 'سوسيس لحمة الوطنية كيلو',
      description: 'سوسيس لحمة طازج، طعم أصيل ومميز',
      price: 95.00,
      images: ['/images/products/sosis-meat-watania-1kg.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: true,
      inStock: 25,
      category: 'SOSIS',
      subCategoryId: categoryMap['SOSIS'],
      subcategory: 'سوسيس لحمة'
    },
    {
      name: 'سوسيس دجاج الوطنية 750 جرام',
      description: 'سوسيس دجاج صحي ولذيذ، قليل الدهون',
      price: 80.00,
      oldPrice: 90.00,
      images: ['/images/products/sosis-chicken-watania-750g.jpg'],
      unitType: 'WEIGHT',
      isAvailable: true,
      isBestSeller: false,
      inStock: 20,
      category: 'SOSIS',
      subCategoryId: categoryMap['SOSIS'],
      subcategory: 'سوسيس دجاج'
    }
  ]

  // 8. لانشون
  const luncheonProducts = [
    {
      name: 'لانشون دواجن الوطنية 250 جرام',
      description: 'لانشون دواجن طازج من الوطنية، محضر من أجود قطع الدجاج',
      price: 45.00,
      oldPrice: 52.00,
      images: ['/images/products/luncheon-watania-250.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 50,
      category: 'LUNCHEON',
      subCategoryId: categoryMap['LUNCHEON'],
      subcategory: 'لانشون دواجن'
    },
    {
      name: 'لانشون لحمة الوطنية 200 جرام',
      description: 'لانشون لحمة بقري طازج، عالي الجودة ومليء بالنكهة',
      price: 58.00,
      images: ['/images/products/luncheon-meat-watania-200.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 30,
      category: 'LUNCHEON',
      subCategoryId: categoryMap['LUNCHEON'],
      subcategory: 'لانشون لحمة'
    },
    {
      name: 'لانشون بيف الوطنية 300 جرام',
      description: 'لانشون بيف فاخر، طعم مميز ومثالي للساندويتشات',
      price: 72.00,
      images: ['/images/products/luncheon-beef-watania-300.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 25,
      category: 'LUNCHEON',
      subCategoryId: categoryMap['LUNCHEON'],
      subcategory: 'لانشون بيف'
    }
  ]

  // 9. زبادي
  const yogurtProducts = [
    {
      name: 'زبادي كامل الدسم جهينة 400 جرام',
      description: 'زبادي كامل الدسم طبيعي وكريمي من جهينة',
      price: 18.00,
      images: ['/images/products/yogurt-juhayna-400g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 60,
      category: 'YOGURT',
      subCategoryId: categoryMap['YOGURT'],
      subcategory: 'زبادي كامل الدسم'
    },
    {
      name: 'زبادي قليل الدسم دانون 150 جرام',
      description: 'زبادي قليل الدسم صحي ومناسب للدايت',
      price: 12.00,
      images: ['/images/products/yogurt-danone-150g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 40,
      category: 'YOGURT',
      subCategoryId: categoryMap['YOGURT'],
      subcategory: 'زبادي قليل الدسم'
    },
    {
      name: 'زبادي بالفواكه المراعي كوب',
      description: 'زبادي بالفواكه المشكلة، طعم رائع ومغذي',
      price: 15.00,
      oldPrice: 18.00,
      images: ['/images/products/yogurt-almarai-fruits.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 50,
      category: 'YOGURT',
      subCategoryId: categoryMap['YOGURT'],
      subcategory: 'زبادي بالفواكه'
    },
    {
      name: 'زبادي يوناني لبنيتا 200 جرام',
      description: 'زبادي يوناني كثيف وغني بالبروتين',
      price: 22.00,
      images: ['/images/products/yogurt-greek-labanita-200g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 25,
      category: 'YOGURT',
      subCategoryId: categoryMap['YOGURT'],
      subcategory: 'زبادي يوناني'
    }
  ]

  // 10. لبن
  const milkProducts = [
    {
      name: 'لبن طازج كامل الدسم لتر',
      description: 'لبن طازج كامل الدسم من مزارع محلية',
      price: 25.00,
      images: ['/images/products/milk-fresh-whole-1l.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 40,
      category: 'MILK',
      subCategoryId: categoryMap['MILK'],
      subcategory: 'لبن كامل الدسم'
    },
    {
      name: 'لبن قليل الدسم جهينة لتر',
      description: 'لبن قليل الدسم صحي ومبستر',
      price: 28.00,
      images: ['/images/products/milk-low-fat-juhayna-1l.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 35,
      category: 'MILK',
      subCategoryId: categoryMap['MILK'],
      subcategory: 'لبن قليل الدسم'
    },
    {
      name: 'لبن خالي الدسم المراعي لتر',
      description: 'لبن خالي الدسم للدايت ومرضى السكر',
      price: 32.00,
      oldPrice: 35.00,
      images: ['/images/products/milk-fat-free-almarai-1l.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 20,
      category: 'MILK',
      subCategoryId: categoryMap['MILK'],
      subcategory: 'لبن خالي الدسم'
    },
    {
      name: 'لبن رايب جهينة 200 مل',
      description: 'لبن رايب منعش ومفيد للهضم',
      price: 8.00,
      images: ['/images/products/milk-buttermilk-juhayna-200ml.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 80,
      category: 'MILK',
      subCategoryId: categoryMap['MILK'],
      subcategory: 'لبن رايب'
    }
  ]

  // 11. سمن
  const butterProducts = [
    {
      name: 'سمنة بلدي طبيعية 500 جرام',
      description: 'سمنة بلدي طبيعية 100%، طعم أصيل ورائحة مميزة',
      price: 85.00,
      oldPrice: 95.00,
      images: ['/images/products/butter-local-natural-500g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 15,
      category: 'BUTTER',
      subCategoryId: categoryMap['BUTTER'],
      subcategory: 'سمنة بلدي'
    },
    {
      name: 'سمنة صناعي النهضة كيلو',
      description: 'سمنة صناعي عالية الجودة للطبخ والحلويات',
      price: 65.00,
      images: ['/images/products/butter-industrial-nahda-1kg.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 25,
      category: 'BUTTER',
      subCategoryId: categoryMap['BUTTER'],
      subcategory: 'سمنة صناعي'
    }
  ]

  // 12. أجبان (منتجات متنوعة)
  const cheeseProducts = [
    {
      name: 'جبنة شيدر كيري مثلثات 8 قطع',
      description: 'جبنة شيدر كيري كريمية ولذيذة، مثالية للساندويتشات',
      price: 35.00,
      images: ['/images/products/cheese-cheddar-kiri-8pieces.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 60,
      category: 'CHEESE',
      subCategoryId: categoryMap['CHEESE'],
      subcategory: 'جبنة شيدر'
    },
    {
      name: 'جبنة رومي بلدي 250 جرام',
      description: 'جبنة رومي بلدي أصلية، طعم قوي ومميز',
      price: 65.00,
      images: ['/images/products/cheese-romy-local-250g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 30,
      category: 'CHEESE',
      subCategoryId: categoryMap['CHEESE'],
      subcategory: 'جبنة رومي'
    },
    {
      name: 'جبنة موزاريلا دومتي 200 جرام',
      description: 'جبنة موزاريلا طازجة، مثالية للبيتزا والمعجنات',
      price: 42.00,
      oldPrice: 48.00,
      images: ['/images/products/cheese-mozzarella-domty-200g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 45,
      category: 'CHEESE',
      subCategoryId: categoryMap['CHEESE'],
      subcategory: 'جبنة موزاريلا'
    },
    {
      name: 'جبنة فيتا بلغارية 400 جرام',
      description: 'جبنة فيتا بلغارية أصلية، مملحة ولذيذة',
      price: 55.00,
      images: ['/images/products/cheese-feta-bulgarian-400g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 25,
      category: 'CHEESE',
      subCategoryId: categoryMap['CHEESE'],
      subcategory: 'جبنة فيتا'
    },
    {
      name: 'جبنة قريش طازجة 500 جرام',
      description: 'جبنة قريش طازجة ومنزوعة الملح، صحية ومفيدة',
      price: 28.00,
      images: ['/images/products/cheese-cottage-fresh-500g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 20,
      category: 'CHEESE',
      subCategoryId: categoryMap['CHEESE'],
      subcategory: 'جبنة قريش'
    },
    {
      name: 'جبنة كريمي فيلادلفيا 200 جرام',
      description: 'جبنة كريمي ناعمة، مثالية للحلويات والساندويتشات',
      price: 48.00,
      images: ['/images/products/cheese-cream-philadelphia-200g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 40,
      category: 'CHEESE',
      subCategoryId: categoryMap['CHEESE'],
      subcategory: 'جبنة كريمي'
    }
  ]

  // 13. عسل
  const honeyProducts = [
    {
      name: 'عسل جبلي طبيعي 500 جرام',
      description: 'عسل جبلي طبيعي 100%، من مناحل الصعيد',
      price: 120.00,
      images: ['/images/products/honey-mountain-natural-500g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 20,
      category: 'HONEY',
      subCategoryId: categoryMap['HONEY'],
      subcategory: 'عسل جبلي'
    },
    {
      name: 'عسل برسيم طبيعي كيلو',
      description: 'عسل برسيم طبيعي، حلو المذاق وغني بالفوائد',
      price: 180.00,
      oldPrice: 200.00,
      images: ['/images/products/honey-clover-natural-1kg.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 15,
      category: 'HONEY',
      subCategoryId: categoryMap['HONEY'],
      subcategory: 'عسل برسيم'
    },
    {
      name: 'عسل سدر جبلي 250 جرام',
      description: 'عسل سدر جبلي فاخر، طعم مميز وفوائد عظيمة',
      price: 150.00,
      images: ['/images/products/honey-sidr-mountain-250g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 10,
      category: 'HONEY',
      subCategoryId: categoryMap['HONEY'],
      subcategory: 'عسل سدر'
    },
    {
      name: 'عسل حبة البركة 350 جرام',
      description: 'عسل مخلوط بحبة البركة، مفيد للصحة العامة',
      price: 95.00,
      images: ['/images/products/honey-black-seed-350g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 25,
      category: 'HONEY',
      subCategoryId: categoryMap['HONEY'],
      subcategory: 'عسل حبة البركة'
    }
  ]

  // 14. طحينة
  const tahiniProducts = [
    {
      name: 'طحينة سمسم بلدي 500 جرام',
      description: 'طحينة سمسم بلدي خالص، محضرة تقليدياً',
      price: 55.00,
      images: ['/images/products/tahini-sesame-local-500g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 30,
      category: 'TAHINI',
      subCategoryId: categoryMap['TAHINI'],
      subcategory: 'طحينة سمسم'
    },
    {
      name: 'طحينة سمسم العلالي كيلو',
      description: 'طحينة سمسم عالية الجودة من العلالي',
      price: 85.00,
      oldPrice: 95.00,
      images: ['/images/products/tahini-alali-1kg.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 20,
      category: 'TAHINI',
      subCategoryId: categoryMap['TAHINI'],
      subcategory: 'طحينة العلالي'
    },
    {
      name: 'طحينة حلاوة فاخرة 750 جرام',
      description: 'طحينة خاصة لصنع الحلاوة، كريمية ولذيذة',
      price: 70.00,
      images: ['/images/products/tahini-halawa-luxury-750g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 15,
      category: 'TAHINI',
      subCategoryId: categoryMap['TAHINI'],
      subcategory: 'طحينة حلاوة'
    }
  ]

  // 15. بيض
  const eggProducts = [
    {
      name: 'بيض أحمر طازج 30 بيضة',
      description: 'بيض أحمر طازج من مزارع محلية، غني بالبروتين',
      price: 90.00,
      images: ['/images/products/eggs-red-fresh-30pieces.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 25,
      category: 'EGGS',
      subCategoryId: categoryMap['EGGS'],
      subcategory: 'بيض أحمر'
    },
    {
      name: 'بيض أبيض طازج 24 بيضة',
      description: 'بيض أبيض طازج، جودة عالية وطعم رائع',
      price: 72.00,
      oldPrice: 80.00,
      images: ['/images/products/eggs-white-fresh-24pieces.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 30,
      category: 'EGGS',
      subCategoryId: categoryMap['EGGS'],
      subcategory: 'بيض أبيض'
    },
    {
      name: 'بيض عضوي طازج 12 بيضة',
      description: 'بيض عضوي من دجاج حر، خالي من المضادات الحيوية',
      price: 65.00,
      images: ['/images/products/eggs-organic-fresh-12pieces.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 15,
      category: 'EGGS',
      subCategoryId: categoryMap['EGGS'],
      subcategory: 'بيض عضوي'
    }
  ]

  // 16. زيت زيتون
  const oliveOilProducts = [
    {
      name: 'زيت زيتون بكر ممتاز 500 مل',
      description: 'زيت زيتون بكر ممتاز، عصرة أولى على البارد',
      price: 120.00,
      images: ['/images/products/olive-oil-extra-virgin-500ml.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 20,
      category: 'OLIVE_OIL',
      subCategoryId: categoryMap['OLIVE_OIL'],
      subcategory: 'زيت زيتون بكر ممتاز'
    },
    {
      name: 'زيت زيتون طبيعي لتر',
      description: 'زيت زيتون طبيعي للطبخ والسلطات',
      price: 180.00,
      oldPrice: 200.00,
      images: ['/images/products/olive-oil-natural-1l.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 15,
      category: 'OLIVE_OIL',
      subCategoryId: categoryMap['OLIVE_OIL'],
      subcategory: 'زيت زيتون طبيعي'
    }
  ]

  // 17. حلاوة طحينية
  const halawaProducts = [
    {
      name: 'حلاوة طحينية سادة 500 جرام',
      description: 'حلاوة طحينية سادة تقليدية، طعم أصيل',
      price: 45.00,
      images: ['/images/products/halawa-plain-500g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 40,
      category: 'HALAWA',
      subCategoryId: categoryMap['HALAWA'],
      subcategory: 'حلاوة سادة'
    },
    {
      name: 'حلاوة طحينية بالفستق 400 جرام',
      description: 'حلاوة طحينية بالفستق الحلبي، نكهة مميزة',
      price: 85.00,
      oldPrice: 95.00,
      images: ['/images/products/halawa-pistachio-400g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: true,
      inStock: 25,
      category: 'HALAWA',
      subCategoryId: categoryMap['HALAWA'],
      subcategory: 'حلاوة بالفستق'
    },
    {
      name: 'حلاوة طحينية بالكاكاو 350 جرام',
      description: 'حلاوة طحينية بالكاكاو، طعم الشوكولاتة الرائع',
      price: 52.00,
      images: ['/images/products/halawa-cocoa-350g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 30,
      category: 'HALAWA',
      subCategoryId: categoryMap['HALAWA'],
      subcategory: 'حلاوة بالكاكاو'
    },
    {
      name: 'حلاوة طحينية باللوز 300 جرام',
      description: 'حلاوة طحينية باللوز المقشر، غنية ومغذية',
      price: 75.00,
      images: ['/images/products/halawa-almond-300g.jpg'],
      unitType: 'PIECE',
      isAvailable: true,
      isBestSeller: false,
      inStock: 20,
      category: 'HALAWA',
      subCategoryId: categoryMap['HALAWA'],
      subcategory: 'حلاوة باللوز'
    }
  ]

  // جمع جميع المنتجات
  const allProducts = [
    ...burgerProducts,
    ...koftaProducts,
    ...sausageProducts,
    ...kababProducts,
    ...liverProducts,
    ...groundMeatProducts,
    ...sosisProducts,
    ...luncheonProducts,
    ...yogurtProducts,
    ...milkProducts,
    ...butterProducts,
    ...cheeseProducts,
    ...honeyProducts,
    ...tahiniProducts,
    ...eggProducts,
    ...oliveOilProducts,
    ...halawaProducts
  ]

  console.log(`📦 إجمالي المنتجات للإضافة: ${allProducts.length}`)

  // إضافة المنتجات إلى قاعدة البيانات
  let addedCount = 0
  for (const productData of allProducts) {
    try {
      await prisma.product.create({
        data: productData
      })
      addedCount++
      if (addedCount % 10 === 0) {
        console.log(`📊 تم إضافة ${addedCount} منتج...`)
      }
    } catch (error) {
      console.error(`❌ خطأ في إضافة منتج: ${productData.name}`, error.message)
    }
  }

  console.log('🛍️ تم إنشاء جميع المنتجات')
  console.log('\n📊 الإحصائيات النهائية:')
  console.log(`   🛍️ المنتجات المضافة: ${addedCount}`)
  
  // عرض إحصائيات حسب الفئة
  const categoryStats = {}
  allProducts.forEach(product => {
    const category = product.subcategory
    categoryStats[category] = (categoryStats[category] || 0) + 1
  })

  console.log('\n📈 إحصائيات المنتجات حسب الفئة:')
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} منتج`)
  })

  console.log('\n✅ تم إنشاء جميع البيانات بنجاح!')
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
