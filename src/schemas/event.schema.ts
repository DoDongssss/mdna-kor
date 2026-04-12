import { z } from 'zod'

export const eventSchema = z.object({
  title:       z.string().min(2, 'Title is required').max(100, 'Title is too long'),
  type:        z.enum(['meetup', 'charity_ride', 'announcement', 'other']),
  date:        z.string().min(1, 'Date is required'),
  description: z.string().max(500, 'Description is too long').optional(),
  location:    z.string().max(200, 'Location is too long').optional(),
})

export type EventFormData = z.infer<typeof eventSchema>