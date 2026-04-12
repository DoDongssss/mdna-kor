import { useState } from 'react'
import { useAttendance } from '../../hooks/useAttendance'
import { useEyeballs } from '../../hooks/useEyeballs'
import type { EyeballSummary } from '../../types/eyeballs'
import AttendanceToggle from './AttendanceToggle'
import PageHeader from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { formatDate } from '../../utils/formatDate'

const AttendanceContent = ({ eyeball }: { eyeball: EyeballSummary }) => {
  const { attendance, isLoading, error, savingId, toggle, presentCount, absentCount } =
    useAttendance(eyeball.id)

  if (isLoading) return <LoadingSpinner />

  if (error) {
    return (
      <EmptyState
        title="Failed to load attendance"
        description={error}
      />
    )
  }

  if (attendance.length === 0) {
    return (
      <EmptyState
        title="No members found"
        description="Add members first before tracking attendance"
      />
    )
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4 text-center">
          <p className="text-2xl font-medium text-green-600">{presentCount}</p>
          <p className="text-xs text-green-500 uppercase tracking-widest mt-0.5">Present</p>
        </div>
        <div className="bg-stone-50 border border-stone-100 rounded-xl px-5 py-4 text-center">
          <p className="text-2xl font-medium text-stone-400">{absentCount}</p>
          <p className="text-xs text-stone-400 uppercase tracking-widest mt-0.5">Absent</p>
        </div>
      </div>

      {/* Toggle list */}
      <div className="space-y-2">
        {attendance.map((record) => (
          <AttendanceToggle
            key={record.member_id}
            record={record}
            isSaving={savingId === record.member_id}
            onToggle={toggle}
          />
        ))}
      </div>
    </div>
  )
}

const AttendancePage = () => {
  const { eyeballs, isLoading: eyeballsLoading } = useEyeballs()
  const [selectedId, setSelectedId] = useState<string>('')

  const selectedEyeball = eyeballs.find((e) => e.id === selectedId) ?? null

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Mark members present or absent per eyeball"
      />

      {/* Eyeball selector */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
        <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
          Select Eyeball
        </label>
        {eyeballsLoading ? (
          <div className="h-10 bg-stone-50 rounded-lg animate-pulse" />
        ) : (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] transition"
          >
            <option value="">— Choose a meetup —</option>
            {eyeballs.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title ?? 'Eyeball'} — {formatDate(e.date)} · {e.location}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Attendance list */}
      {!selectedId ? (
        <EmptyState
          title="No eyeball selected"
          description="Select a meetup above to start marking attendance"
        />
      ) : selectedEyeball ? (
        <AttendanceContent eyeball={selectedEyeball} />
      ) : null}

    </div>
  )
}

export default AttendancePage