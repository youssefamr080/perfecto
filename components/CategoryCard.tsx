'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    icon: string | null;
    slug: string;
    image?: string | null;
    productsCount?: number;
  };
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-300 hover:scale-105"
    >
      <div className="relative h-28 sm:h-32 md:h-40 w-full overflow-hidden">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            onError={(e) => {
              // Fallback to gradient with icon if image fails
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center">
            <span className="text-4xl sm:text-5xl md:text-6xl animate-bounce">{category.icon ?? ''}</span>
          </div>
        )}
        
        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/60 transition-all duration-300" />
        
        {/* Category name overlay on mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:hidden">
          <h3 className="font-bold text-sm text-white text-center drop-shadow-lg">
            {category.name}
          </h3>
          {category.productsCount && (
            <p className="text-xs text-white/90 text-center mt-1">
              {category.productsCount} منتج
            </p>
          )}
        </div>
      </div>
      
      {/* Category info - hidden on mobile, shown on larger screens */}
      <div className="p-4 sm:p-5 hidden sm:block">
        <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-red-600 transition-colors text-center mb-2">
          {category.name}
        </h3>
        {category.productsCount && (
          <p className="text-sm md:text-base text-gray-500 text-center font-medium">
            {category.productsCount} منتج متاح
          </p>
        )}
      </div>
    </Link>
  )
}

export default CategoryCard
