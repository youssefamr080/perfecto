import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-lg p-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-4">
          <span className="text-4xl">😕</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">الصفحة غير موجودة</h1>
        <p className="mt-2 text-gray-600">عذراً، الصفحة التي تحاول الوصول إليها غير موجودة أو تمت إزالتها.</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm">
            العودة للرئيسية
          </Link>
          <Link href="/categories" className="px-4 py-2 border border-gray-200 rounded-lg text-gray-800 bg-white hover:bg-gray-50">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    </div>
  )
}
