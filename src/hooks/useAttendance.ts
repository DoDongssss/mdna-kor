import { useState, useEffect, useCallback } from 'react'
import { getAttendanceByEyeball, upsertAttendance } from '../lib/attendance'
import type { AttendanceWithMember, AttendanceStatus } from '../types/attendance'

export const useAttendance = (eyeballId: string) => {
  const [attendance, setAttendance]   = useState<AttendanceWithMember[]>([])
  const [isLoading, setIsLoading]     = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [savingId, setSavingId]       = useState<string | null>(null)

  const fetchAttendance = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getAttendanceByEyeball(eyeballId)
      setAttendance(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message ?? 'Failed to load attendance')
    } finally {
      setIsLoading(false)
    }
  }, [eyeballId])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const toggle = async (memberId: string, currentStatus: AttendanceStatus) => {
    const newStatus: AttendanceStatus = currentStatus === 'present' ? 'absent' : 'present'

    // Optimistic update
    setAttendance((prev) =>
      prev.map((a) =>
        a.member_id === memberId ? { ...a, status: newStatus } : a
      )
    )

    try {
      setSavingId(memberId)
      await upsertAttendance(eyeballId, memberId, newStatus)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Revert on error
      setAttendance((prev) =>
        prev.map((a) =>
          a.member_id === memberId ? { ...a, status: currentStatus } : a
        )
      )
      setError(err.message ?? 'Failed to save attendance')
    } finally {
      setSavingId(null)
    }
  }

  const presentCount = attendance.filter((a) => a.status === 'present').length
  const absentCount  = attendance.filter((a) => a.status === 'absent').length

  return {
    attendance,
    isLoading,
    error,
    savingId,
    toggle,
    presentCount,
    absentCount,
    refetch: fetchAttendance,
  }
}