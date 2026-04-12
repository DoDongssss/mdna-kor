import { supabase } from '../supabase/client'
import type { MemberFormData } from '../schemas/member.schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const membersTable = () => supabase.from('members') as any

export const getMembers = async () => {
  const { data, error } = await membersTable()
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const getMembersIncludeInactive = async () => {
  const { data, error } = await membersTable()
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export const createMember = async (data: MemberFormData) => {
  const { error } = await membersTable()
    .insert({
      name:           data.name,
      nickname:       data.nickname       || null,
      contact_number: data.contact_number || null,
      is_active:      data.is_active,
    })

  if (error) throw error
}

export const updateMember = async (id: string, data: MemberFormData) => {
  const { error } = await membersTable()
    .update({
      name:           data.name,
      nickname:       data.nickname       || null,
      contact_number: data.contact_number || null,
      is_active:      data.is_active,
    })
    .eq('id', id)

  if (error) throw error
}

export const toggleActive = async (id: string, currentStatus: boolean) => {
  const { error } = await membersTable()
    .update({ is_active: !currentStatus })
    .eq('id', id)

  if (error) throw error
}

export const softDeleteMember = async (id: string) => {
  const { error } = await membersTable()
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}