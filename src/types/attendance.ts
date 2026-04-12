// import type { Database } from '@/supabase/types/database.types'
// export type Attendance       = Database['public']['Tables']['attendance']['Row']
// export type AttendanceInsert = Database['public']['Tables']['attendance']['Insert']
// export type AttendanceStatus = Database['public']['Enums']['attendance_status']

export type AttendanceStatus = 'present' | 'absent'

export interface Attendance {
  id:         string
  eyeball_id: string
  member_id:  string
  status:     AttendanceStatus
  created_at: string
}

export interface AttendanceWithMember {
  id:              string | null
  eyeball_id:      string
  member_id:       string
  status:          AttendanceStatus
  member_name:     string
  member_nickname: string | null
  member_active:   boolean
}

export interface MemberRow {
  id:        string
  name:      string
  nickname:  string | null
  is_active: boolean
}

export interface AttendanceRow {
  id:         string
  eyeball_id: string
  member_id:  string
  status:     AttendanceStatus
  created_at: string
}