import { supabase } from "@/lib/supabase"
import type { Category, SubCategory, Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"

async function getCategoryWithProducts(
  id: string,
): Promise<(Category & { subcategories: (SubCategory & { products: Product[] })[] }) | null> {
  // Get the category
  const { data: category, error: categoryError } = await supabase.from("categories").select("*").eq("id", id).single()

  if (categoryError) {
    console.error("Error fetching category:", categoryError)
    return null
  }

  // Get subcategories for this category
  const { data: subcategories, error: subcategoriesError } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", id)
    .eq("is_active", true)
    .order("sort_order")

  if (subcategoriesError) {
    console.error("Error fetching subcategories:", subcategoriesError)
    return { ...category, subcategories: [] }
  }

  // Get products for each subcategory
  const subcategoriesWithProducts = await Promise.all(
    (subcategories || []).map(async (subcategory) => {
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("subcategory_id", subcategory.id)
        .eq("is_available", true)
        .order("name")

      if (productsError) {
        console.error("Error fetching products:", productsError)
        return { ...subcategory, products: [] }
      }

      return { ...subcategory, products: products || [] }
    }),
  )

  return {
    ...category,
    subcategories: subcategoriesWithProducts,
  }
}

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const category = await getCategoryWithProducts(params.id)

  if (!category) {
    notFound()
  }

  const totalProducts = category.subcategories.reduce((sum, sub) => sum + sub.products.length, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Hero Section */}
      <div className="relative bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-12 md:py-16">
          <div className="text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl md:text-4xl">
                {category.name === "اللحوم والمصنعات" ? "🥩" : category.name === "الألبان ومنتجاتها" ? "🧀" : "🍯"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{category.name}</h1>
            <p className="text-green-100 text-lg mb-4 max-w-2xl mx-auto">
              {category.description || "اكتشف مجموعتنا المتنوعة من المنتجات الطبيعية عالية الجودة"}
            </p>
            <Badge className="bg-white/20 text-white text-sm px-4 py-2">{totalProducts} منتج متاح</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Subcategories Navigation */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {category.subcategories.map((subcategory) => (
              <a
                key={subcategory.id}
                href={`#${subcategory.id}`}
                className="flex-shrink-0 bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 min-w-[140px] text-center"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl">
                    {subcategory.name.includes("لانشون")
                      ? "🥪"
                      : subcategory.name.includes("بسطرمة")
                        ? "🥓"
                        : subcategory.name.includes("مجمدات")
                          ? "🧊"
                          : subcategory.name.includes("شاورما")
                            ? "🌯"
                            : subcategory.name.includes("أجبان")
                              ? "🧀"
                              : subcategory.name.includes("حلاوة")
                                ? "🍯"
                                : subcategory.name.includes("عسل")
                                  ? "🍯"
                                  : subcategory.name.includes("زيوت")
                                    ? "🫒"
                                    : "🥜"}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-gray-800">{subcategory.name}</h3>
                <p className="text-xs text-black mt-1">{subcategory.products.length} منتج</p>
              </a>
            ))}
          </div>
        </div>

        {/* Products by Subcategory */}
        {category.subcategories.map((subcategory) => (
          <section key={subcategory.id} id={subcategory.id} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">
                    {subcategory.name.includes("لانشون")
                      ? "🥪"
                      : subcategory.name.includes("بسطرمة")
                        ? "🥓"
                        : subcategory.name.includes("مجمدات")
                          ? "🧊"
                          : subcategory.name.includes("شاورما")
                            ? "🌯"
                            : subcategory.name.includes("أجبان")
                              ? "🧀"
                              : subcategory.name.includes("حلاوة")
                                ? "🍯"
                                : subcategory.name.includes("عسل")
                                  ? "🍯"
                                  : subcategory.name.includes("زيوت")
                                    ? "🫒"
                                    : "🥜"}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">{subcategory.name}</h2>
                  <p className="text-sm text-gray-600">{subcategory.products.length} منتج متاح</p>
                </div>
              </div>
            </div>

            {subcategory.products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {subcategory.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-gray-600">لا توجد منتجات في هذا القسم حالياً</p>
              </div>
            )}
          </section>
        ))}

        {/* Empty State */}
        {category.subcategories.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-500">لا توجد منتجات في هذه الفئة حالياً</p>
          </div>
        )}
      </div>
    </div>
  )
}
