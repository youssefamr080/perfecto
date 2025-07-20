'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User, Phone, CreditCard, CheckCircle, Plus } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useUser } from '@/contexts/UserContext'

// Define Address type at the top
interface Address {
  id: string;
  title: string;
  fullAddress: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart()
  const { user, isLoggedIn, login, getDefaultAddress, addAddress } = useUser()
  const [currentStep, setCurrentStep] = useState(isLoggedIn ? 2 : 1)
  const [orderDetails, setOrderDetails] = useState<unknown>(null)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  
  const [loginInfo, setLoginInfo] = useState({
    name: '',
    phone: ''
  })

  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    notes: ''
  })

  const [newAddress, setNewAddress] = useState({
    title: '',
    fullAddress: '',
    area: '',
    building: '',
    floor: '',
    apartment: '',
    landmark: '',
    isDefault: false
  })

  // تحديث بيانات العميل عند تسجيل الدخول
  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.name,
        phone: user.phone,
        address: getDefaultAddress()?.fullAddress || ''
      }))
      if (currentStep === 1) {
        setCurrentStep(2)
      }
    }
  }, [user, currentStep, getDefaultAddress]);

  const deliveryFee = getTotalPrice() >= 200 ? 0 : 20
  const totalWithDelivery = getTotalPrice() + deliveryFee

  const handleLogin = async () => {
    if (!loginInfo.name || !loginInfo.phone) return

    setIsLoggingIn(true)
    try {
      await login(loginInfo)
      // سيتم تحديث currentStep في useEffect
    } catch (error) {
      alert('خطأ في تسجيل الدخول: ' + error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleAddAddress = async () => {
    if (!newAddress.title || !newAddress.fullAddress) return

    try {
      await addAddress({
        ...newAddress,
        isDefault: Boolean(newAddress.isDefault)
      })
      setShowAddAddress(false)
      setNewAddress({
        title: '',
        fullAddress: '',
        area: '',
        building: '',
        floor: '',
        apartment: '',
        landmark: '',
        isDefault: false
      })
      // تحديث العنوان المختار
      setCustomerInfo(prev => ({
        ...prev,
        address: newAddress.fullAddress
      }))
    } catch (error) {
      alert('خطأ في إضافة العنوان: ' + error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleLoginInputChange = (field: string, value: string) => {
    setLoginInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressInputChange = (field: string, value: string | boolean) => {
    setNewAddress(prev => ({ ...prev, [field]: value }))
  }

  const handlePlaceOrder = async () => {
    try {
      setCurrentStep(3)
      
      // إعداد بيانات الطلب
      const orderData = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        notes: customerInfo.notes,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: totalWithDelivery,
        deliveryFee: deliveryFee
      }

      // إرسال الطلب إلى الخادم
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        setOrderDetails(result.order)
        setOrderPlaced(true)
        clearCart()
        // حفظ معرف الطلب في localStorage لتتبعه لاحقاً
        localStorage.setItem('lastOrderId', result.order.id)
      } else {
        alert('حدث خطأ في إرسال الطلب: ' + result.error)
        setCurrentStep(2)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('حدث خطأ في إرسال الطلب')
      setCurrentStep(2)
    }
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">لا توجد منتجات للطلب</h2>
            <p className="text-gray-600 mb-8">يجب إضافة منتجات إلى السلة أولاً</p>
            <Link
              href="/"
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              تسوق الآن
            </Link>
          </div>
        </main>

      </div>
    )
  }

  if (orderPlaced && orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                تم إرسال طلبك بنجاح!
              </h1>
              
              <p className="text-gray-600 mb-6">
                رقم الطلب: <span className="font-mono text-lg">{orderDetails.id}</span>
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right">
                <h3 className="font-semibold mb-4">تفاصيل الطلب:</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{getTotalPrice()} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>رسوم التوصيل:</span>
                    <span>{deliveryFee} ج.م</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>الإجمالي:</span>
                    <span>{totalWithDelivery} ج.م</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8">
                سيتم التواصل معك قريباً لتأكيد الطلب وتحديد موعد التوصيل
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors text-center"
                >
                  متابعة التسوق
                </Link>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  طباعة الطلب
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-red-600">الرئيسية</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-red-600">سلة التسوق</Link>
          <span>/</span>
          <span className="text-gray-900">إتمام الطلب</span>
        </nav>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className={`flex items-center space-x-2 rtl:space-x-reverse ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                1
              </div>
              <span className="font-medium">{isLoggedIn ? 'العنوان' : 'تسجيل الدخول'}</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 rtl:space-x-reverse ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                2
              </div>
              <span className="font-medium">مراجعة الطلب</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 rtl:space-x-reverse ${currentStep >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                3
              </div>
              <span className="font-medium">تأكيد الطلب</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Login or Address */}
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isLoggedIn ? 'اختر عنوان التوصيل' : 'تسجيل الدخول'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {isLoggedIn 
                      ? 'اختر عنواناً محفوظاً أو أضف عنوان جديد' 
                      : 'أدخل اسمك ورقم هاتفك للمتابعة'
                    }
                  </p>
                </div>

                <div className="p-6">
                  {!isLoggedIn ? (
                    /* Login Form */
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          الاسم الكامل
                        </label>
                        <div className="relative">
                          <User className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={loginInfo.name}
                            onChange={(e) => handleLoginInputChange('name', e.target.value)}
                            className="w-full pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="أدخل اسمك الكامل"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رقم الهاتف
                        </label>
                        <div className="relative">
                          <Phone className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={loginInfo.phone}
                            onChange={(e) => handleLoginInputChange('phone', e.target.value)}
                            className="w-full pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="01xxxxxxxxx"
                            required
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleLogin}
                        disabled={!loginInfo.name || !loginInfo.phone || isLoggingIn}
                        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isLoggingIn ? 'جاري التحقق...' : 'متابعة'}
                      </button>
                    </div>
                  ) : (
                    /* Address Selection */
                    <div className="space-y-4">
                      {/* Saved Addresses */}
                      {user?.addresses && user.addresses.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">العناوين المحفوظة</h3>
                          <div className="space-y-3">
                            {(user.addresses as Address[]).map((address) => (
                              <div
                                key={address.id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  customerInfo.address === address.fullAddress
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleInputChange('address', address.fullAddress)}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{address.title}</h4>
                                    <p className="text-gray-600 text-sm mt-1">{address.fullAddress}</p>
                                    {address.isDefault && (
                                      <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                        العنوان الافتراضي
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add New Address Button */}
                      <button
                        onClick={() => setShowAddAddress(true)}
                        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-400 hover:text-red-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>إضافة عنوان جديد</span>
                      </button>

                      {/* Add Address Form */}
                      {showAddAddress && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold mb-4">إضافة عنوان جديد</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                اسم العنوان
                              </label>
                              <input
                                type="text"
                                value={newAddress.title}
                                onChange={(e) => handleAddressInputChange('title', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="البيت، الشغل، إلخ"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                المنطقة
                              </label>
                              <input
                                type="text"
                                value={newAddress.area}
                                onChange={(e) => handleAddressInputChange('area', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="اسم المنطقة"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                العنوان بالتفصيل
                              </label>
                              <textarea
                                value={newAddress.fullAddress}
                                onChange={(e) => handleAddressInputChange('fullAddress', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="العنوان كاملاً مع الشارع ورقم المبنى"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                رقم المبنى
                              </label>
                              <input
                                type="text"
                                value={newAddress.building}
                                onChange={(e) => handleAddressInputChange('building', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="رقم المبنى"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                الدور والشقة
                              </label>
                              <input
                                type="text"
                                value={newAddress.apartment}
                                onChange={(e) => handleAddressInputChange('apartment', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="الدور 3 شقة 5"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center mt-4">
                            <input
                              type="checkbox"
                              id="isDefault"
                              checked={Boolean(newAddress.isDefault)}
                              onChange={(e) => handleAddressInputChange('isDefault', e.target.checked)}
                              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            />
                            <label htmlFor="isDefault" className="mr-2 text-sm text-gray-700">
                              جعل هذا العنوان افتراضي
                            </label>
                          </div>

                          <div className="flex space-x-3 mt-6">
                            <button
                              onClick={handleAddAddress}
                              disabled={!newAddress.title || !newAddress.fullAddress}
                              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300"
                            >
                              حفظ العنوان
                            </button>
                            <button
                              onClick={() => setShowAddAddress(false)}
                              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ملاحظات إضافية (اختياري)
                        </label>
                        <textarea
                          value={customerInfo.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="أي ملاحظات خاصة بالطلب..."
                        />
                      </div>

                      <button
                        onClick={() => setCurrentStep(2)}
                        disabled={!customerInfo.address}
                        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        متابعة إلى مراجعة الطلب
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Order Review */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">مراجعة الطلب</h2>
                  <p className="text-gray-600 mt-1">تأكد من صحة بياناتك ومنتجاتك</p>
                </div>

                <div className="p-6">
                  {/* Customer Info Review */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">معلومات العميل</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div><strong>الاسم:</strong> {customerInfo.name}</div>
                      <div><strong>الهاتف:</strong> {customerInfo.phone}</div>
                      <div><strong>العنوان:</strong> {customerInfo.address}</div>
                      {customerInfo.notes && (
                        <div><strong>الملاحظات:</strong> {customerInfo.notes}</div>
                      )}
                    </div>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      تعديل البيانات
                    </button>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">المنتجات المطلوبة</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 relative bg-white rounded-lg overflow-hidden">
                            <Image
                              src={item.product.images[0] || '/images/products/placeholder.jpg'}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                            <p className="text-gray-600 text-sm">{item.product.price} ج.م × {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {(item.product.price * item.quantity).toFixed(2)} ج.م
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4 rtl:space-x-reverse">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      رجوع
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      تأكيد الطلب
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Order Confirmation */}
            {currentStep === 3 && !orderPlaced && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">جاري إرسال طلبك...</h2>
                  <p className="text-gray-600">يرجى الانتظار</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">ملخص الطلب</h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-12 h-12 relative bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={item.product.images[0] || '/images/products/placeholder.jpg'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.product.name}</h4>
                        <p className="text-gray-600 text-xs">{item.quantity} × {item.product.price} ج.م</p>
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {(item.product.price * item.quantity).toFixed(2)} ج.م
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">المجموع الفرعي:</span>
                    <span className="text-gray-900">{getTotalPrice().toFixed(2)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">رسوم التوصيل:</span>
                    <span className="text-gray-900">{deliveryFee} ج.م</span>
                  </div>
                  {deliveryFee === 0 && (
                    <p className="text-green-600 text-xs">
                      توصيل مجاني للطلبات أكثر من 200 ج.م
                    </p>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-3">
                    <span>الإجمالي:</span>
                    <span className="text-red-600">{totalWithDelivery.toFixed(2)} ج.م</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium text-sm">الدفع عند الاستلام</span>
                  </div>
                  <p className="text-blue-700 text-xs mt-1">
                    ادفع نقداً عند وصول الطلب
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
