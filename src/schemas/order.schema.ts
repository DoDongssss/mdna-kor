import { z } from 'zod'

export const orderBatchSchema = z.object({
  name:           z.string().min(2, 'Name is required').max(100, 'Too long'),
  description:    z.string().max(300, 'Too long').optional(),
  item_type:      z.enum(['Jersey', 'T-shirt', 'Cap', 'Sticker', 'Other']),
  price_per_unit: z.number().min(1, 'Price must be greater than 0'),
  deadline:       z.string().optional(),
})

export const orderItemSchema = z.object({
  member_id: z.string().min(1, 'Member is required'),
  quantity:  z.number().min(1, 'Quantity must be at least 1'),
  notes:     z.string().max(300, 'Too long').optional(),
})

export const orderPaymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  notes:  z.string().max(300, 'Too long').optional(),
})

export type OrderBatchFormData   = z.infer<typeof orderBatchSchema>
export type OrderItemFormData    = z.infer<typeof orderItemSchema>
export type OrderPaymentFormData = z.infer<typeof orderPaymentSchema>