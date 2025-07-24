'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { AppProduct } from '@/types'; // <-- 1. استخدام النوع الموحد والصحيح

interface ProductCardProps {
  product: AppProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState(0.25)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const { addItem } = useCart()

  const weights = [0.125, 0.25, 0.5, 1]
  const weightLabels: { [key: number]: string } = {
    0.125: 'تمن كيلو',
    0.25: 'ربع كيلو',
    0.5: 'نصف كيلو',
    1: 'كيلو'
  }

  const handleAddToCart = () => {
    const finalQuantity = product.unitType === 'WEIGHT' ? selectedWeight : quantity;
    // addItem يتوقع الآن النوع Product الموحد، لذلك لا حاجة للتحويل
    addItem(product, finalQuantity);

    if (product.unitType === 'WEIGHT') {
      setSelectedWeight(0.25)
    }
    setShowSuccessMessage(true)
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 2000)
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const discountPercentage = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0

  const getUnitLabel = () => {
    if (product.unitType === 'WEIGHT') {
      return 'للكيلو'
    }
    // 2. استخدام category.name بدلاً من category.slug للتحقق
    if (product.category?.name === 'يوجورت') {
      return 'للعلبة'
    }
    if (product.category?.name === 'بيض') {
      if (product.name.includes('كرتونة كاملة')) return 'للكرتونة'
      if (product.name.includes('نصف كرتونة')) return 'للنصف'
      if (product.name.includes('ثلث كرتونة')) return 'للثلث'
      return 'للكرتونة'
    }
    return 'للقطعة'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 hover:border-red-200">
      <div className="relative">
        {/* 3. استخدام slug للمنتج للرابط */}
        <Link href={`/product/${product.slug}`}>
          <div className="relative h-40 sm:h-48 w-full">
            <Image
              // 4. وصول آمن للصور
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
        
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
            خصم {discountPercentage}%
          </div>
        )}

        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold bg-red-600 px-4 py-2 rounded-lg shadow-lg">
              غير متوفر
            </span>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold text-sm sm:text-base text-gray-900 hover:text-red-600 transition-colors line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
          <span className="text-base sm:text-lg font-bold text-red-600">
            {product.price} ج.م
          </span>
          {product.oldPrice && (
            <span className="text-xs sm:text-sm text-gray-900 line-through font-medium">
              {product.oldPrice} ج.م
            </span>
          )}
        </div>
        <div className="text-xs text-gray-900 font-medium mb-3">
          {getUnitLabel()}
        </div>

        {product.isAvailable && (
          <div className="mb-4">
            {product.unitType === 'WEIGHT' ? (
              <div>
                <p className="text-xs sm:text-sm text-gray-900 mb-2 font-bold">اختر الوزن:</p>
                <div className="grid grid-cols-2 gap-2">
                  {weights.map((weight) => (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={`px-2 py-2 text-xs sm:text-sm rounded-lg border transition-all duration-200 font-bold ${
                        selectedWeight === weight
                          ? 'bg-red-600 text-white border-red-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-red-600'
                      }`}
                    >
                      {weightLabels[weight]}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs sm:text-sm text-gray-900 mb-2 font-bold">الكمية:</p>
                <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all duration-200 border border-gray-300"
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <span className="font-bold text-lg sm:text-xl w-10 text-center text-gray-900">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all duration-200 border border-gray-300"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showSuccessMessage && (
          <div className="text-center py-2 text-green-600 font-bold bg-green-100 rounded-lg mb-2">
            تمت الإضافة بنجاح!
          </div>
        )}
        <button
          onClick={handleAddToCart}
          disabled={!product.isAvailable}
          className={`w-full py-3 px-4 rounded-xl flex items-center justify-center space-x-2 rtl:space-x-reverse transition-all duration-200 font-bold text-sm sm:text-base shadow-sm ${
            product.isAvailable
              ? 'bg-red-600 hover:bg-red-700 text-white hover:shadow-md'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{product.isAvailable ? 'أضف للسلة' : 'غير متوفر'}</span>
        </button>
      </div>
    </div>
  )
}

export default ProductCard
