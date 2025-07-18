const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('📊 فحص قاعدة البيانات...\n')

  // عدد الفئات الرئيسية
  const mainCategories = await prisma.mainCategory.findMany()
  console.log(`🗂️ الفئات الرئيسية: ${mainCategories.length}`)
  mainCategories.forEach(cat => console.log(`   - ${cat.name}`))

  // عدد الفئات الفرعية
  const subCategories = await prisma.subCategory.findMany({
    include: {
      mainCategory: true
    }
  })
  console.log(`\n📂 الفئات الفرعية: ${subCategories.length}`)
  
  // تجميع حسب الفئة الرئيسية
  const categoryGroups = {}
  subCategories.forEach(subCat => {
    const mainCatName = subCat.mainCategory.name
    if (!categoryGroups[mainCatName]) {
      categoryGroups[mainCatName] = []
    }
    categoryGroups[mainCatName].push(subCat.name)
  })

  Object.entries(categoryGroups).forEach(([mainCat, subCats]) => {
    console.log(`\n   📁 ${mainCat} (${subCats.length} فئة فرعية):`)
    subCats.forEach(subCat => console.log(`      - ${subCat}`))
  })

  // عدد المنتجات
  const products = await prisma.product.findMany({
    include: {
      subCategory: {
        include: {
          mainCategory: true
        }
      }
    }
  })
  console.log(`\n🛍️ إجمالي المنتجات: ${products.length}`)

  // تجميع المنتجات حسب الفئة الرئيسية
  const productsByMainCategory = {}
  products.forEach(product => {
    const mainCatName = product.subCategory.mainCategory.name
    if (!productsByMainCategory[mainCatName]) {
      productsByMainCategory[mainCatName] = []
    }
    productsByMainCategory[mainCatName].push(product)
  })

  console.log('\n📊 توزيع المنتجات حسب الفئات الرئيسية:')
  Object.entries(productsByMainCategory).forEach(([mainCat, prods]) => {
    console.log(`\n   🏷️ ${mainCat}: ${prods.length} منتج`)
    
    // تجميع حسب الفئة الفرعية
    const subCatGroups = {}
    prods.forEach(prod => {
      const subCatName = prod.subCategory.name
      if (!subCatGroups[subCatName]) {
        subCatGroups[subCatName] = []
      }
      subCatGroups[subCatName].push(prod)
    })

    Object.entries(subCatGroups).forEach(([subCat, subProds]) => {
      console.log(`      📦 ${subCat}: ${subProds.length} منتج`)
      subProds.forEach(prod => {
        console.log(`         • ${prod.name} - ${prod.price} ج.م`)
      })
    })
  })

  // إحصائيات أخرى
  const bestSellers = products.filter(p => p.isBestSeller)
  const productsWithDiscount = products.filter(p => p.oldPrice)
  const unavailableProducts = products.filter(p => !p.isAvailable)

  console.log(`\n🌟 المنتجات الأكثر مبيعاً: ${bestSellers.length}`)
  console.log(`💰 المنتجات المخفضة: ${productsWithDiscount.length}`)
  console.log(`❌ المنتجات غير المتاحة: ${unavailableProducts.length}`)

  // منتجات بالوزن vs بالقطعة
  const weightProducts = products.filter(p => p.unitType === 'WEIGHT')
  const pieceProducts = products.filter(p => p.unitType === 'PIECE')
  
  console.log(`\n⚖️ المنتجات بالوزن: ${weightProducts.length}`)
  console.log(`🔢 المنتجات بالقطعة: ${pieceProducts.length}`)

  console.log('\n✅ انتهى فحص قاعدة البيانات')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ خطأ في فحص البيانات:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
