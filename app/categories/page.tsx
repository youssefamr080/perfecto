import { supabase } from "@/lib/supabase"
import type { Category, SubCategory } from "@/lib/types"
import Link from "next/link"
import Breadcrumbs from "@/components/navigation/Breadcrumbs"
import Image from "next/image"

// Update the getCategoriesWithSubcategories function to use separate queries
async function getCategoriesWithSubcategories(): Promise<(Category & { subcategories: SubCategory[] })[]> {
  // Get all categories
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("name") as unknown as { data: Category[] | null; error: unknown }

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError)
    return []
  }

  // Get all subcategories
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from("subcategories")
    .select("*") as unknown as { data: SubCategory[] | null; error: unknown }

  if (subcategoriesError) {
    console.error("Error fetching subcategories:", subcategoriesError)
    return categories?.map((cat) => ({ ...cat, subcategories: [] })) || []
  }

  // Group subcategories by category
  const categoriesWithSubs: (Category & { subcategories: SubCategory[] })[] = (categories || []).map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    image_url: category.image_url,
    is_active: category.is_active,
    sort_order: category.sort_order,
    created_at: category.created_at,
    updated_at: category.updated_at,
    subcategories: (subcategories || []).filter((sub) => sub.category_id === category.id),
  }))

  return categoriesWithSubs
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithSubcategories()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-10">
        <div className="overflow-hidden mb-4">
          <div className="max-w-full truncate">
            <Breadcrumbs segments={[{ href: '/', label: 'الرئيسية' }, { label: 'المنتجات' }]} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8">جميع الأقسام</h1>

        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">عرض الفئات الفرعية مُصنفة تحت الفئات الرئيسية مع صور لكل فئة فرعية لتسهيل التصفح.</p>

        <div className="space-y-10">
          {categories.map((category) => (
            <section key={category.id} className="">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                  {category.description && <p className="text-sm text-gray-600">{category.description}</p>}
                </div>
                <div className="text-sm text-gray-500">{category.subcategories?.length || 0} فئات فرعية</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {category.subcategories?.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/subcategory/${sub.id}`}
                    className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-transform transform hover:-translate-y-1"
                  >
                    <div className="w-full h-28 bg-gray-100 overflow-hidden relative">
                      <Image
                        src={sub.image_url || '/placeholder.jpg'}
                        alt={sub.name}
                        fill
                        sizes="200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900">{sub.name}</h3>
                      {sub.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{sub.description}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

      </div>
    </div>
  )
}
