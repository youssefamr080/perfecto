'use client'

import React from 'react'
import Link from 'next/link'
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid'

interface SliderControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  currentSlide: number
  totalSlides: number
}

const SliderControls: React.FC<SliderControlsProps> = ({
  isPlaying,
  onPlayPause,
  currentSlide,
  totalSlides
}) => {
  return (
    <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-20">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* Play/Pause Button */}
        <button
          onClick={onPlayPause}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-2 md:p-3 transition-all duration-200 hover:scale-110"
          aria-label={isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل تلقائي'}
        >
          {isPlaying ? (
            <PauseIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
          ) : (
            <PlayIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
          )}
        </button>

        {/* Slide Counter */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-3 md:px-4 py-2 md:py-3">
          <span className="text-white text-sm md:text-base font-bold">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>
      </div>
    </div>
  )
}

interface QuickLinksProps {
  className?: string
}

const QuickLinks: React.FC<QuickLinksProps> = ({ className = '' }) => {
  const quickLinks = [
    { name: 'جبن', href: '/category/cheese', icon: '🧀', color: 'bg-yellow-500' },
    { name: 'لانشون', href: '/category/luncheon', icon: '🍖', color: 'bg-red-500' },
    { name: 'عسل', href: '/category/honey', icon: '🍯', color: 'bg-amber-500' },
    { name: 'زبادي', href: '/category/yogurt', icon: '🥛', color: 'bg-blue-500' },
    { name: 'كفتة', href: '/category/kofta', icon: '🥩', color: 'bg-red-600' },
    { name: 'بيض', href: '/category/eggs', icon: '🥚', color: 'bg-orange-500' }
  ]

  return (
    <div className={`bg-white shadow-lg border-t-4 border-red-500 ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <h3 className="text-center text-lg md:text-xl font-bold text-gray-900 mb-4">
          تسوق سريع - الأقسام الشائعة
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="group flex flex-col items-center p-3 md:p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 ${link.color} rounded-full flex items-center justify-center mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-200 shadow-lg`}>
                <span className="text-2xl md:text-3xl">{link.icon}</span>
              </div>
              <span className="text-xs md:text-sm font-bold text-gray-900 text-center group-hover:text-red-600 transition-colors duration-200">
                {link.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export { SliderControls, QuickLinks }
