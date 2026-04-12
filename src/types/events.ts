// import type { Database } from '@/supabase/types/database.types'
// export type ClubEvent       = Database['public']['Tables']['events']['Row']
// export type ClubEventInsert = Database['public']['Tables']['events']['Insert']
// export type ClubEventUpdate = Database['public']['Tables']['events']['Update']
// export type EventType       = Database['public']['Enums']['event_type']

export type EventType = 'meetup' | 'charity_ride' | 'announcement' | 'other'

export interface ClubEvent {
  id:          string
  title:       string
  type:        EventType
  date:        string
  description: string | null
  location:    string | null
  created_by:  string | null
  created_at:  string
}

export type ClubEventInsert = Omit<ClubEvent, 'id' | 'created_by' | 'created_at'>
export type ClubEventUpdate = Partial<ClubEventInsert>