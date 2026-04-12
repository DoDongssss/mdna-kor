import { supabase } from '../supabase/client'
import type {
  AttendanceStatus,
  AttendanceWithMember,
  MemberRow,
  AttendanceRow,
} from '../types/attendance'

export const getAttendanceByEyeball = async (
  eyeballId: string
): Promise<AttendanceWithMember[]> => {
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id, name, nickname, is_active')
    .is('deleted_at', null)
    .order('name', { ascending: true })

  if (membersError) throw membersError

  const { data: records, error: recordsError } = await supabase
    .from('attendance')
    .select('*')
    .eq('eyeball_id', eyeballId)

  if (recordsError) throw recordsError

  return (members as MemberRow[]).map((member) => {
    const record = (records as AttendanceRow[]).find(
      (r) => r.member_id === member.id
    )
    return {
      id:              record?.id   ?? null,
      eyeball_id:      eyeballId,
      member_id:       member.id,
      status:          record?.status ?? 'absent',
      member_name:     member.name,
      member_nickname: member.nickname,
      member_active:   member.is_active,
    }
  })
}

export const upsertAttendance = async (
  eyeballId: string,
  memberId:  string,
  status:    AttendanceStatus
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('attendance') as any)
    .upsert(
      {
        eyeball_id: eyeballId,
        member_id:  memberId,
        status,
      },
      { onConflict: 'eyeball_id,member_id' }
    )

  if (error) throw error
}