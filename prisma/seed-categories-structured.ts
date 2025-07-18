import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// بيانات الفئات الرئيسية
const mainCategoriesData = [
  {
    name: 'اللحوم والمصنعات',
    description: 'جميع أنواع اللحوم والمنتجات المصنعة الطازجة',
    image: '/images/main-categories/meat-products.jpg',
    icon: '🥩',
    slug: 'meat-products',
    sortOrder: 1
  },
  {
    name: 'الألبان ومنتجاتها',
    description: 'منتجات الألبان الطازجة والجبن والزبدة',
    image: '/images/main-categories/dairy-products.jpg',
    icon: '🥛',
    slug: 'dairy-products',
    sortOrder: 2
  },
  {
    name: 'العسل والطحينة',
    description: 'عسل طبيعي وطحينة وحلاوة طحينية',
    image: '/images/main-categories/honey-tahini.jpg',
    icon: '🍯',
    slug: 'honey-tahini',
    sortOrder: 3
  },
  {
    name: 'فئات أخرى',
    description: 'بيض ومنتجات متنوعة أخرى',
    image: '/images/main-categories/other-categories.jpg',
    icon: '🥚',
    slug: 'other-categories',
    sortOrder: 4
  }
]

// بيانات الفئات الفرعية مع ربطها بالفئات الرئيسية
import { $Enums } from '@prisma/client'

const subCategoriesData: Array<{
  name: string;
  description: string;
  image: string;
  icon: string;
  slug: string;
  categoryType: $Enums.Category;
  mainCategorySlug: string;
  sortOrder: number;
}> = [
  // اللحوم والمصنعات
  {
    name: 'برجر',
    description: 'برجر لحم أو دجاج طازج',
    image: '/images/categories/burger.jpg',
    icon: '🍔',
    slug: 'burger',
    categoryType: $Enums.Category.BURGER,
    mainCategorySlug: 'meat-products',
    sortOrder: 7
  },
  {
    name: 'كباب',
    description: 'كباب مشوي طازج',
    image: '/images/categories/kabab.jpg',
    icon: '🍢',
    slug: 'kabab',
    categoryType: $Enums.Category.KABAB,
    mainCategorySlug: 'meat-products',
    sortOrder: 9
  },
  {
    name: 'سوسيس',
    description: 'سوسيس لحم أو دجاج',
    image: '/images/categories/sosis.jpg',
    icon: '🌭',
    slug: 'sosis',
    categoryType: $Enums.Category.SOSIS,
    mainCategorySlug: 'meat-products',
    sortOrder: 10
  },
  {
    name: 'سمن',
    description: 'سمن طبيعي',
    image: '/images/categories/butter.jpg',
    icon: '🧈',
    slug: 'butter',
    categoryType: $Enums.Category.BUTTER,
    mainCategorySlug: 'dairy-products',
    sortOrder: 4
  },
  {
    name: 'زيت زيتون',
    description: 'زيت زيتون بكر ممتاز',
    image: '/images/categories/olive-oil.jpg',
    icon: '🫒',
    slug: 'olive-oil',
    categoryType: $Enums.Category.OLIVE_OIL,
    mainCategorySlug: 'other-categories',
    sortOrder: 2
  },
  {
    name: 'بسطرمة',
    description: 'بسطرمة مصرية ممتازة',
    image: '/images/categories/basterma.jpg',
    icon: '🥩',
    slug: 'basterma',
    categoryType: $Enums.Category.BASTERMA,
    mainCategorySlug: 'meat-products',
    sortOrder: 8
  },
  {
    name: 'السجق',
    description: 'سجق طازج بأنواعه المختلفة',
    image: '/images/categories/sausage.jpg',
    icon: '🌭',
    slug: 'sausage',
    categoryType: $Enums.Category.SAUSAGE,
    mainCategorySlug: 'meat-products',
    sortOrder: 1
  },
  {
    name: 'الكفتة',
    description: 'كفتة لحم متبلة طازجة',
    image: '/images/categories/kofta.jpg',
    icon: '🍖',
    slug: 'kofta',
    categoryType: $Enums.Category.KOFTA,
    mainCategorySlug: 'meat-products',
    sortOrder: 2
  },
  {
    name: 'اللانشون',
    description: 'لانشون دجاج ولحم طازج',
    image: '/images/categories/luncheon.jpg',
    icon: '🍖',
    slug: 'luncheon',
    categoryType: $Enums.Category.LUNCHEON,
    mainCategorySlug: 'meat-products',
    sortOrder: 4
  },
  {
    name: 'الكبدة',
    description: 'كبدة طازجة ومنظفة',
    image: '/images/categories/liver.jpg',
    icon: '🍖',
    slug: 'liver',
    categoryType: $Enums.Category.LIVER,
    mainCategorySlug: 'meat-products',
    sortOrder: 5
  },
  {
    name: 'اللحمة المفرومة',
    description: 'لحمة مفرومة طازجة',
    image: '/images/categories/ground-meat.jpg',
    icon: '🥩',
    slug: 'ground-meat',
    categoryType: $Enums.Category.GROUND_MEAT,
    mainCategorySlug: 'meat-products',
    sortOrder: 6
  },

  // الألبان ومنتجاتها
  {
    name: 'اللبن',
    description: 'لبن بقري وجاموسي طازج',
    image: '/images/categories/milk.jpg',
    icon: '🥛',
    slug: 'milk',
    categoryType: $Enums.Category.MILK,
    mainCategorySlug: 'dairy-products',
    sortOrder: 1
  },
  {
    name: 'الزبادي',
    description: 'زبادي طبيعي وبالفواكه',
    image: '/images/categories/yogurt.jpg',
    icon: '🥛',
    slug: 'yogurt',
    categoryType: $Enums.Category.YOGURT,
    mainCategorySlug: 'dairy-products',
    sortOrder: 2
  },
  {
    name: 'الجبن',
    description: 'جبن طبيعي',
    image: '/images/categories/cheese.jpg',
    icon: '🧀',
    slug: 'cheese',
    categoryType: $Enums.Category.CHEESE,
    mainCategorySlug: 'dairy-products',
    sortOrder: 3
  },

  // العسل والطحينة
  {
    name: 'العسل',
    description: 'عسل طبيعي من أجود الأنواع',
    image: '/images/categories/honey.jpg',
    icon: '🍯',
    slug: 'honey',
    categoryType: $Enums.Category.HONEY,
    mainCategorySlug: 'honey-tahini',
    sortOrder: 1
  },
  {
    name: 'الطحينة',
    description: 'طحينة سمسم طبيعية',
    image: '/images/categories/tahini.jpg',
    icon: '🥜',
    slug: 'tahini',
    categoryType: $Enums.Category.TAHINI,
    mainCategorySlug: 'honey-tahini',
    sortOrder: 2
  },
  {
    name: 'الحلاوة الطحينية',
    description: 'حلاوة طحينية فاخرة',
    image: '/images/categories/halawa.jpg',
    icon: '🍥',
    slug: 'halawa',
    categoryType: $Enums.Category.HALAWA,
    mainCategorySlug: 'honey-tahini',
    sortOrder: 3
  },

  // فئات أخرى
  {
    name: 'البيض',
    description: 'بيض دجاج طازج بأحجام مختلفة',
    image: '/images/categories/eggs.jpg',
    icon: '🥚',
    slug: 'eggs',
    categoryType: $Enums.Category.EGGS,
    mainCategorySlug: 'other-categories',
    sortOrder: 1
  }
]

