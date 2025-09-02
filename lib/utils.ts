// جلب المنتجات مع كاش لمدة 30 دقيقة
import { supabase } from "./supabase"
import type { Product } from "./types"
import { cacheManager } from "./utils/cache-manager"

export async function getCachedProducts(): Promise<Product[]> {
  const cacheKey = "all_products"
  
  // التحقق من الكاش أولاً
  const cached = cacheManager.get<Product[]>(cacheKey)
  if (cached) {
    return cached
  }

  // جلب البيانات من قاعدة البيانات
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    
  if (error) throw error
  
  const products = data || []
  
  // حفظ في الكاش لمدة 30 دقيقة
  cacheManager.set(cacheKey, products, 30 * 60 * 1000)
  
  return products
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
