// import type { Database } from '@/supabase/types/database.types'
// export type Contribution       = Database['public']['Tables']['contributions']['Row']
// export type ContributionInsert = Database['public']['Tables']['contributions']['Insert']
// export type ContributionUpdate = Database['public']['Tables']['contributions']['Update']


export interface Contribution {
  id:             string
  member_id:      string
  eyeball_id:     string | null
  amount:         number
  notes:          string | null
  payment_method: string | null
  created_at:     string
}

export interface ContributionWithMember {
  id:             string
  member_id:      string
  member_name:    string
  eyeball_id:     string | null
  amount:         number
  notes:          string | null
  payment_method: string | null
  created_at:     string
}

export type ContributionInsert = Omit<Contribution, 'id' | 'created_at'>