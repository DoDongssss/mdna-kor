import { useState, useEffect, useCallback } from 'react'
import { getContributions } from '../lib/contributions'
import type { ContributionWithMember } from '../types/contributions'

export const useContributions = () => {
  const [contributions, setContributions] = useState<ContributionWithMember[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [error, setError]                 = useState<string | null>(null)

  const fetchContributions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getContributions()
      setContributions(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message ?? 'Failed to load contributions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContributions()
  }, [fetchContributions])

  const total = contributions.reduce(
    (sum: number, c: ContributionWithMember) => sum + c.amount, 0
  )

  return {
    contributions,
    isLoading,
    error,
    total,
    refetch: fetchContributions,
  }
}