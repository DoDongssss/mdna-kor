import type { AttendanceWithMember } from '../../types/attendance'

interface AttendanceToggleProps {
  record:   AttendanceWithMember
  isSaving: boolean
  onToggle: (memberId: string, currentStatus: AttendanceWithMember['status']) => void
}

const AttendanceToggle = ({ record, isSaving, onToggle }: AttendanceToggleProps) => {
  const isPresent = record.status === 'present'

  return (
    <article className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-colors ${
      isPresent ? 'bg-sky-50 border-sky-100' : 'bg-white border-slate-200'
    }`}>

      {/* Member info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          isPresent ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500'
        }`}>
          {record.member_name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{record.member_name}</p>
          {record.member_nickname && (
            <p className="text-xs text-slate-400 truncate">{record.member_nickname}</p>
          )}
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className={`text-xs font-medium hidden sm:inline ${
          isPresent ? 'text-sky-600' : 'text-slate-400'
        }`}>
          {isPresent ? 'Present' : 'Absent'}
        </span>
        {isSaving && (
          <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        )}
        <button
          onClick={() => onToggle(record.member_id, record.status)}
          disabled={isSaving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isPresent ? 'bg-sky-500' : 'bg-slate-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
            isPresent ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

    </article>
  )
}

export default AttendanceToggle