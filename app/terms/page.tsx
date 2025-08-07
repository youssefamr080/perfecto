import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ShoppingCart, CreditCard, Truck, RefreshCw, Shield, AlertTriangle, Phone } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            الشروط والأحكام
          </h1>
          <p className="text-gray-600">قواعد وشروط استخدام متجر بيرفكتو تيب</p>
        </div>

        <div className="space-y-6">
          
          {/* قبول الشروط */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                قبول الشروط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                باستخدامك لخدمات بيرفكتو تيب، فإنك توافق على جميع الشروط والأحكام المذكورة أدناه. 
                إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام خدماتنا.
              </p>
            </CardContent>
          </Card>

          {/* الطلبات والدفع */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                الطلبات والدفع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>جميع الأسعار شاملة ضريبة القيمة المضافة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>الدفع عند الاستلام أو عبر وسائل الدفع الإلكترونية المتاحة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>يجب تأكيد الطلب خلال 24 ساعة من إرساله</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>نحتفظ بالحق في رفض أي طلب لأسباب فنية أو قانونية</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* التوصيل */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                التوصيل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>توصيل مجاني للطلبات أكثر من 300 جنيه</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>مدة التوصيل من 30 دقيقة إلى 3 ساعات حسب المنطقة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>يجب تواجد شخص لاستلام الطلب في العنوان المحدد</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>نتواصل معك قبل الوصول بـ 10-15 دقيقة</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* الإرجاع والاستبدال */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-purple-600" />
                الإرجاع والاستبدال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>يمكن إرجاع المنتجات في حالة عدم مطابقتها للمواصفات المطلوبة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>يجب الإبلاغ عن أي مشكلة خلال 30 دقيقة من الاستلام</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>لا يمكن إرجاع المنتجات الطازجة إلا في حالة التلف</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>يتم رد المبلغ خلال 3-7 أيام عمل</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* نقاط الولاء */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-yellow-600" />
                نقاط الولاء
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>تحصل على نقطة واحدة مقابل كل جنيه تنفقه</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>كل 200 نقطة تساوي 4 جنيه خصم</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>1000 نقطة تساوي توصيل مجاني</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>عند إلغاء الطلب يتم خصم نقاط عقوبة حسب قيمة الطلب</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>النقاط صالحة لمدة عام واحد من تاريخ الكسب</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* جودة المنتجات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                جودة المنتجات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>جميع منتجاتنا طبيعية 100% بدون مواد حافظة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>نضمن الطعم الطبيعي والجودة العالية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>جميع المنتجات معدة في بيئة صحية ونظيفة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>نلتزم بمعايير السلامة الغذائية المصرية</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* مسؤولية العميل */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                مسؤولية العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>تقديم معلومات صحيحة ودقيقة عند الطلب</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>التواجد في العنوان المحدد وقت التسليم</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>فحص المنتجات عند الاستلام</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>عدم إساءة استخدام نظام نقاط الولاء</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* حل النزاعات */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Phone className="h-5 w-5" />
                حل النزاعات والاستفسارات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-blue-700">
                في حالة وجود أي مشكلة أو استفسار، نلتزم بحلها في أسرع وقت ممكن. 
                تواصل معنا على:
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <a 
                  href="tel:01034207175"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>01034207175</span>
                </a>
                <a 
                  href="https://wa.me/2001034207175"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>واتساب</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* تاريخ التحديث */}
          <div className="text-center text-gray-500 text-sm pt-6 border-t">
            <p>آخر تحديث: أغسطس 2025</p>
            <p className="mt-2">نحتفظ بالحق في تعديل هذه الشروط في أي وقت</p>
          </div>

        </div>
      </div>
    </div>
  )
}
