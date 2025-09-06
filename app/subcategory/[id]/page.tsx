import { supabase } from "@/lib/supabase"
import { getCachedProducts } from "@/lib/utils"
import type { Product, SubCategory, Category } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { notFound } from "next/navigation"
import Breadcrumbs from "@/components/navigation/Breadcrumbs"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Head from "next/head"

// Update the getSubcategoryWithProducts function to use separate queries
async function getSubcategoryWithProducts(
  id: string,
): Promise<(SubCategory & { products: Product[]; category?: Category }) | null> {
  // First get the subcategory
  const { data: subcategory, error: subcategoryError } = await supabase
    .from("subcategories")
    .select("*")
    .eq("id", id)
    .single() as unknown as { data: SubCategory | null; error: unknown }

  if (subcategoryError) {
    console.error("Error fetching subcategory:", subcategoryError)
    return null
  }

  // Get the category
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", (subcategory as SubCategory).category_id)
    .single() as unknown as { data: Category | null; error: unknown }

  if (categoryError) {
    console.error("Error fetching category:", categoryError)
  }

  // Get the products from cache
  const allProducts = await getCachedProducts()
  const products = allProducts.filter(p => p.subcategory_id === id)

  return subcategory
    ? {
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description,
        image_url: subcategory.image_url,
        category_id: subcategory.category_id,
        is_active: subcategory.is_active,
        sort_order: subcategory.sort_order,
        created_at: subcategory.created_at,
        updated_at: subcategory.updated_at,
        products,
        category: category || undefined,
      }
    : null
}

// Get other subcategories (excluding current one)
async function getOtherSubcategories(currentSubcategoryId: string): Promise<SubCategory[]> {
  const { data: subcategories, error } = await supabase
    .from("subcategories")
    .select("*")
    .neq("id", currentSubcategoryId)
    .limit(12) as unknown as { data: SubCategory[] | null; error: unknown }

  if (error) {
    console.error("Error fetching other subcategories:", error)
    return []
  }

  return (subcategories || []) as SubCategory[]
}

export default async function SubcategoryPage({ params }: { params: { id: string } }) {
  const subcategory = await getSubcategoryWithProducts(params.id)
  const otherSubcategories = await getOtherSubcategories(params.id)

  if (!subcategory) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
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
                ...(subcategory.category ? [{ "@type": "ListItem", position: 3, name: subcategory.category.name, item: `/category/${subcategory.category.id}` }] : []),
                { "@type": "ListItem", position: subcategory.category ? 4 : 3, name: subcategory.name, item: `/subcategory/${subcategory.id}` },
              ],
            }),
          }}
        />
      </Head>
      <div className="mb-8">
        <div className="overflow-hidden">
          <div className="max-w-full truncate">
            <Breadcrumbs
              segments={[
                { href: '/', label: 'الرئيسية' },
                { href: '/categories', label: 'المنتجات' },
                ...(subcategory.category ? [{ href: `/category/${subcategory.category.id}`, label: subcategory.category.name }] : []),
                { label: subcategory.name, count: subcategory.products?.length || 0 }
              ]}
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold">{subcategory.name}</h1>
      </div>

      {subcategory.products && subcategory.products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {subcategory.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">لا توجد منتجات في هذا القسم حالياً</p>
        </div>
      )}

      {/* Other Subcategories Section */}
      {otherSubcategories.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">تصفح فئات أخرى</h2>
            <Link href="/categories">
              <Button variant="outline" className="group bg-transparent">
                عرض الكل
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {otherSubcategories.map((sub) => (
              <Link key={sub.id} href={`/subcategory/${sub.id}`} className="group">
                <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-300 overflow-hidden group-hover:scale-105">
                  <div className="aspect-square bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-2 overflow-hidden">
                    {sub.image_url ? (
                      <Image src={sub.image_url} alt={sub.name} width={200} height={200} className="object-contain w-full h-full rounded-xl" />
                    ) : (
                      <Image
                        src="/placeholder.svg?height=120&width=120&text=فئة"
                        alt="فئة فرعية"
                        width={120}
                        height={120}
                        className="object-contain w-full h-full rounded-xl opacity-60"
                      />
                    )}
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors duration-200 text-sm">
                      {sub.name}
                    </h3>
                    {sub.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{sub.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
