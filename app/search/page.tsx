import SearchClient from "./SearchClient"

export const metadata = {
  title: "البحث - بيرفكتو",
  description: "ابحث عن منتجات بيرفكتو باستخدام فلاتر ذكية وترتيب حسب السعر أو الميزة.",
}

export default function SearchPage() {
  return <SearchClient />
}
