import { supabase } from '../supabase/client'
import type { ContributionWithMember } from '../types/contributions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const contributionsTable = () => supabase.from('contributions') as any

export const getContributions = async (): Promise<ContributionWithMember[]> => {
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      id,
      member_id,
      eyeball_id,
      amount,
      notes,
      payment_method,
      created_at,
      members(name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row) => ({
    id:             row.id,
    member_id:      row.member_id,
    member_name:    row.members?.name ?? 'Unknown',
    eyeball_id:     row.eyeball_id,
    amount:         row.amount,
    notes:          row.notes,
    payment_method: row.payment_method,
    created_at:     row.created_at,
  }))
}

export const getContributionsByEyeball = async (
  eyeballId: string
): Promise<ContributionWithMember[]> => {
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      id,
      member_id,
      eyeball_id,
      amount,
      notes,
      payment_method,
      created_at,
      members(name)
    `)
    .eq('eyeball_id', eyeballId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row) => ({
    id:             row.id,
    member_id:      row.member_id,
    member_name:    row.members?.name ?? 'Unknown',
    eyeball_id:     row.eyeball_id,
    amount:         row.amount,
    notes:          row.notes,
    payment_method: row.payment_method,
    created_at:     row.created_at,
  }))
}

export const getContributionsByMember = async (
  memberId: string
): Promise<ContributionWithMember[]> => {
  const { data, error } = await supabase
    .from('contributions')
    .select(`
      id,
      member_id,
      eyeball_id,
      amount,
      notes,
      payment_method,
      created_at,
      members(name)
    `)
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row) => ({
    id:             row.id,
    member_id:      row.member_id,
    member_name:    row.members?.name ?? 'Unknown',
    eyeball_id:     row.eyeball_id,
    amount:         row.amount,
    notes:          row.notes,
    payment_method: row.payment_method,
    created_at:     row.created_at,
  }))
}

export const upsertContributionByEyeball = async (
  memberId:  string,
  eyeballId: string,
  amount:    number
) => {
  // Check if contribution already exists
  const { data: existing } = await contributionsTable()
    .select('id')
    .eq('member_id', memberId)
    .eq('eyeball_id', eyeballId)
    .single()

  if (existing?.id) {
    // Update existing
    const { error } = await contributionsTable()
      .update({ amount })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    // Insert new — only if amount > 0
    if (amount <= 0) return
    const { error } = await contributionsTable()
      .insert({
        member_id:  memberId,
        eyeball_id: eyeballId,
        amount,
      })
    if (error) throw error
  }
}

export const deleteContribution = async (id: string) => {
  const { error } = await contributionsTable()
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const deleteContributionByMemberEyeball = async (
  memberId:  string,
  eyeballId: string
) => {
  const { error } = await contributionsTable()
    .delete()
    .eq('member_id', memberId)
    .eq('eyeball_id', eyeballId)

  if (error) throw error
}