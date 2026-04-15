import { useState, useEffect, useCallback } from 'react'
import { getOrderBatches } from '../lib/orders'
import type { OrderBatch } from '../types/orders'

export const useOrderBatches = () => {
  const [batches, setBatches]     = useState<OrderBatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const fetchBatches = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getOrderBatches()
      setBatches(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message ?? 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [])
  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  return { batches, isLoading, error, refetch: fetchBatches }
}