import { useState, useEffect, useCallback } from 'react'
import { getExpenses } from '../lib/expenses'
import type { Expense } from '../types/expenses'

export const useExpenses = () => {
  const [expenses, setExpenses]   = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getExpenses()
      setExpenses(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message ?? 'Failed to load expenses')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const total = expenses.reduce(
    (sum: number, e: Expense) => sum + e.amount, 0
  )

  return { expenses, isLoading, error, total, refetch: fetchExpenses }
}