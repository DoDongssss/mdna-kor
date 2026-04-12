import type { Database } from '@/supabase/types/database.types'
export type Member       = Database['public']['Tables']['members']['Row']
// export type MemberInsert = Database['public']['Tables']['members']['Insert']
// export type MemberUpdate = Database['public']['Tables']['members']['Update']

// export interface Member {
//   id: string
//   name: string
//   nickname: string | null
//   contact_number: string | null
//   is_active: boolean
//   deleted_at: string | null
//   created_at: string
// }

// export type MemberInsert = Omit<Member, 'id' | 'deleted_at' | 'created_at'>
// export type MemberUpdate = Partial<MemberInsert>