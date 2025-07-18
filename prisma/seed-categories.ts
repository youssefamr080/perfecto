import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categoriesData = [
  {
    categoryType: 'SAUSAGE' as const,
    name: 'السجق',
    description: 'سجق طازج بأنواعه',
    image: '/images/categories/sausage.jpg',
    icon: '🌭',
    slug: 'sausage',
    sortOrder: 1
  },
  {
    categoryType: 'KOFTA' as const,
    name: 'الكفتة',
    description: 'كفتة لحم متبلة طازجة',
    image: '/images/categories/kofta.jpg',
    icon: '🍖',
    slug: 'kofta',
    sortOrder: 2
  },
  {
    categoryType: 'PASTRAMI' as const,
    name: 'البسطرمة',
    description: 'بسطرمة لحم بقري ودجاج',
    image: '/images/categories/pastrami.jpg',
    icon: '🥩',
    slug: 'pastrami',
    sortOrder: 3
  },
  {
    categoryType: 'LUNCHEON' as const,
    name: 'اللانشون',
    description: 'لانشون دجاج ولحم طازج',
    image: '/images/categories/luncheon.jpg',
    icon: '🍖',
    slug: 'luncheon',
    sortOrder: 4
  },
  {
    categoryType: 'MILK' as const,
    name: 'اللبن',
    description: 'لبن بقري وجاموسي طازج',
    image: '/images/categories/milk.jpg',
    icon: '🥛',
    slug: 'milk',
    sortOrder: 5
  },
  {
    categoryType: 'YOGURT' as const,
    name: 'الزبادي',
    description: 'زبادي طبيعي وبالفواكه',
    image: '/images/categories/yogurt.jpg',
    icon: '🥛',
    slug: 'yogurt',
    sortOrder: 6
  },
  {
    categoryType: 'LIVER' as const,
    name: 'الكبدة',
    description: 'كبدة طازجة',
    image: '/images/categories/liver.jpg',
    icon: '🍖',
    slug: 'liver',
    sortOrder: 7
  },
  {
    categoryType: 'GROUND_MEAT' as const,
    name: 'اللحمة المفرومة',
    description: 'لحمة مفرومة طازجة',
    image: '/images/categories/ground-meat.jpg',
    icon: '🥩',
    slug: 'ground-meat',
    sortOrder: 8
  },
  {
    categoryType: 'EGGS' as const,
    name: 'البيض',
    description: 'بيض دجاج طازج بأحجام مختلفة',
    image: '/images/categories/eggs.jpg',
    icon: '🥚',
    slug: 'eggs',
    sortOrder: 9
  },
  {
    categoryType: 'TAHINI' as const,
    name: 'الطحينة',
    description: 'طحينة سمسم طبيعية',
    image: '/images/categories/tahini.jpg',
    icon: '🥜',
    slug: 'tahini',
    sortOrder: 10
  },
  {
    categoryType: 'HONEY' as const,
    name: 'العسل',
    description: 'عسل طبيعي من أجود الأنواع',
    image: '/images/categories/honey.jpg',
    icon: '🍯',
    slug: 'honey',
    sortOrder: 11
  },
  {
    categoryType: 'CHEESE' as const,
    name: 'الجبن',
    description: 'جبن طبيعي',
    image: '/images/categories/cheese.jpg',
    icon: '🧀',
    slug: 'cheese',
    sortOrder: 12
  },
  {
    categoryType: 'HALAWA' as const,
    name: 'الحلاوة الطحينية',
    description: 'حلاوة طحينية فاخرة',
    image: '/images/categories/halawa.jpg',
    icon: '🍥',
    slug: 'halawa',
    sortOrder: 13
  }
]

async function main() {
  console.log('🌱 بدء إدخال بيانات الفئات...')

  // هذا الملف لم يعد مستخدماً - تم الانتقال إلى نظام MainCategory و SubCategory
  console.log('⚠️  هذا الملف لم يعد مستخدماً. استخدم seed-complete-database.js بدلاً منه')

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
