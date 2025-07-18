
import React from 'react'
import { prisma } from '@/lib/prisma'
import CheesePageClient from './page-client'
import { Metadata } from 'next'
import { Category } from '@prisma/client'

export const metadata: Metadata = {
  title: 'الجبن والسمنة - فلاتر متقدمة | بيرفكتو',
  description: 'تشكيلة متنوعة من أجود أنواع الجبن المحلي والمستورد مع فلاتر متقدمة حسب النوع والماركة',
  keywords: 'جبن, شيدر, رومي, كيري, كريمي, براميلي, قريش, فيتا, موزاريلا'
}

async function getCheeseProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { 
        category: Category.CHEESE,
        isAvailable: true 
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        oldPrice: true,
        images: true,
        unitType: true,
        isAvailable: true,
        category: true,
        description: true,
        isBestSeller: true,
        inStock: true,
        createdAt: true,
        updatedAt: true,
        subCategoryId: true,
        subcategory: true,
        minOrder: true,
        maxOrder: true
      }
    })

    return {
      products: products.map(product => ({
        ...product,
        category: product.category as string,
        oldPrice: product.oldPrice ?? undefined,
        description: product.description ?? undefined,
        subcategory: product.description ? extractCheeseType(product.description, product.name) : undefined
      })),
      totalCount: products.length
    }
  } catch (error) {
    console.error('Error fetching cheese products:', error)
    return { products: [], totalCount: 0 }
  }
}

// استخراج نوع الجبن من الوصف أو الاسم
function extractCheeseType(description: string, name: string): string | undefined {
  const text = `${name} ${description}`.toLowerCase()
  
  if (text.includes('شيدر') || text.includes('cheddar')) return 'CHEDDAR'
  if (text.includes('رومي') || text.includes('romy')) return 'ROMY'
  if (text.includes('كيري') || text.includes('kiri')) return 'KERRY'
  if (text.includes('كريمي') || text.includes('cream')) return 'CREAMY'
  if (text.includes('براميلي') || text.includes('bramili')) return 'BRAMILI'
  if (text.includes('قريش') || text.includes('qareesh')) return 'QAREESH'
  if (text.includes('فيتا') || text.includes('feta')) return 'FETA'
  if (text.includes('موزاريلا') || text.includes('mozzarella')) return 'MOZZARELLA'
  if (text.includes('بيضاء') || text.includes('white')) return 'WHITE_CHEESE'
  if (text.includes('مطبوخة') || text.includes('processed')) return 'PROCESSED'
  
  return undefined
}

export default async function CheesePage() {
  const { products, totalCount } = await getCheeseProducts()

  return (
    <CheesePageClient 
      initialProducts={products}
      totalCount={totalCount}
    />
  )
}
