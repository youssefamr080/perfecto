import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, Lock, Users, Phone, Mail } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            سياسة الخصوصية
          </h1>
          <p className="text-gray-600">نحن نحترم خصوصيتك ونحمي بياناتك الشخصية</p>
        </div>

        <div className="space-y-6">
          
          {/* جمع المعلومات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                المعلومات التي نجمعها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">نقوم بجمع المعلومات التالية:</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>معلومات الاتصال مثل الاسم ورقم الهاتف والعنوان</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>تفاصيل الطلبات وتاريخ المشتريات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>معلومات الدفع الآمنة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>تفضيلات المنتجات وسجل نقاط الولاء</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* استخدام المعلومات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                كيف نستخدم معلوماتك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">نستخدم معلوماتك لـ:</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>معالجة وتنفيذ طلباتك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>التواصل معك بخصوص الطلبات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>تحسين خدماتنا وتجربة التسوق</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>إرسال العروض الخاصة والتحديثات (بموافقتك)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>إدارة نظام نقاط الولاء</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* حماية المعلومات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-600" />
                حماية معلوماتك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">نتخذ الإجراءات التالية لحماية بياناتك:</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>تشفير قواعد البيانات والاتصالات</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>وصول محدود للموظفين المخولين فقط</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>مراجعة دورية للأنظمة الأمنية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>عدم مشاركة معلوماتك مع أطراف ثالثة بدون موافقتك</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* حقوقك */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                حقوقك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">يحق لك:</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>طلب نسخة من بياناتك الشخصية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>تعديل أو تصحيح معلوماتك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>حذف حسابك ومعلوماتك</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>إلغاء الاشتراك في الرسائل التسويقية</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* التواصل */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Phone className="h-5 w-5" />
                للتواصل بخصوص الخصوصية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-blue-700">إذا كان لديك أي استفسار حول سياسة الخصوصية:</p>
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
                  <Mail className="h-4 w-4" />
                  <span>راسلنا على واتساب</span>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* تاريخ التحديث */}
          <div className="text-center text-gray-500 text-sm pt-6 border-t">
            <p>آخر تحديث: أغسطس 2025</p>
          </div>

        </div>
      </div>
    </div>
  )
}
