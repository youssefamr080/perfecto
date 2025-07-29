import { supabase } from "@/lib/supabase"
import type { Category, SubCategory } from "@/lib/types"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Update the getCategoriesWithSubcategories function to use separate queries
async function getCategoriesWithSubcategories(): Promise<(Category & { subcategories: SubCategory[] })[]> {
  // Get all categories
  const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").order("name")

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError)
    return []
  }

  // Get all subcategories
  const { data: subcategories, error: subcategoriesError } = await supabase.from("subcategories").select("*")

  if (subcategoriesError) {
    console.error("Error fetching subcategories:", subcategoriesError)
    return categories?.map((cat) => ({ ...cat, subcategories: [] })) || []
  }

  // Group subcategories by category
  const categoriesWithSubs =
    categories?.map((category) => ({
      ...category,
      subcategories: subcategories?.filter((sub) => sub.category_id === category.id) || [],
    })) || []

  return categoriesWithSubs
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithSubcategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">جميع الأقسام</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="h-full">
            <CardHeader>
              <CardTitle className="text-xl text-center">{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.subcategories?.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/subcategory/${subcategory.id}`}
                    className="block p-3 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors"
                  >
                    <span className="text-gray-700 hover:text-green-600">{subcategory.name}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
