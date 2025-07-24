import { getDiscountedProducts } from '@/lib/homepage-data';
import ProductCard from '@/components/ProductCard';
import { AppProduct } from '@/types';

export const revalidate = 3600; // Revalidate every hour

export default async function DiscountsPage() {
  const discountedProducts: AppProduct[] = await getDiscountedProducts();

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
            عروض وخصومات خاصة
          </h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            اكتشف أفضل العروض على منتجاتنا. أسعار لا تقبل المنافسة لفترة محدودة!
          </p>
        </div>

        {discountedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {discountedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">
              عذراً، لا توجد منتجات عليها خصومات حالياً.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