async function main() {
  console.log('🌱 بدء إدخال بيانات الفئات الرئيسية والفرعية...')

  // إدخال الفئات الرئيسية
  console.log('📁 إدخال الفئات الرئيسية...')
  for (const mainCatData of mainCategoriesData) {
    const mainCategory = await prisma.mainCategory.upsert({
      where: { slug: mainCatData.slug },
      update: mainCatData,
      create: mainCatData,
    })
    console.log(`✅ تم إدخال/تحديث فئة رئيسية: ${mainCategory.name}`)
  }

  // إدخال الفئات الفرعية
  console.log('📂 إدخال الفئات الفرعية...')
  for (const subCatData of subCategoriesData) {
    // البحث عن الفئة الرئيسية
    const mainCategory = await prisma.mainCategory.findUnique({
      where: { slug: subCatData.mainCategorySlug }
    })

    if (!mainCategory) {
      console.error(`❌ لم يتم العثور على الفئة الرئيسية: ${subCatData.mainCategorySlug}`)
      continue
    }

    const { mainCategorySlug, ...subCategoryData } = subCatData
    const subCategory = await prisma.subCategory.upsert({
      where: { slug: subCategoryData.slug },
      update: {
        ...subCategoryData,
        mainCategoryId: mainCategory.id
      },
      create: {
        ...subCategoryData,
        mainCategoryId: mainCategory.id
      },
    })
    console.log(`✅ تم إدخال/تحديث فئة فرعية: ${subCategory.name} (${mainCategory.name})`)
  }

  console.log('🎉 تم إدخال جميع بيانات الفئات بنجاح!')
}

main()
  .catch((e) => {
    console.error('❌ خطأ في إدخال البيانات:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
