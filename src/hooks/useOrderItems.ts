import { useState, useEffect, useCallback } from 'react'
import { getOrderItemsByBatch } from '../lib/orders'
import type { OrderItemWithDetails } from '../types/orders'

export const useOrderItems = (batchId: string, pricePerUnit: number) => {
  const [items, setItems]         = useState<OrderItemWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    if (!batchId) return
    try {
      setIsLoading(true)
      setError(null)
      const data = await getOrderItemsByBatch(batchId)
      setItems(data)
    } catch (err: any) {
      setError(err.message ?? 'Failed to load order items')
    } finally {
      setIsLoading(false)
    }
  }, [batchId, pricePerUnit])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const totalExpected  = items.reduce((s, i) => s + i.total_amount, 0)
  const totalCollected = items.reduce((s, i) => s + i.amount_paid,  0)
  const totalRemaining = items.reduce((s, i) => s + i.remaining,    0)
  const unpaidCount    = items.filter((i) => i.status === 'Unpaid').length
  const partialCount   = items.filter((i) => i.status === 'Partial').length
  const paidCount      = items.filter((i) => i.status === 'Paid').length

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
    totalExpected,
    totalCollected,
    totalRemaining,
    unpaidCount,
    partialCount,
    paidCount,
  }
}