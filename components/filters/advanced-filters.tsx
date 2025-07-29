"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Filter, SlidersHorizontal } from "lucide-react"

interface FilterOptions {
  categories: string[]
  priceRange: [number, number]
  inStock: boolean
  featured: boolean
  sortBy: "name" | "price" | "newest" | "popular"
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void
  availableCategories: { id: string; name: string; count: number }[]
}

export function AdvancedFilters({ onFiltersChange, availableCategories }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 1000],
    inStock: false,
    featured: false,
    sortBy: "name",
  })

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId]

    handleFilterChange("categories", newCategories)
  }

  const clearFilters = () => {
    const defaultFilters: FilterOptions = {
      categories: [],
      priceRange: [0, 1000],
      inStock: false,
      featured: false,
      sortBy: "name",
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const activeFiltersCount =
    filters.categories.length +
    (filters.inStock ? 1 : 0) +
    (filters.featured ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 ? 1 : 0)

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="relative bg-white">
        <SlidersHorizontal className="h-4 w-4 ml-2" />
        فلترة
        {activeFiltersCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {/* Filters Panel */}
      {isOpen && (
        <Card className="absolute top-12 left-0 w-80 z-50 shadow-xl border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                فلترة المنتجات
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Categories Filter */}
            <div>
              <h3 className="font-semibold mb-3">الفئات</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableCategories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={filters.categories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-2"
                      >
                        {category.name}
                      </label>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="font-semibold mb-3">نطاق السعر</h3>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange("priceRange", value as [number, number])}
                  max={1000}
                  min={0}
                  step={10}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{filters.priceRange[0]} ج.م</span>
                  <span>{filters.priceRange[1]} ج.م</span>
                </div>
              </div>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={filters.inStock}
                onCheckedChange={(checked) => handleFilterChange("inStock", checked)}
              />
              <label
                htmlFor="inStock"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-2"
              >
                متوفر فقط
              </label>
            </div>

            {/* Featured Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={filters.featured}
                onCheckedChange={(checked) => handleFilterChange("featured", checked)}
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-found peer-disabled:opacity-70 mr-2"
              >
                منتجات مميزة فقط
              </label>
            </div>

            {/* Sort By */}
            <div>
              <h3 className="font-semibold mb-3">ترتيب حسب</h3>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="name">الاسم</option>
                <option value="price">السعر</option>
                <option value="newest">الأحدث</option>
                <option value="popular">الأكثر شعبية</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={clearFilters} className="flex-1 bg-transparent">
                مسح الكل
              </Button>
              <Button onClick={() => setIsOpen(false)} className="flex-1 bg-red-600 hover:bg-red-700">
                تطبيق
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
