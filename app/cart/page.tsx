'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

// نوع الخصائص لمكون WeightDropdown
// WeightDropdownProps type
//
type WeightDropdownProps = {
  item: any;
  updateQuantity: (productId: string, quantity: number) => void;
};

// مكون القائمة المنسدلة للوزن
function WeightDropdown({ item, updateQuantity }: WeightDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const options = [0.125, 0.25, 0.5, 1]; // ثمن، ربع، نصف، كيلو
  const labels = ['ثمن كيلو', 'ربع كيلو', 'نصف كيلو', 'كيلو'];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="flex flex-col items-center min-w-[160px] relative">
      <span className="text-xs text-gray-600 mb-1">تحكم في الكمية</span>
      <div className="flex gap-2">
        <button
          ref={btnRef}
          onClick={() => setOpen((v) => !v)}
          className="px-3 py-1 rounded-lg border border-black bg-white text-black font-bold text-sm focus:outline-none"
        >
          {item.quantity === 0.125 ? 'ثمن كيلو' : item.quantity === 0.25 ? 'ربع كيلو' : item.quantity === 0.5 ? 'نصف كيلو' : item.quantity === 1 ? 'كيلو' : `${item.quantity} كيلو`} <span className="ml-1">▼</span>
        </button>
      </div>
      {open && (
        <div className="absolute z-10 mt-2 w-36 bg-white border border-black rounded-lg shadow-lg flex flex-col">
          {options.map((qty, i) => (
            <div key={qty} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer">
              <button
                onClick={() => { updateQuantity(item.product.id, qty); setOpen(false); }}
                className={`w-full text-right font-bold text-black ${item.quantity === qty ? 'underline' : ''}`}
              >
                {labels[i]}
              </button>
              <div className="flex gap-1">
                <button onClick={() => { updateQuantity(item.product.id, Math.max(0.125, item.quantity - qty)); setOpen(false); }} className="px-1 py-0.5 rounded bg-black text-white text-xs font-bold">-</button>
                <button onClick={() => { updateQuantity(item.product.id, item.quantity + qty); setOpen(false); }} className="px-1 py-0.5 rounded bg-black text-white text-xs font-bold">+</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();

  const deliveryFee = getTotalPrice() >= 200 ? 0 : 20;
  const totalWithDelivery = getTotalPrice() + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">سلة التسوق فارغة</h2>
            <p className="text-gray-900 mb-8">لم تقم بإضافة أي منتجات إلى سلة التسوق بعد</p>
            <Link
              href="/"
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              تسوق الآن
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-green-600">الرئيسية</Link>
          <span>/</span>
          <span className="text-gray-900">سلة التسوق</span>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">
                  سلة التسوق ({getTotalItems()} {getTotalItems() === 1 ? 'منتج' : 'منتجات'})
                </h1>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-4 rtl:space-x-reverse border-b border-gray-200 pb-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={item.product.images[0] || '/placeholder-product.jpg'}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.product.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-800 font-semibold mt-1">{item.product.category}</p>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                          <span className="text-lg font-bold text-red-600">
                            {item.product.price} ج.م
                          </span>
                          {item.product.oldPrice && (
                            <span className="text-sm text-gray-900 line-through font-medium">
                              {item.product.oldPrice} ج.م
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Quantity Controls */}
                      {item.product.unitType === 'WEIGHT' ? (
                        <WeightDropdown item={item} updateQuantity={updateQuantity} />
                      ) : (
                        <div className="flex flex-col items-center min-w-[120px]">
                          <span className="text-xs text-gray-600 mb-1">تحكم في عدد القطع</span>
                          <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <button
                              onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                              className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-900 transition-colors text-white"
                              aria-label="نقص قطعة"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-lg text-black min-w-[2.5rem] text-center border border-black bg-white rounded px-2 py-1">
                              {item.quantity} قطعة
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-900 transition-colors text-white"
                              aria-label="زيادة قطعة"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Total Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {(item.product.price * item.quantity).toFixed(2)} ج.م
                        </p>
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">ملخص الطلب</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">المجموع الفرعي</span>
                    <span className="font-semibold">{getTotalPrice().toFixed(2)} ج.م</span>
                  </div>
                  {/* Delivery Fee */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">رسوم التوصيل</span>
                    <span className={`font-semibold ${deliveryFee === 0 ? 'text-red-600' : ''}`}>
                      {deliveryFee === 0 ? 'مجاني' : `${deliveryFee} ج.م`}
                    </span>
                  </div>
                  {/* Free Shipping Notice */}
                  {getTotalPrice() < 200 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800">
                        أضف منتجات بقيمة {(200 - getTotalPrice()).toFixed(2)} ج.م للحصول على توصيل مجاني
                      </p>
                    </div>
                  )}
                  <hr className="border-gray-200" />
                  {/* Total */}
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>المجموع الإجمالي</span>
                    <span>{totalWithDelivery.toFixed(2)} ج.م</span>
                  </div>
                </div>
                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse mt-6"
                >
                  <span>إتمام الطلب</span>
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </Link>
                {/* Continue Shopping */}
                <Link
                  href="/"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse mt-3"
                >
                  <span>متابعة التسوق</span>
                </Link>
              </div>
            </div>
            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm mt-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">طرق الدفع المتاحة</h3>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium">
                    💰 الدفع عند الاستلام
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  ادفع بشكل آمن عند استلام طلبك
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
