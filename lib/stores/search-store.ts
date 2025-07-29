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
  setQuery: (query: string) => void
  search: (query: string) => Promise<void>
  loadCategories: () => Promise<void>
  clearResults: () => void
  getSuggestions: (query: string) => void
  loadPopularProducts: () => Promise<void>
  clearRecentSearches: () => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: [],
  categories: [],
  isLoading: false,
  hasSearched: false,
  suggestions: [],
  recentSearches: [],
  popularProducts: [],

  setQuery: (query: string) => set({ query }),

  search: async (query: string) => {
    if (!query.trim()) {
      set({ results: [], hasSearched: false })
      return
    }

    set({ isLoading: true, query })

    try {
      const { data: products, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("name")

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
        .eq("is_active", true)
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
