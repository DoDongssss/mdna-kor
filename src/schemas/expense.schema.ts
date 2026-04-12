import { z } from 'zod'

export const expenseSchema = z.object({
  title:       z.string().min(2, 'Title is required').max(100, 'Title is too long'),
  amount:      z.number().min(1, 'Amount must be greater than 0'),
  description: z.string().max(500, 'Description is too long').optional(),
  date:        z.string().min(1, 'Date is required'),
  eyeball_id:  z.string().nullable().optional(),
})

export type ExpenseFormData = z.infer<typeof expenseSchema>