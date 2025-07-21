import { useState, useEffect } from 'react'
import { Product } from '@prisma/client';

interface SearchResult {
  products: Product[]
  total: number
}

export const useLiveSearch = (query: string, limit: number = 5) => {
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [lastQuery, setLastQuery] = useState('')

  useEffect(() => {
    const trimmedQuery = query.trim()
    
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setResults([])
      setTotal(0)
      setLoading(false)
      setLastQuery('')
      return
    }

    // منع البحث المتكرر للنص نفسه
    if (trimmedQuery === lastQuery) {
      return
    }

    let isCancelled = false

    const searchTimeout = setTimeout(async () => {
      if (isCancelled || trimmedQuery === lastQuery) return
      
      setLoading(true)
      setLastQuery(trimmedQuery)
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedQuery)}&limit=${limit}`,
          {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
            }
          }
        )
        
        clearTimeout(timeoutId)

        if (!isCancelled && response.ok) {
          const data: SearchResult = await response.json()
          setResults(data.products || [])
          setTotal(data.total || 0)
        } else if (!isCancelled) {
          setResults([])
          setTotal(0)
        }
      } catch (error) {
        if (!isCancelled && error instanceof Error && error.name !== 'AbortError') {
          console.error('Search error:', error)
          setResults([])
          setTotal(0)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }, 400) // زيادة التأخير أكثر

    return () => {
      isCancelled = true
      clearTimeout(searchTimeout)
    }
  }, [query, limit, lastQuery])

  return { results, loading, total }
}
