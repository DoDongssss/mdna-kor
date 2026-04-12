import { create } from 'zustand'
import { getContributions } from '../lib/contributions'
import { getExpenses } from '../lib/expenses'

interface FundState {
  totalContributions: number
  totalExpenses:      number
  netBalance:         number
  isLoading:          boolean
  fetch:              () => Promise<void>
}

export const useFundStore = create<FundState>((set) => ({
  totalContributions: 0,
  totalExpenses:      0,
  netBalance:         0,
  isLoading:          true,

  fetch: async () => {
    try {
      set({ isLoading: true })
      const [contributions, expenses] = await Promise.all([
        getContributions(),
        getExpenses(),
      ])

      const totalContributions = contributions.reduce(
        (sum, c) => sum + c.amount, 0
      )
      const totalExpenses = expenses.reduce(
        (sum, e) => sum + e.amount, 0
      )

      set({
        totalContributions,
        totalExpenses,
        netBalance: totalContributions - totalExpenses,
        isLoading:  false,
      })
    } catch (err) {
        console.log(err)
      set({ isLoading: false })
    }
  },
}))