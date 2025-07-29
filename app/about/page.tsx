export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-green-600">من نحن</h1>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">🌱</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">بيرفكتو تيب - أجود المنتجات الطبيعية</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            نحن متجر متخصص في توفير أجود أنواع المنتجات الطبيعية 100% بدون مواد حافظة أو إضافات صناعية. هدفنا هو تقديم
            طعام صحي وطبيعي لك ولعائلتك.
          </p>
        </div>

        {/* Our Story */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6">قصتنا</h3>
          <div className="bg-green-50 p-6 rounded-lg">
            <p className="text-gray-700 leading-relaxed mb-4">
              بدأت رحلتنا من إيماننا العميق بأن الطعام الطبيعي هو حق لكل إنسان. في عالم مليء بالمواد الحافظة والإضافات
              الصناعية، قررنا أن نكون الفرق ونقدم منتجات طبيعية 100% تحافظ على صحتك وصحة عائلتك.
            </p>
            <p className="text-gray-700 leading-relaxed">
              نعمل مع أفضل المنتجين المحليين الذين يشاركوننا نفس الرؤية والالتزام بالجودة والطبيعية. كل منتج في متجرنا
              يمر بفحص دقيق للتأكد من مطابقته لمعايير الجودة العالية التي نؤمن بها.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6">قيمنا</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white border border-green-200 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌿</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">طبيعي 100%</h4>
              <p className="text-gray-600">جميع منتجاتنا طبيعية بدون أي مواد حافظة أو إضافات صناعية</p>
            </div>
            <div className="text-center p-6 bg-white border border-green-200 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">جودة عالية</h4>
              <p className="text-gray-600">نختار منتجاتنا بعناية فائقة لضمان أعلى مستويات الجودة</p>
            </div>
            <div className="text-center p-6 bg-white border border-green-200 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">توصيل سريع</h4>
              <p className="text-gray-600">توصيل مجاني للطلبات أكثر من 300 جنيه في نفس اليوم</p>
            </div>
          </div>
        </section>

        {/* Our Products */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6">منتجاتنا</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h4 className="text-xl font-semibold mb-3 text-green-600">اللحوم والمصنعات</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• لانشون بأنواعه المختلفة</li>
                <li>• بسطرمة بلدي أصلية</li>
                <li>• منتجات مجمدة طازجة</li>
                <li>• شاورما جاهزة للطبخ</li>
              </ul>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h4 className="text-xl font-semibold mb-3 text-green-600">الألبان والمنتجات المتنوعة</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• أجبان طبيعية متنوعة</li>
                <li>• حلاوة طحينية طبيعية</li>
                <li>• عسل نحل طبيعي</li>
                <li>• زيوت وطحينة طبيعية</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6">تواصل معنا</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">معلومات التواصل</h4>
                <p className="text-gray-600 mb-2">📞 الهاتف: 01234567890</p>
                <p className="text-gray-600 mb-2">📧 البريد الإلكتروني: info@perfectoteb.com</p>
                <p className="text-gray-600">📍 العنوان: القاهرة، مصر</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">ساعات العمل</h4>
                <p className="text-gray-600 mb-2">السبت - الخميس: 9:00 ص - 10:00 م</p>
                <p className="text-gray-600 mb-2">الجمعة: 2:00 م - 10:00 م</p>
                <p className="text-gray-600">التوصيل متاح 7 أيام في الأسبوع</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <h3 className="text-2xl font-bold mb-6">لماذا تختارنا؟</h3>
          <div className="bg-green-600 text-white p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">✅ ضمان الجودة</h4>
                <p className="text-green-100 mb-4">نضمن لك جودة جميع منتجاتنا أو استرداد كامل للمبلغ</p>
                <h4 className="font-semibold mb-3">✅ أسعار تنافسية</h4>
                <p className="text-green-100">أفضل الأسعار مع أعلى جودة في السوق</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">✅ خدمة عملاء ممتازة</h4>
                <p className="text-green-100 mb-4">فريق خدمة عملاء متاح للرد على استفساراتك</p>
                <h4 className="font-semibold mb-3">✅ نقاط ولاء</h4>
                <p className="text-green-100">اكسب نقاط مع كل عملية شراء واستبدلها بخصومات</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
