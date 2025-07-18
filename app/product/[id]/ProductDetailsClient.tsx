'use client'

import React, { useState } from 'react'
import { Plus, Minus, ShoppingCart, Heart, Share2 } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  oldPrice?: number | null
  images: string[]
  unitType: 'WEIGHT' | 'PIECE'
  isAvailable: boolean
  category: string
}

interface ProductDetailsClientProps {
  product: Product
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedWeight, setSelectedWeight] = useState(0.5)
  const { addItem } = useCart()

  const weights = [0.125, 0.25, 0.5, 1] // في الكيلوجرام
  const weightLabels: { [key: number]: string } = {
    0.125: 'تمن كيلو',
    0.25: 'ربع كيلو', 
    0.5: 'نصف كيلو',
    1: 'كيلو'
  }

  // معرفة نوع المنتج لعرض الخيارات المناسبة
  const getProductOptions = () => {
    // منتجات الزبادي
    if (product.name.includes('زبادي')) {
      return { type: 'yogurt', label: 'الكمية', unit: 'علبة' }
    }
    
    // منتجات البيض
    if (product.category === 'EGGS') {
      if (product.name.includes('كرتونة كاملة')) {
        return { type: 'eggs_full', label: 'الكمية', unit: 'كرتونة كاملة' }
      }
      if (product.name.includes('نصف كرتونة')) {
        return { type: 'eggs_half', label: 'الكمية', unit: 'نصف كرتونة' }
      }
      if (product.name.includes('ثلث كرتونة')) {
        return { type: 'eggs_third', label: 'الكمية', unit: 'ثلث كرتونة' }
      }
    }
    
    // جميع المنتجات بالوزن (الكيلو)
    if (product.unitType === 'WEIGHT') {
      return { type: 'weight', label: 'اختر الوزن المطلوب', unit: 'كيلو' }
    }
    
    // منتجات أخرى بالقطعة
    return { type: 'piece', label: 'الكمية', unit: 'قطعة' }
  }

  const productOptions = getProductOptions()

  const handleAddToCart = () => {
    if (!product.isAvailable) return
    
    const finalQuantity = productOptions.type === 'weight' ? selectedWeight : quantity
    addItem(product, finalQuantity)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || product.name,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('تم نسخ رابط المنتج')
      } catch (error) {
        console.log('Error copying to clipboard:', error)
      }
    }
  }

  return (
    <div className="space-y-6 border-t pt-6">
      {/* Quantity/Weight Selection */}
      {productOptions.type === 'weight' ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{productOptions.label}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weights.map((weight) => (
              <button
                key={weight}
                onClick={() => setSelectedWeight(weight)}
                className={`p-4 text-center border-2 rounded-xl transition-all duration-200 ${
                  selectedWeight === weight
                    ? 'border-red-500 bg-red-50 text-red-700 shadow-md transform scale-105'
                    : 'border-gray-300 hover:border-red-300 hover:bg-red-25'
                }`}
              >
                <div className="font-bold text-lg">{weightLabels[weight]}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {(product.price * weight).toFixed(2)} ج.م
                </div>
                {selectedWeight === weight && (
                  <div className="text-xs text-red-600 mt-1 font-medium">مختار</div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">
              الوزن المختار: <span className="font-bold">{weightLabels[selectedWeight]}</span> 
              {' '}بسعر <span className="font-bold">{(product.price * selectedWeight).toFixed(2)} ج.م</span>
            </p>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{productOptions.label}</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= 1}
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="px-6 py-3 font-bold text-lg min-w-[60px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-red-600">
                المجموع: {(product.price * quantity).toFixed(2)} ج.م
              </div>
              <div className="text-sm text-gray-600">
                {quantity} {productOptions.unit} × {product.price.toFixed(2)} ج.م
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleAddToCart}
          disabled={!product.isAvailable}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            product.isAvailable
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {product.isAvailable ? 'أضف للسلة' : 'غير متوفر'}
        </button>
        
        <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <Heart className="w-5 h-5" />
          المفضلة
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          مشاركة
        </button>
      </div>

      {/* Delivery Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">معلومات التوصيل</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• توصيل مجاني للطلبات أكثر من 300 ج.م</li>
          <li>• توصيل خلال 30-60 دقيقة</li>
          <li>• إمكانية الدفع عند الاستلام</li>
          <li>• ضمان الجودة والطازجة</li>
        </ul>
      </div>
    </div>
  )
}
