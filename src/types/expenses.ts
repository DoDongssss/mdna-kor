// import type { Database } from '@/supabase/types/database.types'
// export type Expense       = Database['public']['Tables']['expenses']['Row']
// export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
// export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

export interface Expense {
  id:          string
  title:       string
  amount:      number
  description: string | null
  date:        string
  eyeball_id:  string | null
  created_by:  string | null
  created_at:  string
}

export type ExpenseInsert = Omit<Expense, 'id' | 'created_by' | 'created_at'>
export type ExpenseUpdate = Partial<ExpenseInsert>