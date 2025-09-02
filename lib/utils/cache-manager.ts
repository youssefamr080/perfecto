/**
 * مدير التخزين المؤقت المحسن للصور والبيانات
 * Cache Manager for Images and Data
 */

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>()
  private readonly DEFAULT_CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
  private readonly IMAGE_CACHE_DURATION = 60 * 60 * 1000 // 1 hour
  private readonly LONG_CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 hours

  /**
   * حفظ البيانات في الكاش
   */
  set<T>(key: string, data: T, duration?: number): void {
    const expiresAt = Date.now() + (duration || this.DEFAULT_CACHE_DURATION)
    
    // Memory cache
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt
    })

    // LocalStorage cache (for persistence)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify({
          data,
          timestamp: Date.now(),
          expiresAt
        }))
      } catch (error) {
        console.warn('Failed to save to localStorage:', error)
      }
    }
  }

  /**
   * استرجاع البيانات من الكاش
   */
  get<T>(key: string): T | null {
    const now = Date.now()

    // Check memory cache first
    const memoryItem = this.memoryCache.get(key)
    if (memoryItem && now < memoryItem.expiresAt) {
      return memoryItem.data
    }

    // Check localStorage cache
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`cache_${key}`)
        if (stored) {
          const item: CacheItem<T> = JSON.parse(stored)
          if (now < item.expiresAt) {
            // Restore to memory cache
            this.memoryCache.set(key, item)
            return item.data
          } else {
            // Remove expired item
            localStorage.removeItem(`cache_${key}`)
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error)
      }
    }

    return null
  }

  /**
   * التحقق من وجود البيانات في الكاش
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * حذف عنصر من الكاش
   */
  delete(key: string): void {
    this.memoryCache.delete(key)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache_${key}`)
    }
  }

  /**
   * مسح كامل للكاش
   */
  clear(): void {
    this.memoryCache.clear()
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
      keys.forEach(key => localStorage.removeItem(key))
    }
  }

  /**
   * مسح الكاش المنتهي الصلاحية
   */
  cleanup(): void {
    const now = Date.now()
    
    // Clean memory cache
    for (const [key, item] of this.memoryCache.entries()) {
      if (now >= item.expiresAt) {
        this.memoryCache.delete(key)
      }
    }

    // Clean localStorage cache
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
      keys.forEach(key => {
        try {
          const stored = localStorage.getItem(key)
          if (stored) {
            const item = JSON.parse(stored)
            if (now >= item.expiresAt) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  /**
   * حفظ الصور في الكاش مع مدة أطول
   */
  setImage(url: string, blob: Blob): void {
    if (typeof window !== 'undefined' && 'caches' in window) {
      caches.open('images-cache').then(cache => {
        const response = new Response(blob)
        cache.put(url, response)
      }).catch(error => {
        console.warn('Failed to cache image:', error)
      })
    }
  }

  /**
   * استرجاع الصور من الكاش
   */
  async getImage(url: string): Promise<string | null> {
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cache = await caches.open('images-cache')
        const response = await cache.match(url)
        if (response) {
          const blob = await response.blob()
          return URL.createObjectURL(blob)
        }
      } catch (error) {
        console.warn('Failed to get cached image:', error)
      }
    }
    return null
  }

  /**
   * خاصيات الكاش للأنواع المختلفة من البيانات
   */
  static readonly DURATIONS = {
    SHORT: 5 * 60 * 1000,      // 5 minutes
    MEDIUM: 30 * 60 * 1000,    // 30 minutes  
    LONG: 2 * 60 * 60 * 1000,  // 2 hours
    IMAGES: 24 * 60 * 60 * 1000 // 24 hours
  }
}

export const cacheManager = new CacheManager()

// تشغيل عملية التنظيف كل 30 دقيقة
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheManager.cleanup()
  }, 30 * 60 * 1000)
}
