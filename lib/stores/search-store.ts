import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { Product, Category } from "@/lib/types"

interface SearchState {
  query: string
  results: Product[]
  categories: Category[]
  isLoading: boolean
  hasSearched: boolean
  suggestions: string[]
  recentSearches: string[]
  popularProducts: Product[]
  // فلاتر متقدمة
  filters: {
    categoryId?: string
    subcategoryId?: string
    minPrice?: number
    maxPrice?: number
    isFeatured?: boolean
    inStock?: boolean
  }
  setQuery: (query: string) => void
  search: (query: string) => Promise<void>
  searchWithFilters: (query: string, filters?: any) => Promise<void>
  loadCategories: () => Promise<void>
  clearResults: () => void
  getSuggestions: (query: string) => void
  loadPopularProducts: () => Promise<void>
  clearRecentSearches: () => void
  setFilters: (filters: any) => void
  clearFilters: () => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: [],
  categories: [],
  isLoading: false,
  hasSearched: false,
  suggestions: [],
  recentSearches: typeof window !== "undefined" 
    ? JSON.parse(localStorage.getItem("recentSearches") || "[]") 
    : [],
  popularProducts: [],
  filters: {},

  setQuery: (query: string) => set({ query }),

  setFilters: (filters: any) => set({ filters }),

  clearFilters: () => set({ filters: {} }),

  // البحث في المنتجات
  search: async (query: string) => {
    if (!query.trim()) {
      set({ results: [], hasSearched: false })
      return
    }

    set({ isLoading: true, query })

    try {
      // حفظ البحث في البحثات الأخيرة
      const { recentSearches } = get()
      const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
      set({ recentSearches: updatedSearches })
      
      // حفظ في localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
      }

      // استخدم فلترة أكثر وضوحاً مع دعم العربية والبحث الجزئي
      const { data: products, error } = await supabase
        .from("products")
        .select(`
          *,
          subcategory:subcategories(
            *,
            category:categories(*)
          )
        `)
        .filter("is_available", "eq", true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,unit_description.ilike.%${query}%`)
        .order("is_featured", { ascending: false })
        .order("name")
        .limit(50) // حد أقصى للنتائج

      if (error) throw error

      set({
        results: products || [],
        hasSearched: true,
        isLoading: false,
      })
    } catch (error) {
      console.error("Search error:", error)
      set({
        results: [],
        hasSearched: true,
        isLoading: false,
      })
    }
  },

  // البحث مع الفلاتر المتقدمة
  searchWithFilters: async (query: string, filters: any = {}) => {
    set({ isLoading: true, query })

    try {
      let queryBuilder = supabase
        .from("products")
        .select(`
          *,
          subcategory:subcategories(
            *,
            category:categories(*)
          )
        `)
        .filter("is_available", "eq", true)

      // فلتر النص
      if (query.trim()) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,unit_description.ilike.%${query}%`)
      }

      // فلتر الفئة الفرعية
      if (filters.subcategoryId) {
        queryBuilder = queryBuilder.eq("subcategory_id", filters.subcategoryId)
      }

      // فلتر السعر
      if (filters.minPrice) {
        queryBuilder = queryBuilder.gte("price", filters.minPrice)
      }
      if (filters.maxPrice) {
        queryBuilder = queryBuilder.lte("price", filters.maxPrice)
      }

      // فلتر المنتجات المميزة
      if (filters.isFeatured) {
        queryBuilder = queryBuilder.eq("is_featured", true)
      }

      // فلتر المتوفر في المخزن
      if (filters.inStock) {
        queryBuilder = queryBuilder.gt("stock_quantity", 0)
      }

      const { data: products, error } = await queryBuilder
        .order("is_featured", { ascending: false })
        .order("name")
        .limit(100)

      if (error) throw error

      set({
        results: products || [],
        hasSearched: true,
        isLoading: false,
        filters
      })
    } catch (error) {
      console.error("Search with filters error:", error)
      set({
        results: [],
        hasSearched: true,
        isLoading: false,
      })
    }
  },

  // Suggestions: dummy implementation (replace with real API if needed)
  getSuggestions: (query: string) => {
    if (!query) {
      set({ suggestions: [] })
      return
    }
    // Example: filter recentSearches and categories for suggestions
    const { recentSearches, categories } = get()
    const categoryNames = categories.map((c) => c.name)
    const suggestions = [...recentSearches, ...categoryNames].filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    )
    set({ suggestions })
  },

  // Popular products: fetch top 5 featured products
  loadPopularProducts: async () => {
    try {
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_featured", true)
        .eq("is_available", true)
        .order("name")
        .limit(5)
      if (error) throw error
      set({ popularProducts: products || [] })
    } catch (error) {
      console.error("Popular products loading error:", error)
      set({ popularProducts: [] })
    }
  },

  // Recent searches: store in localStorage for persistence
  clearRecentSearches: () => {
    set({ recentSearches: [] })
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.removeItem("recentSearches")
    }
  },

  loadCategories: async () => {
    try {
      const { data: categories, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (error) throw error

      set({ categories: categories || [] })
    } catch (error) {
      console.error("Categories loading error:", error)
      set({ categories: [] })
    }
  },

  clearResults: () => set({ results: [], hasSearched: false, query: "" }),
}))
