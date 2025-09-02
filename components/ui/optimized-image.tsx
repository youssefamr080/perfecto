"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { cacheManager } from "@/lib/utils/cache-manager"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  placeholder?: "blur" | "empty"
  blurDataURL?: string
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  fill = false,
  priority = false,
  sizes,
  placeholder = "empty",
  blurDataURL
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [cachedSrc, setCachedSrc] = useState<string>(src)

  // محاولة استرجاع الصورة من الكاش
  useEffect(() => {
    const loadCachedImage = async () => {
      if (!src.startsWith('http')) {
        setCachedSrc(src)
        return
      }

      try {
        const cached = await cacheManager.getImage(src)
        if (cached) {
          setCachedSrc(cached)
        } else {
          setCachedSrc(src)
        }
      } catch (error) {
        console.warn('Failed to load cached image:', error)
        setCachedSrc(src)
      }
    }

    loadCachedImage()
  }, [src])

  // حفظ الصورة في الكاش بعد التحميل
  const handleImageLoad = async () => {
    setIsLoading(false)
    
    // حفظ الصورة في الكاش إذا كانت من رابط خارجي
    if (src.startsWith('http')) {
      try {
        const response = await fetch(src)
        if (response.ok) {
          const blob = await response.blob()
          cacheManager.setImage(src, blob)
        }
      } catch (error) {
        console.warn('Failed to cache image:', error)
      }
    }
  }

  const handleImageError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  // Default placeholder for missing images
  const fallbackSrc = `/placeholder.svg?height=${height || 400}&width=${width || 400}&text=${encodeURIComponent(alt)}`

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <Image
        src={imageError ? fallbackSrc : cachedSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        quality={85}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  )
}
