import { supabase } from "@/lib/supabase"
import type { Category, SubCategory, Product } from "@/lib/types"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import Image from "next/image"
import { ProductCard } from "@/components/product-card"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import Head from "next/head"

// جلب جميع الأقسام
async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order")
  if (error) {
    console.error("Error fetching all categories:", error)
    return []
  }
  return data || []
}

async function getCategoryWithProducts(
  id: string,
): Promise<(Category & { subcategories: (SubCategory & { products: Product[] })[] }) | null> {
  const db = supabase as unknown as SupabaseClient<Database>
  // Get the category
  const { data: categoryRow, error: categoryError } = await db.from("categories").select("*").eq("id", id).single()

  if (categoryError) {
    console.error("Error fetching category:", categoryError)
    return null
  }

  // Get subcategories for this category
  const { data: subcategoriesRows, error: subcategoriesError } = await db
    .from("subcategories")
    .select("*")
    .eq("category_id", id)
    .eq("is_active", true)
    .order("sort_order")

  if (subcategoriesError) {
    console.error("Error fetching subcategories:", subcategoriesError)
  return { ...(categoryRow as unknown as Category), subcategories: [] }
  }

  // Get products for each subcategory
  const subcategoriesWithProducts = await Promise.all(
    ((subcategoriesRows || []) as unknown as SubCategory[]).map(async (subcategory: SubCategory) => {
      const { data: productsRows, error: productsError } = await db
        .from("products")
        .select("*")
        .eq("subcategory_id", subcategory.id)
        .eq("is_available", true)
        .order("name")

      if (productsError) {
        console.error("Error fetching products:", productsError)
        return { ...subcategory, products: [] as Product[] }
      }

      return { ...subcategory, products: (productsRows as unknown as Product[]) || [] }
    }),
  )

  return {
    ...(categoryRow as unknown as Category),
    subcategories: subcategoriesWithProducts,
  }
}

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const [category, allCategories] = await Promise.all([
    getCategoryWithProducts(params.id),
    getAllCategories(),
  ])

  if (!category) {
    notFound()
  }

  // استبعاد القسم الحالي
  const otherCategories = allCategories.filter((cat: Category) => cat.id !== params.id)

  const totalProducts = category.subcategories.reduce((sum: number, sub: SubCategory & { products: Product[] }) => sum + sub.products.length, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "الرئيسية", item: "/" },
                { "@type": "ListItem", position: 2, name: "المنتجات", item: "/categories" },
                { "@type": "ListItem", position: 3, name: category.name, item: `/category/${category.id}` },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CategoryCodeSet",
              name: category.name,
              description: category.description || undefined,
              url: `/category/${category.id}`,
            }),
          }}
        />
      </Head>
      {/* Category Hero Section with Banner Image */}
      <div className="relative text-white">
        {/* اختر صورة البانر حسب اسم الفئة */}
        <Image
          src={
            category.name === "اللحوم والمصنعات"
              ? "/banner-meat.jpg"
              : category.name === "الألبان ومنتجاتها"
              ? "/banner-dairy.jpg"
              : "/banner-other.jpg"
          }
          alt={category.name}
          width={1600}
          height={600}
          className="w-full h-56 md:h-80 object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center">
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
            <Badge className="bg-white/80 text-gray-900 text-sm px-4 py-2">{totalProducts} منتج متاح</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Subcategories Navigation */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {category.subcategories.map((subcategory: SubCategory & { products: Product[] }) => (
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
                <p className="text-xs text-gray-900 mt-1">{subcategory.products.length} منتج</p>
              </a>
            ))}
          </div>
        </div>

        {/* Products by Subcategory */}
  {category.subcategories.map((subcategory: SubCategory & { products: Product[] }) => (
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
                {subcategory.products.map((product: Product) => (
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

      {/* الأقسام الأخرى */}
      {otherCategories.length > 0 && (
        <div className="container mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold mb-4 text-gray-700 text-center">تصفح أقسام أخرى</h2>
          <div className="grid grid-cols-2 gap-4 justify-items-center items-stretch">
            {otherCategories.map((cat: Category) => (
              <a
                key={cat.id}
                href={`/category/${cat.id}`}
                aria-label={cat.name}
                className="w-full max-w-[360px] bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-200 hover:shadow-2xl transform hover:-translate-y-1"
              >
                {/* top image block: mint background with large rounded corners */}
                <div className="bg-green-50 p-4 flex justify-center items-center rounded-t-2xl">
                  <div className="w-36 h-36 rounded-2xl overflow-hidden bg-white shadow-md border border-white">
                    <Image
                      src={cat.image_url || "/placeholder-logo.png"}
                      alt={cat.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* white body with text, matching the screenshot spacing */}
                <div className="px-5 pb-6 pt-4 text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-1">{cat.name}</div>
                  <div className="text-sm text-gray-500">{cat.description?.slice(0, 80) || "قسم متنوع"}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
