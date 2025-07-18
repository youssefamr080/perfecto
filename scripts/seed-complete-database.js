import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// الفئات الرئيسية (حسب النظام الأصلي)
const mainCategories = [
  {
    name: 'اللحوم والمصنعات',
    slug: 'meat-products',
    description: 'أفضل أنواع اللحوم والمصنعات الطازجة',
    image: '/images/main-categories/meat.jpg',
    icon: '🥩',
    sortOrder: 1
  },
  {
    name: 'الألبان ومنتجاتها',
    slug: 'dairy-products',
    description: 'منتجات الألبان الطازجة والصحية',
    image: '/images/main-categories/dairy.jpg',
    icon: '�',
    sortOrder: 2
  },
  {
    name: 'العسل والطحينة',
    slug: 'honey-tahini',
    description: 'عسل طبيعي وطحينة وحلاوة طحينية',
    image: '/images/main-categories/honey-tahini.jpg',
    icon: '�',
    sortOrder: 3
  },
  {
    name: 'فئات أخرى',
    slug: 'other-categories',
    description: 'بيض ومنتجات متنوعة أخرى',
    image: '/images/main-categories/other.jpg',
    icon: '🥚',
    sortOrder: 4
  }
];

// الفئات الفرعية (حسب النظام الأصلي)
const subCategoriesData = [
  // اللحوم والمصنعات
  { name: 'السجق', slug: 'sausage', categoryType: 'SAUSAGE', mainCategorySlug: 'meat-products' },
  { name: 'الكفتة', slug: 'kofta', categoryType: 'KOFTA', mainCategorySlug: 'meat-products' },
  { name: 'البسطرمة', slug: 'pastrami', categoryType: 'PASTRAMI', mainCategorySlug: 'meat-products' },
  { name: 'اللانشون', slug: 'luncheon', categoryType: 'LUNCHEON', mainCategorySlug: 'meat-products' },
  { name: 'اللحمة المفرومة', slug: 'ground-meat', categoryType: 'GROUND_MEAT', mainCategorySlug: 'meat-products' },
  { name: 'الكبدة', slug: 'liver', categoryType: 'LIVER', mainCategorySlug: 'meat-products' },
  
  // الألبان ومنتجاتها
  { name: 'الزبادي', slug: 'yogurt', categoryType: 'YOGURT', mainCategorySlug: 'dairy-products' },
  { name: 'اللبن', slug: 'milk', categoryType: 'MILK', mainCategorySlug: 'dairy-products' },
  { name: 'الجبن والسمنة', slug: 'cheese-butter', categoryType: 'CHEESE_BUTTER', mainCategorySlug: 'dairy-products' },
  
  // العسل والطحينة
  { name: 'العسل', slug: 'honey', categoryType: 'HONEY', mainCategorySlug: 'honey-tahini' },
  { name: 'الطحينة', slug: 'tahini', categoryType: 'TAHINI', mainCategorySlug: 'honey-tahini' },
  
  // فئات أخرى
  { name: 'البيض', slug: 'eggs', categoryType: 'EGGS', mainCategorySlug: 'other-categories' },
  { name: 'الحلاوة', slug: 'halawa', categoryType: 'HALAWA', mainCategorySlug: 'other-categories' }
];

