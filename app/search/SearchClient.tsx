"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { SearchBar } from "@/components/search/search-bar"
import { useSearchStore } from "@/lib/stores/search-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Grid, List, SearchIcon } from "lucide-react"
import Link from "next/link"
import { ProductGridSkeleton } from "@/components/loading/product-skeleton"
import { AdvancedFilters } from "@/components/filters/advanced-filters"

type SortOption = "name" | "price-low" | "price-high" | "featured"
type ViewMode = "grid" | "list"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [sortBy, setSortBy] = useState<SortOption>("featured")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { 
    results, 
    isLoading, 
    hasSearched, 
    searchWithFilters, 
    categories, 
    loadCategories, 
    filters,
    setFilters
  } = useSearchStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && query) {
      searchWithFilters(query, filters)
    }
    if (mounted && categories.length === 0) {
      loadCategories()
    }
  }, [query, searchWithFilters, categories.length, loadCategories, mounted, filters])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <SearchBar className="max-w-2xl mx-auto" />
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    )
  }

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name, "ar")
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "featured":
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <SearchBar className="max-w-2xl mx-auto" />
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar className="max-w-2xl mx-auto" />
        </div>

        {hasSearched && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {query ? `نتائج البحث عن: ${query}` : "نتائج البحث"}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    تم العثور على {sortedResults.length} منتج
                    {sortedResults.length > 0 && (
                      <Badge className="mr-2 bg-red-100 text-red-700">
                        {sortedResults.filter((p) => p.is_featured).length} منتج مميز
                      </Badge>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden md:flex border rounded-lg p-1 bg-white">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={viewMode === "grid" ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={viewMode === "list" ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger className="w-40 border-red-200 focus:border-red-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">المميز أولاً</SelectItem>
                      <SelectItem value="name">الاسم (أ-ي)</SelectItem>
                      <SelectItem value="price-low">السعر (الأقل أولاً)</SelectItem>
                      <SelectItem value="price-high">السعر (الأعلى أولاً)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    فلتر {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
                  </Button>
                </div>
              </div>

              <AdvancedFilters 
                isOpen={showFilters}
                onClose={() => setShowFilters(false)}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters)
                  if (query) {
                    searchWithFilters(query, newFilters)
                  }
                }}
                availableCategories={categories.map(cat => ({
                  id: cat.id,
                  name: cat.name,
                  count: results.filter(p => p.subcategory?.category?.id === cat.id).length
                }))}
              />
            </div>

            {sortedResults.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {sortedResults.map((product) => (
                  <ProductCard key={product.id} product={product} highlight={query} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="h-12 w-12 text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">لم يتم العثور على نتائج</h2>
                <p className="text-gray-700 mb-8 max-w-md mx-auto">
                  لم نتمكن من العثور على منتجات تطابق بحثك {query}. جرب البحث بكلمات مختلفة أو تصفح الأقسام.
                </p>

                <div className="max-w-2xl mx-auto">
                  <h3 className="font-semibold mb-4">جرب البحث عن:</h3>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {["لانشون", "جبنة", "بسطرمة", "عسل", "زيت زيتون"].map((suggestion) => (
                      <Link key={suggestion} href={`/search?q=${suggestion}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-red-100 hover:border-red-300">
                          {suggestion}
                        </Badge>
                      </Link>
                    ))}
                  </div>

                  <Link href="/categories">
                    <Button className="bg-red-600 hover:bg-red-700">تصفح جميع الأقسام</Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {!hasSearched && !query && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ابحث عن منتجاتك المفضلة</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              استخدم شريط البحث أعلاه للعثور على المنتجات الطبيعية التي تحتاجها
            </p>
            <Link href="/categories">
              <Button className="bg-red-600 hover:bg-red-700">تصفح الأقسام</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <SearchBar className="max-w-2xl mx-auto" />
            </div>
            <ProductGridSkeleton />
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
