import { z } from 'zod'

export const contributionSchema = z.object({
  member_id:      z.string().min(1, 'Member is required'),
  eyeball_id:     z.string().nullable().optional(),
  amount:         z.number().min(0, 'Amount must be 0 or more'),
  notes:          z.string().max(300, 'Notes too long').optional(),
  payment_method: z.string().max(50, 'Too long').optional(),
})

export type ContributionFormData = z.infer<typeof contributionSchema>