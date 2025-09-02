/**
 * مكون محسن لعرض الصور مع كاش ذكي
 * Smart Image Component with Intelligent Caching
 */

"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface SmartImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export function SmartImage({
  src,
  alt,
  width,
  height,
  className = "",
  fill = false,
  priority = false,
  sizes,
  quality = 85,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError
}: SmartImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)
  const imageRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver>()

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (priority) return // Skip lazy loading for priority images

    const imageElement = imageRef.current
    if (!imageElement) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src)
            observerRef.current?.unobserve(imageElement)
          }
        })
      },
      {
        rootMargin: "50px"
      }
    )

    observerRef.current.observe(imageElement)

    return () => {
      observerRef.current?.disconnect()
    }
  }, [src, priority])

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  // Handle image error
  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    // Try fallback image
    const fallbackSrc = `/placeholder.svg?height=${height || 300}&width=${width || 300}&text=${encodeURIComponent(alt)}`
    setImageSrc(fallbackSrc)
    onError?.()
  }

  // Generate blur placeholder
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, 0, w, h)
    }
    return canvas.toDataURL()
  }

  const blurData = blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined)

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imageRef}>
      {/* Loading state */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Main image */}
      <Image
        src={priority ? src : imageSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurData}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        style={{
          objectFit: "cover",
          objectPosition: "center"
        }}
      />
    </div>
  )
}
