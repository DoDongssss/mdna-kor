import type { Contribution } from '@/types/contributions'
import type { Expense }      from '@/types/expenses'

export function calcFundBalance(contributions: Contribution[], expenses: Expense[]) {
  const totalIn  = contributions.reduce((s, c) => s + Number(c.amount), 0)
  const totalOut = expenses.reduce((s, e) => s + Number(e.amount), 0)
  return { totalIn, totalOut, balance: totalIn - totalOut }
}