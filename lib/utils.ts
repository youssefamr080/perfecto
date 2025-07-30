// جلب المنتجات مع كاش لمدة 30 دقيقة
import { supabase } from "./supabase"
import type { Product } from "./types"

export async function getCachedProducts(): Promise<Product[]> {
  const cacheKey = "all_products_cache"
  const cacheExpiryKey = "all_products_cache_expiry"
  const now = Date.now()
  const expiry = typeof window !== 'undefined' ? localStorage.getItem(cacheExpiryKey) : null
  const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null
  if (cached && expiry && now < Number(expiry)) {
    try {
      return JSON.parse(cached)
    } catch {
      // ignore parse error
    }
  }
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false })
  if (error) throw error
  if (typeof window !== 'undefined') {
    localStorage.setItem(cacheKey, JSON.stringify(data || []))
    localStorage.setItem(cacheExpiryKey, (Date.now() + 30 * 60 * 1000).toString())
  }
  return data || []
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
