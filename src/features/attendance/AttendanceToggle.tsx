import type { AttendanceWithMember } from '../../types/attendance'

interface AttendanceToggleProps {
  record:   AttendanceWithMember
  isSaving: boolean
  onToggle: (memberId: string, currentStatus: AttendanceWithMember['status']) => void
}

const AttendanceToggle = ({ record, isSaving, onToggle }: AttendanceToggleProps) => {
  const isPresent = record.status === 'present'

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
      isPresent
        ? 'bg-green-50 border-green-100'
        : 'bg-white border-stone-100'
    }`}>

      {/* Member info */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isPresent ? 'bg-green-100' : 'bg-stone-100'
        }`}>
          <span className={`text-xs font-medium ${
            isPresent ? 'text-green-600' : 'text-stone-400'
          }`}>
            {record.member_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-[#1a1a18]">
            {record.member_name}
          </p>
          {record.member_nickname && (
            <p className="text-xs text-stone-400">
              {record.member_nickname}
            </p>
          )}
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-3">
        {isSaving && (
          <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-transparent rounded-full animate-spin" />
        )}
        <button
          onClick={() => onToggle(record.member_id, record.status)}
          disabled={isSaving}
          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isPresent ? 'bg-green-500' : 'bg-stone-200'
          }`}
        >
          <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
            isPresent ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
        <span className={`text-xs font-medium w-14 ${
          isPresent ? 'text-green-600' : 'text-stone-400'
        }`}>
          {isPresent ? 'Present' : 'Absent'}
        </span>
      </div>

    </div>
  )
}

export default AttendanceToggle