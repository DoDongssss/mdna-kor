import { useState } from 'react'
import type { AttendanceWithMember } from '../../types/attendance'
import type { ContributionWithMember } from '../../types/contributions'

interface AttendanceContributionRowProps {
  record:       AttendanceWithMember
  contribution: ContributionWithMember | null
  isSaving:     boolean
  onSave:       (
    memberId: string,
    status:   'present' | 'absent',
    amount:   number
  ) => Promise<void>
}

const AttendanceContributionRow = ({
  record,
  contribution,
  isSaving,
  onSave,
}: AttendanceContributionRowProps) => {
  const [isPresent, setIsPresent] = useState(record.status === 'present')
  const [amount, setAmount]       = useState(contribution?.amount ?? 0)
  const [isDirty, setIsDirty]     = useState(false)

  const handleToggle = () => {
    const next = !isPresent
    setIsPresent(next)
    if (!next) setAmount(0)
    setIsDirty(true)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0
    setAmount(val)
    setIsDirty(true)
  }

  const handleSave = async () => {
    await onSave(
      record.member_id,
      isPresent ? 'present' : 'absent',
      isPresent ? amount : 0
    )
    setIsDirty(false)
  }

  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      isPresent
        ? 'bg-green-50 border-green-100'
        : 'bg-white border-stone-100'
    }`}>
      <div className="flex items-center gap-3 flex-wrap">

        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          isPresent ? 'bg-green-100' : 'bg-stone-100'
        }`}>
          <span className={`text-xs font-medium ${
            isPresent ? 'text-green-600' : 'text-stone-400'
          }`}>
            {record.member_name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1a1a18] truncate">
            {record.member_name}
          </p>
          {record.member_nickname && (
            <p className="text-xs text-stone-400 truncate">
              {record.member_nickname}
            </p>
          )}
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggle}
            disabled={isSaving}
            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
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

        {/* Amount input */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-stone-400">₱</span>
          <input
            type="number"
            min="0"
            step="1"
            value={amount}
            onChange={handleAmountChange}
            disabled={!isPresent || isSaving}
            className="w-24 bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-sm text-[#1a1a18] text-right focus:outline-none focus:border-[#1a1a18] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-stone-50"
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="shrink-0 px-4 py-1.5 text-xs font-medium bg-[#1a1a18] text-white rounded-lg hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving
            </span>
          ) : 'Save'}
        </button>

      </div>

      {/* Existing contribution indicator */}
      {contribution && (
        <div className="mt-2 ml-12 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <p className="text-xs text-stone-400">
            Recorded contribution: ₱{contribution.amount.toLocaleString()}
          </p>
        </div>
      )}

    </div>
  )
}

export default AttendanceContributionRow