'use client'

import React from 'react'

// أنواع الجبن المختلفة (مختصرة)
const cheeseTypes = [
  { id: 'ALL', name: 'الكل', color: 'bg-gray-100 text-gray-800' },
  { id: 'CHEDDAR', name: 'شيدر', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'ROMY', name: 'رومي', color: 'bg-orange-100 text-orange-800' },
  { id: 'KERRY', name: 'كيري', color: 'bg-blue-100 text-blue-800' },
  { id: 'CREAMY', name: 'كريمي', color: 'bg-green-100 text-green-800' },
  { id: 'BRAMILI', name: 'براميلي', color: 'bg-purple-100 text-purple-800' },
  { id: 'QAREESH', name: 'قريش', color: 'bg-gray-100 text-gray-800' },
  { id: 'FETA', name: 'فيتا', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'MOZZARELLA', name: 'موزاريلا', color: 'bg-pink-100 text-pink-800' },
  { id: 'WHITE_CHEESE', name: 'بيضاء', color: 'bg-slate-100 text-slate-800' },
  { id: 'PROCESSED', name: 'مطبوخة', color: 'bg-red-100 text-red-800' },
]

interface SimpleCheeseFilterProps {
  selectedType: string
  onTypeChange: (type: string) => void
  productsCount: number
  className?: string
}

const SimpleCheeseFilter: React.FC<SimpleCheeseFilterProps> = ({
  selectedType,
  onTypeChange,
  productsCount,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-black">أنواع الجبن</h3>
        <span className="text-sm font-medium text-gray-600">{productsCount} منتج</span>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 md:gap-3">
        {cheeseTypes.map((type) => {
          const isSelected = selectedType === type.id || (selectedType === '' && type.id === 'ALL')
          
          return (
            <button
              key={type.id}
              onClick={() => onTypeChange(type.id === 'ALL' ? '' : type.id)}
              className={`
                px-3 py-2 md:px-4 md:py-2 rounded-full font-bold text-sm md:text-base
                transition-all duration-200 border-2
                ${isSelected 
                  ? 'bg-red-600 text-white border-red-600 shadow-md' 
                  : 'bg-gray-50 text-black border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }
              `}
            >
              {type.name}
            </button>
          )
        })}
      </div>

      {/* Clear Filter */}
      {selectedType && selectedType !== 'ALL' && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            onClick={() => onTypeChange('')}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            مسح الفلتر
          </button>
        </div>
      )}
    </div>
  )
}

export default SimpleCheeseFilter
