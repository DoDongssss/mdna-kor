import { z } from 'zod'

export const eyeballSchema = z.object({
  title:    z.string().max(100, 'Title is too long').optional().or(z.literal('')),
  date:     z.string().min(1, 'Date is required'),
  location: z.string().min(2, 'Location is required').max(200, 'Location is too long'),
  notes:    z.string().max(500, 'Notes is too long').optional().or(z.literal('')),
})

export type EyeballFormData = z.infer<typeof eyeballSchema>