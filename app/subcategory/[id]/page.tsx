import { supabase } from "@/lib/supabase"
import { getCachedProducts } from "@/lib/utils"
import type { Product, SubCategory, Category } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { notFound } from "next/navigation"
import Breadcrumbs from "@/components/navigation/Breadcrumbs"

// Update the getSubcategoryWithProducts function to use separate queries
async function getSubcategoryWithProducts(
  id: string,
): Promise<(SubCategory & { products: Product[]; category?: Category }) | null> {
  // First get the subcategory
  const { data: subcategory, error: subcategoryError } = await supabase
    .from("subcategories")
    .select("*")
    .eq("id", id)
    .single()

  if (subcategoryError) {
    console.error("Error fetching subcategory:", subcategoryError)
    return null
  }

  // Get the category
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", subcategory.category_id)
    .single()

  if (categoryError) {
    console.error("Error fetching category:", categoryError)
  }

  // Get the products from cache
  const allProducts = await getCachedProducts()
  const products = allProducts.filter(p => p.subcategory_id === id)

  return {
    ...subcategory,
    products: products,
    category: category || undefined,
  }
}

export default async function SubcategoryPage({ params }: { params: { id: string } }) {
  const subcategory = await getSubcategoryWithProducts(params.id)

  if (!subcategory) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subcategory.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">لا توجد منتجات في هذا القسم حالياً</p>
        </div>
      )}
    </div>
  )
}
