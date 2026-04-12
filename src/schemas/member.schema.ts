import { z } from 'zod'

export const memberSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  nickname: z.string().max(50, 'Nickname is too long').optional().or(z.literal('')),
  contact_number: z.string().max(20, 'Contact number is too long').optional().or(z.literal('')),
  is_active: z.boolean(), 
})

export type MemberFormData = z.infer<typeof memberSchema>