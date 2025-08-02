import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/types"

interface ProductsStore {
  // البيانات
  products: Product[]
  featuredProducts: Product[]
  isLoading: boolean
  error: string | null
  lastUpdated: number | null
  
  // الإجراءات
  fetchProducts: (page?: number, limit?: number) => Promise<Product[]>
  fetchFeaturedProducts: () => Promise<void>
  refreshProducts: () => Promise<void>
  clearCache: () => void
  
  // المساعدات
  getProductById: (id: string) => Product | undefined
  getProductsByCategory: (categoryId: string) => Product[]
  searchProducts: (query: string) => Product[]
}

const CACHE_DURATION = 30 * 60 * 1000 // 30 دقيقة

export const useProductsStore = create<ProductsStore>()(
  persist(
    (set, get) => ({
      // الحالة الابتدائية
      products: [],
      featuredProducts: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      // جلب المنتجات مع Pagination
      fetchProducts: async (page = 1, limit = 20) => {
        const state = get()
        const now = Date.now()
        
        // التحقق من الكاش
        if (
          state.products.length > 0 && 
          state.lastUpdated && 
          now - state.lastUpdated < CACHE_DURATION &&
          page === 1
        ) {
          return state.products.slice(0, limit)
        }

        set({ isLoading: true, error: null })

        try {
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("is_available", true)
            .order("created_at", { ascending: false })
            .range((page - 1) * limit, page * limit - 1)

          if (error) throw error

          const products = data || []

          if (page === 1) {
            set({
              products,
              lastUpdated: now,
              isLoading: false
            })
          } else {
            set(state => ({
              products: [...state.products, ...products],
              isLoading: false
            }))
          }

          return products
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "خطأ في جلب المنتجات",
            isLoading: false 
          })
          throw error
        }
      },

      // جلب المنتجات المميزة
      fetchFeaturedProducts: async () => {
        const state = get()
        const now = Date.now()
        
        // التحقق من الكاش
        if (
          state.featuredProducts.length > 0 && 
          state.lastUpdated && 
          now - state.lastUpdated < CACHE_DURATION
        ) {
          return
        }

        try {
          const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("is_available", true)
            .eq("is_featured", true)
            .order("created_at", { ascending: false })
            .limit(8)

          if (error) throw error

          set({
            featuredProducts: data || [],
            lastUpdated: now
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "خطأ في جلب المنتجات المميزة"
          })
        }
      },

      // تحديث المنتجات
      refreshProducts: async () => {
        set({ lastUpdated: null })
        await get().fetchProducts()
        await get().fetchFeaturedProducts()
      },

      // مسح الكاش
      clearCache: () => {
        set({
          products: [],
          featuredProducts: [],
          lastUpdated: null,
          error: null
        })
      },

      // الحصول على منتج بالمعرف
      getProductById: (id: string) => {
        return get().products.find(product => product.id === id)
      },

      // الحصول على منتجات حسب الفئة
      getProductsByCategory: (categoryId: string) => {
        return get().products.filter(product => 
          product.subcategory?.category_id === categoryId
        )
      },

      // البحث في المنتجات
      searchProducts: (query: string) => {
        const products = get().products
        const searchTerm = query.toLowerCase()
        
        return products.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description?.toLowerCase().includes(searchTerm)
        )
      }
    }),
    {
      name: "products-store",
      partialize: (state) => ({
        products: state.products,
        featuredProducts: state.featuredProducts,
        lastUpdated: state.lastUpdated
      })
    }
  )
)