// المنتجات (حسب النظام الأصلي)
const productsData = [
  // السجق
  {
    name: 'سجق دجاج',
    description: 'سجق دجاج طازج عالي الجودة',
    price: 85,
    images: ['/images/products/chicken-sausage.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'SAUSAGE',
    inStock: 50
  },
  {
    name: 'سجق لحمة',
    description: 'سجق لحم بقري طازج',
    price: 95,
    images: ['/images/products/beef-sausage.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'SAUSAGE',
    inStock: 40
  },

  // الكفتة
  {
    name: 'كفتة لحمة',
    description: 'كفتة لحم بقري متبلة طازجة',
    price: 120,
    images: ['/images/products/beef-kofta.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'KOFTA',
    inStock: 35
  },
  {
    name: 'كفتة مشكل',
    description: 'كفتة مشكل لحم وضاني',
    price: 140,
    images: ['/images/products/mixed-kofta.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'KOFTA',
    inStock: 25
  },

  // البسطرمة
  {
    name: 'بسطرمة بقري',
    description: 'بسطرمة لحم بقري مدخن',
    price: 160,
    images: ['/images/products/beef-pastrami.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'PASTRAMI',
    inStock: 30
  },
  {
    name: 'بسطرمة دجاج',
    description: 'بسطرمة دجاج مدخن',
    price: 140,
    images: ['/images/products/chicken-pastrami.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'PASTRAMI',
    inStock: 35
  },

  // اللانشون
  {
    name: 'لانشون دجاج',
    description: 'لانشون دجاج طازج للساندويش',
    price: 110,
    images: ['/images/products/chicken-luncheon.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'LUNCHEON',
    inStock: 45
  },
  {
    name: 'لانشون بقري',
    description: 'لانشون لحم بقري فاخر',
    price: 130,
    images: ['/images/products/beef-luncheon.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'LUNCHEON',
    inStock: 30
  },

  // اللحمة المفرومة
  {
    name: 'لحمة مفرومة بقري',
    description: 'لحمة بقري مفرومة طازجة',
    price: 150,
    images: ['/images/products/ground-beef.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'GROUND_MEAT',
    inStock: 60
  },
  {
    name: 'لحمة مفرومة ضاني',
    description: 'لحمة ضاني مفرومة للكفتة',
    price: 180,
    images: ['/images/products/ground-lamb.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'GROUND_MEAT',
    inStock: 40
  },

  // الكبدة
  {
    name: 'كبدة بقري',
    description: 'كبدة بقري طازجة مقطعة',
    price: 80,
    images: ['/images/products/beef-liver.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'LIVER',
    inStock: 25
  },
  {
    name: 'كبدة فراخ',
    description: 'كبدة دجاج طازجة',
    price: 60,
    images: ['/images/products/chicken-liver.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'LIVER',
    inStock: 30
  },

  // الزبادي
  {
    name: 'زبادي طبيعي',
    description: 'زبادي طبيعي كامل الدسم',
    price: 25,
    images: ['/images/products/natural-yogurt.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'YOGURT',
    inStock: 80
  },
  {
    name: 'زبادي بالفواكه',
    description: 'زبادي بالفراولة والخوخ',
    price: 30,
    images: ['/images/products/fruit-yogurt.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'YOGURT',
    inStock: 60
  },

  // اللبن
  {
    name: 'لبن بقري طازج',
    description: 'لبن بقري طازج كامل الدسم',
    price: 22,
    images: ['/images/products/cow-milk.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'MILK',
    inStock: 100
  },
  {
    name: 'لبن جاموسي',
    description: 'لبن جاموسي دسم طازج',
    price: 25,
    images: ['/images/products/buffalo-milk.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'MILK',
    inStock: 80
  },

  // الجبن والسمنة
  {
    name: 'جبن أبيض قريش',
    description: 'جبن قريش طازج قليل الدسم',
    price: 80,
    images: ['/images/products/cottage-cheese.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'CHEESE_BUTTER',
    inStock: 40,
    subcategory: 'قريش'
  },
  {
    name: 'جبن شيدر أحمر',
    description: 'جبن شيدر أحمر مستورد',
    price: 180,
    images: ['/images/products/red-cheddar.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'CHEESE_BUTTER',
    inStock: 25,
    subcategory: 'شيدر'
  },
  {
    name: 'جبن رومي',
    description: 'جبن رومي مدور طعم أصيل',
    price: 140,
    images: ['/images/products/roomy-cheese.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'CHEESE_BUTTER',
    inStock: 35,
    subcategory: 'رومي'
  },
  {
    name: 'سمنة بلدي',
    description: 'سمنة بلدي طبيعية',
    price: 200,
    images: ['/images/products/clarified-butter.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'CHEESE_BUTTER',
    inStock: 20
  },
  {
    name: 'جبن كيري',
    description: 'جبن كيري كريمي للأطفال',
    price: 120,
    images: ['/images/products/kerry-cheese.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'CHEESE_BUTTER',
    inStock: 30,
    subcategory: 'كيري'
  },

  // العسل
  {
    name: 'عسل نحل طبيعي',
    description: 'عسل نحل طبيعي من المناحل',
    price: 150,
    images: ['/images/products/natural-honey.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'HONEY',
    inStock: 25
  },
  {
    name: 'عسل سدر',
    description: 'عسل سدر فاخر جبلي',
    price: 280,
    images: ['/images/products/sidr-honey.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'HONEY',
    inStock: 15
  },

  // الطحينة
  {
    name: 'طحينة سمسم',
    description: 'طحينة سمسم طبيعية',
    price: 65,
    images: ['/images/products/sesame-tahini.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'TAHINI',
    inStock: 40
  },
  {
    name: 'طحينة فاخرة',
    description: 'طحينة سمسم فاخرة مطحونة ناعم',
    price: 85,
    images: ['/images/products/premium-tahini.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'TAHINI',
    inStock: 30
  },

  // البيض
  {
    name: 'بيض دجاج أبيض',
    description: 'بيض دجاج أبيض طازج',
    price: 45,
    images: ['/images/products/white-eggs.jpg'],
    unitType: 'PIECE',
    subCategoryType: 'EGGS',
    inStock: 100
  },
  {
    name: 'بيض دجاج أحمر',
    description: 'بيض دجاج أحمر طازج',
    price: 50,
    images: ['/images/products/brown-eggs.jpg'],
    unitType: 'PIECE',
    subCategoryType: 'EGGS',
    inStock: 80
  },

  // الحلاوة
  {
    name: 'حلاوة طحينية',
    description: 'حلاوة طحينية طبيعية',
    price: 45,
    images: ['/images/products/tahini-halawa.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'HALAWA',
    inStock: 35
  },
  {
    name: 'حلاوة بالفستق',
    description: 'حلاوة طحينية بالفستق',
    price: 65,
    images: ['/images/products/pistachio-halawa.jpg'],
    unitType: 'WEIGHT',
    subCategoryType: 'HALAWA',
    inStock: 25
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 بدء إدخال البيانات...');

    // مسح البيانات الموجودة
    console.log('🗑️ مسح البيانات الموجودة...');
    await prisma.product.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.mainCategory.deleteMany();

    // إدخال الفئات الرئيسية
    console.log('📁 إدخال الفئات الرئيسية...');
    const createdMainCategories = [];
    for (const category of mainCategories) {
      const created = await prisma.mainCategory.create({
        data: category
      });
      createdMainCategories.push(created);
      console.log(`✅ تم إنشاء فئة رئيسية: ${created.name}`);
    }

    // إدخال الفئات الفرعية
    console.log('📂 إدخال الفئات الفرعية...');
    const createdSubCategories = [];
    for (const subCat of subCategoriesData) {
      const mainCategory = createdMainCategories.find(mc => mc.slug === subCat.mainCategorySlug);
      if (mainCategory) {
        const created = await prisma.subCategory.create({
          data: {
            name: subCat.name,
            slug: subCat.slug,
            categoryType: subCat.categoryType,
            mainCategoryId: mainCategory.id,
            isActive: true,
            sortOrder: 0
          }
        });
        createdSubCategories.push(created);
        console.log(`✅ تم إنشاء فئة فرعية: ${created.name} تحت ${mainCategory.name}`);
      }
    }

    // إدخال المنتجات
    console.log('📦 إدخال المنتجات...');
    let productCount = 0;
    for (const product of productsData) {
      const subCategory = createdSubCategories.find(sc => sc.categoryType === product.subCategoryType);
      if (subCategory) {
        const created = await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            images: product.images,
            unitType: product.unitType,
            subCategoryId: subCategory.id,
            subcategory: product.subcategory || null,
            inStock: product.inStock,
            isAvailable: true
          }
        });
        productCount++;
        console.log(`✅ تم إنشاء منتج: ${created.name} في ${subCategory.name}`);
      } else {
        console.log(`❌ لم يتم العثور على فئة فرعية للمنتج: ${product.name} (${product.subCategoryType})`);
      }
    }

    // إحصائيات نهائية
    const finalMainCategories = await prisma.mainCategory.count();
    const finalSubCategories = await prisma.subCategory.count();
    const finalProducts = await prisma.product.count();

    console.log('\n🎉 تم إكمال إدخال البيانات بنجاح!');
    console.log(`📊 الإحصائيات النهائية:`);
    console.log(`   📁 فئات رئيسية: ${finalMainCategories}`);
    console.log(`   📂 فئات فرعية: ${finalSubCategories}`);
    console.log(`   📦 منتجات: ${finalProducts}`);

  } catch (error) {
    console.error('❌ خطأ في إدخال البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase().catch(console.error);
