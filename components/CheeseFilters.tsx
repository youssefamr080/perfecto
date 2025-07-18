'use client'

import React, { useState } from 'react'
import { FunnelIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'

// أنواع الجبن المختلفة
const cheeseTypes = [
  { id: 'CHEDDAR', name: 'جبنة شيدر', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'ROMY', name: 'جبنة رومي', color: 'bg-orange-100 text-orange-800' },
  { id: 'KERRY', name: 'جبنة كيري', color: 'bg-blue-100 text-blue-800' },
  { id: 'CREAMY', name: 'جبنة كريمي', color: 'bg-green-100 text-green-800' },
  { id: 'BRAMILI', name: 'جبنة براميلي', color: 'bg-purple-100 text-purple-800' },
  { id: 'QAREESH', name: 'جبنة قريش', color: 'bg-gray-100 text-gray-800' },
  { id: 'FETA', name: 'جبنة فيتا', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'MOZZARELLA', name: 'جبنة موزاريلا', color: 'bg-pink-100 text-pink-800' },
  { id: 'WHITE_CHEESE', name: 'جبنة بيضاء', color: 'bg-slate-100 text-slate-800' },
  { id: 'PROCESSED', name: 'جبنة مطبوخة', color: 'bg-red-100 text-red-800' },
]

// فلاتر إضافية للجبن
const additionalFilters = [
  { id: 'price', name: 'السعر', options: [
    { id: 'under-50', name: 'أقل من 50 ج.م' },
    { id: '50-100', name: '50-100 ج.م' },
    { id: '100-200', name: '100-200 ج.م' },
    { id: 'over-200', name: 'أكثر من 200 ج.م' },
  ]},
  { id: 'brand', name: 'الماركة', options: [
    { id: 'domty', name: 'دومتي' },
    { id: 'juhayna', name: 'جهينة' },
    { id: 'almarai', name: 'المراعي' },
    { id: 'president', name: 'بريزيدنت' },
    { id: 'kiri', name: 'كيري' },
    { id: 'local', name: 'محلي' },
  ]},
]

interface CheeseFiltersProps {
  selectedTypes: string[]
  selectedFilters: Record<string, string[]>
  onTypesChange: (types: string[]) => void
  onFiltersChange: (filters: Record<string, string[]>) => void
  productsCount: number
  className?: string
}

const CheeseFilters: React.FC<CheeseFiltersProps> = ({
  selectedTypes,
  selectedFilters,
  onTypesChange,
  onFiltersChange,
  productsCount,
  className = ''
}) => {
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({})

  const toggleCheeseType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      onTypesChange(selectedTypes.filter(t => t !== typeId))
    } else {
      onTypesChange([...selectedTypes, typeId])
    }
  }

  const toggleFilter = (filterId: string, optionId: string) => {
    const currentSelected = selectedFilters[filterId] || []
    let newSelected: string[]
    
    if (currentSelected.includes(optionId)) {
      newSelected = currentSelected.filter(o => o !== optionId)
    } else {
      newSelected = [...currentSelected, optionId]
    }
    
    onFiltersChange({
      ...selectedFilters,
      [filterId]: newSelected
    })
  }

  const toggleFilterSection = (filterId: string) => {
    setOpenFilters(prev => ({
      ...prev,
      [filterId]: !prev[filterId]
    }))
  }

  const clearAllFilters = () => {
    onTypesChange([])
    onFiltersChange({})
  }

  const hasActiveFilters = selectedTypes.length > 0 || Object.values(selectedFilters).some(arr => arr.length > 0)

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <FunnelIcon className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            <h3 className="text-lg md:text-xl font-bold text-gray-900">فلاتر الجبن</h3>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-xs md:text-sm text-gray-600 bg-gray-100 px-2 md:px-3 py-1 rounded-full font-medium">
              {productsCount} منتج
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs md:text-sm text-red-600 hover:text-red-700 font-bold"
              >
                مسح الكل
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* أنواع الجبن */}
        <div>
          <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">أنواع الجبن</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 md:gap-3">
            {cheeseTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => toggleCheeseType(type.id)}
                className={`
                  relative p-3 md:p-4 rounded-xl border-2 transition-all duration-200 text-center min-h-[60px] md:min-h-[70px]
                  ${selectedTypes.includes(type.id)
                    ? 'border-red-500 bg-red-50 text-red-700 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:shadow-md'
                  }
                `}
              >
                <div className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-1 ${type.color}`}>
                  {type.name}
                </div>
                {selectedTypes.includes(type.id) && (
                  <CheckIcon className="absolute top-2 left-2 w-4 h-4 md:w-5 md:h-5 text-red-600 bg-white rounded-full p-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* فلاتر إضافية */}
        <div className="space-y-3 md:space-y-4">
          {additionalFilters.map((filter) => (
            <div key={filter.id} className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleFilterSection(filter.id)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-right hover:bg-gray-50 transition-all duration-200 min-h-[60px]"
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <span className="text-lg md:text-xl font-bold text-gray-900">{filter.name}</span>
                  {selectedFilters[filter.id]?.length > 0 && (
                    <span className="bg-red-500 text-white text-sm md:text-base px-3 py-1 rounded-full font-bold shadow-md">
                      {selectedFilters[filter.id].length}
                    </span>
                  )}
                </div>
                <ChevronDownIcon 
                  className={`w-5 h-5 md:w-6 md:h-6 text-gray-600 transition-transform duration-300 ${
                    openFilters[filter.id] ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {openFilters[filter.id] && (
                <div className="p-4 md:p-5 border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                  <div className="grid grid-cols-1 gap-3 md:gap-4">
                    {filter.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center space-x-4 rtl:space-x-reverse cursor-pointer hover:bg-white p-3 md:p-4 rounded-xl transition-all duration-200 border hover:border-red-200 min-h-[50px]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFilters[filter.id]?.includes(option.id) || false}
                          onChange={() => toggleFilter(filter.id, option.id)}
                          className="w-5 h-5 md:w-6 md:h-6 text-red-600 bg-gray-100 border-2 border-gray-300 rounded-lg focus:ring-red-500 focus:ring-2"
                        />
                        <span className="text-base md:text-lg text-gray-900 font-bold flex-1">{option.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* النتائج */}
        {hasActiveFilters && (
          <div className="bg-red-50 rounded-lg p-3 md:p-4">
            <h5 className="text-base md:text-lg font-bold text-red-800 mb-2">الفلاتر النشطة:</h5>
            <div className="flex flex-wrap gap-2">
              {selectedTypes.map((typeId) => {
                const type = cheeseTypes.find(t => t.id === typeId)
                return type ? (
                  <span
                    key={typeId}
                    className="inline-flex items-center bg-red-100 text-red-800 text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded-full"
                  >
                    {type.name}
                    <button
                      onClick={() => toggleCheeseType(typeId)}
                      className="mr-1 md:mr-2 text-red-600 hover:text-red-800 text-sm md:text-base"
                    >
                      ×
                    </button>
                  </span>
                ) : null
              })}
              {Object.entries(selectedFilters).map(([filterId, options]) =>
                options.map((optionId) => {
                  const filter = additionalFilters.find(f => f.id === filterId)
                  const option = filter?.options.find(o => o.id === optionId)
                  return filter && option ? (
                    <span
                      key={`${filterId}-${optionId}`}
                      className="inline-flex items-center bg-blue-100 text-blue-800 text-xs md:text-sm font-bold px-2 md:px-3 py-1 rounded-full"
                    >
                      {option.name}
                      <button
                        onClick={() => toggleFilter(filterId, optionId)}
                        className="mr-1 md:mr-2 text-blue-600 hover:text-blue-800 text-sm md:text-base"
                      >
                        ×
                      </button>
                    </span>
                  ) : null
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheeseFilters
