import { supabase } from '../supabase/client'
import type { ExpenseFormData } from '../schemas/expense.schema'
import type { Expense } from '../types/expenses'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expensesTable = () => supabase.from('expenses') as any

export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await expensesTable()
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data as Expense[]
}

export const getExpensesByEyeball = async (eyeballId: string): Promise<Expense[]> => {
  const { data, error } = await expensesTable()
    .select('*')
    .eq('eyeball_id', eyeballId)
    .order('date', { ascending: false })

  if (error) throw error
  return data as Expense[]
}

export const addExpense = async (data: ExpenseFormData) => {
  const { error } = await expensesTable()
    .insert({
      title:       data.title,
      amount:      data.amount,
      description: data.description || null,
      date:        data.date,
      eyeball_id:  data.eyeball_id  || null,
    })

  if (error) throw error
}

export const updateExpense = async (id: string, data: ExpenseFormData) => {
  const { error } = await expensesTable()
    .update({
      title:       data.title,
      amount:      data.amount,
      description: data.description || null,
      date:        data.date,
      eyeball_id:  data.eyeball_id  || null,
    })
    .eq('id', id)

  if (error) throw error
}

export const deleteExpense = async (id: string) => {
  const { error } = await expensesTable()
    .delete()
    .eq('id', id)

  if (error) throw error
}