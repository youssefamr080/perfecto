import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircleIcon, 
  TruckIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function AboutPage() {
  const features = [
    {
      icon: CheckCircleIcon,
      title: 'منتجات طازجة',
      description: 'نحرص على توفير أطزج المنتجات من المزارع المحلية والمصادر الموثوقة'
    },
    {
      icon: TruckIcon,
      title: 'توصيل سريع',
      description: 'خدمة توصيل سريع في نفس اليوم لجميع أنحاء المدينة'
    },
    {
      icon: ClockIcon,
      title: 'متاح 24/7',
      description: 'متجرنا الإلكتروني متاح على مدار الساعة لراحتكم'
    },
    {
      icon: ShieldCheckIcon,
      title: 'ضمان الجودة',
      description: 'نضمن جودة جميع منتجاتنا مع إمكانية الاستبدال والاسترداد'
    }
  ];

  const stats = [
    { label: 'عملاء راضون', value: '10,000+' },
    { label: 'منتج متنوع', value: '500+' },
    { label: 'سنوات خبرة', value: '15+' },
    { label: 'توصيل يومي', value: '200+' }
  ];

  const team = [
    {
      name: 'أحمد محمد',
      role: 'المدير العام',
      image: '/images/team/manager.jpg',
      description: 'خبرة 15 سنة في تجارة المواد الغذائية'
    },
    {
      name: 'فاطمة العلي',
      role: 'مدير الجودة',
      image: '/images/team/quality.jpg',
      description: 'متخصصة في ضمان جودة وسلامة الأغذية'
    },
    {
      name: 'خالد السعد',
      role: 'مدير التوصيل',
      image: '/images/team/delivery.jpg',
      description: 'يدير فريق التوصيل لضمان الوصول السريع'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-green-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center" dir="rtl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              عن متجر بيرفكتو
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              متجرك المتكامل للمواد الغذائية الطازجة والمنتجات المحلية عالية الجودة
            </p>
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
              <span className="mr-2 text-lg">4.9 من 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div dir="rtl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">قصتنا</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  بدأ متجر بيرفكتو في عام 2009 كمتجر صغير في دمنهور، بهدف توفير المواد الغذائية 
                  الطازجة والمنتجات المحلية عالية الجودة لأهالي المنطقة. منذ ذلك الحين، نمونا لنصبح 
                  واحداً من أهم المتاجر الإلكترونية للمواد الغذائية في مصر.
                </p>
                <p>
                  نؤمن بأن الغذاء الطازج والصحي حق لكل أسرة، ولذلك نحرص على انتقاء أفضل المنتجات 
                  من المزارع المحلية والمصادر الموثوقة. فريقنا من الخبراء يعمل على مدار الساعة لضمان 
                  وصول أطزج المنتجات إلى منزلكم.
                </p>
                <p>
                  اليوم، نخدم أكثر من 10,000 عميل راضٍ، ونوصل أكثر من 200 طلب يومياً، مع الحفاظ 
                  على التزامنا بالجودة والطعة والخدمة المتميزة.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src="/images/about/store1.jpg"
                      alt="متجر بيرفكتو"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-32 rounded-lg overflow-hidden">
                    <Image
                      src="/images/about/products1.jpg"
                      alt="منتجات طازجة"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative h-32 rounded-lg overflow-hidden">
                    <Image
                      src="/images/about/delivery1.jpg"
                      alt="خدمة التوصيل"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src="/images/about/team1.jpg"
                      alt="فريق العمل"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" dir="rtl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">لماذا بيرفكتو؟</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              نتميز بخدماتنا المتنوعة والتي تهدف إلى توفير أفضل تجربة تسوق لعملائنا
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" dir="rtl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">فريق العمل</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              فريق من الخبراء المتخصصين يعمل بشغف لخدمتكم
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-green-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-lg p-8" dir="rtl">
              <div className="flex items-center mb-4">
                <HeartIcon className="h-8 w-8 text-green-600 ml-3" />
                <h3 className="text-2xl font-bold text-gray-900">رسالتنا</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                نسعى لتوفير أطزج المنتجات الغذائية وأعلاها جودة لعملائنا الكرام، مع خدمة 
                توصيل سريعة وموثوقة. نؤمن بأن الغذاء الصحي والطازج أساس الحياة الصحية، 
                ونعمل على جعل هذا متاحاً لكل أسرة بأفضل الأسعار.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-8" dir="rtl">
              <div className="flex items-center mb-4">
                <StarIcon className="h-8 w-8 text-green-600 ml-3" />
                <h3 className="text-2xl font-bold text-gray-900">رؤيتنا</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                أن نكون المتجر الإلكتروني الرائد في مصر لتوفير المواد الغذائية الطازجة، 
                ونطمح لأن نكون الخيار الأول لكل أسرة تبحث عن الجودة والثقة والخدمة المتميزة 
                في التسوق الإلكتروني للمواد الغذائية.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">انضم إلى عائلة بيرفكتو</h2>
          <p className="text-xl mb-8 opacity-90">
            اكتشف الفرق واستمتع بتجربة تسوق استثنائية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              تصفح المنتجات
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
