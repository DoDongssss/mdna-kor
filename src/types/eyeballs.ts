// import type { Database } from '@/supabase/types/database.types'
// export type Eyeball        = Database['public']['Tables']['eyeballs']['Row']
// export type EyeballInsert  = Database['public']['Tables']['eyeballs']['Insert']
// export type EyeballUpdate  = Database['public']['Tables']['eyeballs']['Update']
// export type EyeballSummary = Database['public']['Views']['eyeball_summary']['Row']

export interface Eyeball {
  id: string
  title: string | null
  date: string
  location: string
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface EyeballSummary {
  id: string
  title: string | null
  date: string
  location: string
  notes: string | null
  present_count: number
  absent_count: number
  total_collected: number
}

export type EyeballInsert = Omit<Eyeball, 'id' | 'created_by' | 'created_at'>
export type EyeballUpdate = Partial<EyeballInsert>