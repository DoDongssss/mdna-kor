import { useState, useEffect, useCallback } from 'react'
import { getEyeballs } from '../lib/eyeballs'
import type { EyeballSummary } from '../types/eyeballs'

export const useEyeballs = () => {
  const [eyeballs, setEyeballs]   = useState<EyeballSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const fetchEyeballs = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getEyeballs()
      setEyeballs(data as EyeballSummary[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message ?? 'Failed to load eyeballs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEyeballs()
  }, [fetchEyeballs])

  return { eyeballs, isLoading, error, refetch: fetchEyeballs }
}