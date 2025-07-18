'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  ClockIcon,
  ChevronRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // محاكاة إرسال النموذج
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'رقم الهاتف',
      details: ['+20 45 123 4567', '+20 100 123 4567'],
      description: 'متاح 24/7 لخدمتكم'
    },
    {
      icon: EnvelopeIcon,
      title: 'البريد الإلكتروني',
      details: ['info@perfecto.com', 'support@perfecto.com'],
      description: 'نرد خلال 24 ساعة'
    },
    {
      icon: MapPinIcon,
      title: 'العنوان',
      details: ['دمنهور، شارع عبد السلام الشاذلي', 'خلف ماكدونالدز'],
      description: 'مقر الإدارة الرئيسي'
    },
    {
      icon: ClockIcon,
      title: 'ساعات العمل',
      details: ['الأحد - الخميس: 8 صباحاً - 10 مساءً', 'الجمعة - السبت: 10 صباحاً - 12 منتصف الليل'],
      description: 'خدمة التوصيل متاحة على مدار الساعة'
    }
  ];

  const subjects = [
    'استفسار عام',
    'شكوى على منتج',
    'مشكلة في التوصيل',
    'استرداد أو استبدال',
    'اقتراح أو تحسين',
    'شراكة تجارية',
    'أخرى'
  ];

  const faqs = [
    {
      question: 'كيف يمكنني تتبع طلبي؟',
      answer: 'يمكنك تتبع طلبك من خلال صفحة "تتبع الطلبات" باستخدام رقم الطلب أو رقم الهاتف.'
    },
    {
      question: 'ما هي مناطق التوصيل المتاحة؟',
      answer: 'نوصل لجميع أحياء دمنهور والمناطق المجاورة. يتم تحديد رسوم التوصيل حسب المنطقة.'
    },
    {
      question: 'هل يمكنني إلغاء أو تعديل طلبي؟',
      answer: 'يمكن إلغاء أو تعديل الطلب خلال 30 دقيقة من تأكيد الطلب. بعد ذلك يدخل الطلب مرحلة التحضير.'
    },
    {
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'نقبل الدفع نقداً عند الاستلام، وقريباً سنوفر طرق دفع إلكترونية متنوعة.'
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تم إرسال رسالتك بنجاح!</h2>
          <p className="text-gray-600 mb-6">
            شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
            >
              إرسال رسالة أخرى
            </button>
            <Link
              href="/"
              className="block w-full text-green-600 hover:text-green-700 text-center"
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4" dir="rtl">
            <Link href="/" className="hover:text-green-600">الرئيسية</Link>
            <ChevronRightIcon className="h-4 w-4 mx-2" />
            <span className="text-gray-900">تواصل معنا</span>
          </nav>

          <div className="text-center" dir="rtl">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">تواصل معنا</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              نحن هنا لخدمتكم والإجابة على جميع استفساراتكم
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6" dir="rtl">معلومات التواصل</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4" dir="rtl">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <info.icon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 mr-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">{info.title}</h3>
                      <div className="space-y-1">
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-gray-600">{detail}</p>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6" dir="rtl">الأسئلة الشائعة</h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-2" dir="rtl">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-gray-600" dir="rtl">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6" dir="rtl">أرسل لنا رسالة</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div dir="rtl">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  
                  <div dir="rtl">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+20 100 XXX XXXX"
                    />
                  </div>
                </div>

                <div dir="rtl">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>

                <div dir="rtl">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    موضوع الرسالة *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">اختر موضوع الرسالة</option>
                    {subjects.map((subject, index) => (
                      <option key={index} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div dir="rtl">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    نص الرسالة *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <div dir="rtl">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-6 rounded-md font-semibold transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  </button>
                </div>
              </form>
            </div>

            {/* Additional Info */}
            <div className="mt-8 bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3" dir="rtl">
                معلومات إضافية
              </h3>
              <div className="space-y-2 text-sm text-blue-800" dir="rtl">
                <p>• نرد على جميع الرسائل خلال 24 ساعة كحد أقصى</p>
                <p>• للشكاوى العاجلة، يرجى الاتصال على الرقم المباشر</p>
                <p>• يمكنكم أيضاً زيارة مقرنا الرئيسي في دمنهور</p>
                <p>• متاح خدمة عملاء على الواتساب: +20 100 123 4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section (Placeholder) */}
      <div className="bg-gray-300 h-64 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
          <p>خريطة الموقع</p>
          <p className="text-sm">سيتم إضافة الخريطة التفاعلية قريباً</p>
        </div>
      </div>
    </div>
  );
}
