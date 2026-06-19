import { useEffect, useRef, useState } from 'react'
import { searchItems } from '../services/mockApi'
import type { Item } from '../types'
import { useDebounce } from './useDebounce'

const DEBOUNCE_MS = 300

interface UseSearchResult {
  query: string
  setQuery: (value: string) => void
  results: Item[]
  isLoading: boolean
  error: string | null
}

export function useSearch(): UseSearchResult {
  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('q') ?? ''
  })
  const [results, setResults] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debouncedQuery = useDebounce(query, DEBOUNCE_MS)

  const latestRequestId = useRef(0)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [query])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const requestId = ++latestRequestId.current

      setIsLoading(true)
      setError(null)

      searchItems(query)
        .then((data) => {
          if (!isMountedRef.current) return
          if (requestId !== latestRequestId.current) return
          setResults(data)
        })
        .catch((err) => {
          if (!isMountedRef.current) return
          if (requestId !== latestRequestId.current) return
          setError(err instanceof Error ? err.message : 'Something went wrong')
          setResults([])
        })
        .finally(() => {
          if (!isMountedRef.current) return
          if (requestId === latestRequestId.current) {
            setIsLoading(false)
          }
        })
    }, DEBOUNCE_MS)

    return () => clearTimeout(debounceTimer)
  }, [query])

  return { query, setQuery, results, isLoading, error }
}
