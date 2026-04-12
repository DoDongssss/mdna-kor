import { supabase } from '../supabase/client'
import type { EyeballFormData } from '../schemas/eyeball.schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eyeballsTable = () => supabase.from('eyeballs') as any

export const getEyeballs = async () => {
  const { data, error } = await supabase
    .from('eyeball_summary')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export const getEyeballById = async (id: string) => {
  const { data, error } = await eyeballsTable()
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const createEyeball = async (data: EyeballFormData) => {
  const { error } = await eyeballsTable()
    .insert({
      title:    data.title    || null,
      date:     data.date,
      location: data.location,
      notes:    data.notes    || null,
    })

  if (error) throw error
}

export const updateEyeball = async (id: string, data: EyeballFormData) => {
  const { error } = await eyeballsTable()
    .update({
      title:    data.title    || null,
      date:     data.date,
      location: data.location,
      notes:    data.notes    || null,
    })
    .eq('id', id)

  if (error) throw error
}

export const deleteEyeball = async (id: string) => {
  const { error } = await eyeballsTable()
    .delete()
    .eq('id', id)

  if (error) throw error
}