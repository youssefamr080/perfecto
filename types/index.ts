import type { Product as PrismaProduct, SubCategory as PrismaSubCategory, MainCategory, UnitType } from '@prisma/client';

export type { UnitType };

/**
 * يمثل الفئة (الفئة الفرعية) مع إضافة عدد المنتجات والفئة الرئيسية.
 * هذا هو الشكل الذي تستخدمه المكونات.
 */
export type AppCategory = Omit<PrismaSubCategory, 'icon'> & {
  icon: string | null; // The icon URL, can be null if not present
  mainCategory: MainCategory | null;
  productCount?: number; 
};

/**
 * يمثل المنتج بشكله النهائي المستخدم في الواجهة.
 * يتم فيه تحويل بعض خصائص Prisma (مثل التواريخ والصور) وإضافة الفئة.
 */
export type AppProduct = Omit<PrismaProduct, 'createdAt' | 'updatedAt' | 'images' | 'subCategoryId' | 'category'> & {
  createdAt: string;
  updatedAt: string;
  images: string[];
      category: AppCategory | null; // Use the renamed AppCategory
  slug: string;
  unitType: UnitType;
  isAvailable: boolean;
  isBestSeller: boolean;
  inStock: number;
  minOrder?: number | null;
  maxOrder?: number | null;
};

/**
 * يمثل عنصرًا في سلة التسوق.
 */
export interface CartItem {
  product: AppProduct; // Use the renamed AppProduct
  quantity: number;
}
