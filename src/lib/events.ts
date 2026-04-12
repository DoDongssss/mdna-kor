import { supabase } from '../supabase/client'
import type { ClubEvent } from '../types/events'
import type { EventFormData } from '../schemas/event.schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventsTable = () => supabase.from('events') as any

export const getEvents = async (): Promise<ClubEvent[]> => {
  const { data, error } = await eventsTable()
    .select('*')
    .order('date', { ascending: true })

  if (error) throw error
  return data as ClubEvent[]
}

export const getUpcomingEvents = async (): Promise<ClubEvent[]> => {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await eventsTable()
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })

  if (error) throw error
  return data as ClubEvent[]
}

export const getPastEvents = async (): Promise<ClubEvent[]> => {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await eventsTable()
    .select('*')
    .lt('date', today)
    .order('date', { ascending: false })

  if (error) throw error
  return data as ClubEvent[]
}

export const createEvent = async (data: EventFormData) => {
  const { error } = await eventsTable()
    .insert({
      title:       data.title,
      type:        data.type,
      date:        data.date,
      description: data.description || null,
      location:    data.location    || null,
    })

  if (error) throw error
}

export const updateEvent = async (id: string, data: EventFormData) => {
  const { error } = await eventsTable()
    .update({
      title:       data.title,
      type:        data.type,
      date:        data.date,
      description: data.description || null,
      location:    data.location    || null,
    })
    .eq('id', id)

  if (error) throw error
}

export const deleteEvent = async (id: string) => {
  const { error } = await eventsTable()
    .delete()
    .eq('id', id)

  if (error) throw error
}