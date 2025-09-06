import OffersClient from "./OffersClient"

export const metadata = {
  title: "المنتجات المخفضة - بيرفكتو",
  description: "تسوق أحدث العروض والخصومات على منتجات بيرفكتو.",
}

// إعادة توليد الصفحة كل 15 دقيقة
export const revalidate = 900

export default function OffersPage() {
  return <OffersClient />
}
