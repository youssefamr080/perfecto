import { useState, useEffect, useCallback } from "react"

interface UseInfiniteScrollProps<T> {
  fetchData: (page: number, limit: number) => Promise<T[]>
  limit?: number
  initialData?: T[]
}

export function useInfiniteScroll<T>({
  fetchData,
  limit = 20,
  initialData = []
}: UseInfiniteScrollProps<T>) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const newItems = await fetchData(page, limit)
      
      if (newItems.length < limit) {
        setHasMore(false)
      }

      setData(prev => [...prev, ...newItems])
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [fetchData, page, limit, loading, hasMore])

  const reset = useCallback(() => {
    setData(initialData)
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [initialData])

  useEffect(() => {
    if (data.length === 0 && hasMore) {
      loadMore()
    }
  }, [])

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset
  }
}
