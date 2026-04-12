import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEyeballById } from '../../lib/eyeballs'
import { useAttendance } from '../../hooks/useAttendance'
import type { Eyeball } from '../../types/eyeballs'
import { formatDate } from '../../utils/formatDate'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import AttendanceToggle from '../attendance/AttendanceToggle'

type TabType = 'attendance' | 'contributions'

const EyeballDetail = () => {
  const { id }       = useParams<{ id: string }>()
  const navigate     = useNavigate()
  const [eyeball, setEyeball]     = useState<Eyeball | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('attendance')

  const fetchEyeball = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setError(null)
      const data = await getEyeballById(id)
      setEyeball(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message ?? 'Failed to load eyeball')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEyeball()
  }, [fetchEyeball])

  // Attendance hook — only active when id is available
  const {
    attendance,
    isLoading: attendanceLoading,
    savingId,
    toggle,
    presentCount,
    absentCount,
  } = useAttendance(id ?? '')

  if (isLoading) return <LoadingSpinner />

  if (error || !eyeball) {
    return (
      <EmptyState
        title="Eyeball not found"
        description={error ?? 'This meetup does not exist'}
        action={
          <button
            onClick={() => navigate('/admin/eyeballs')}
            className="text-sm text-stone-500 underline"
          >
            Back to Eyeballs
          </button>
        }
      />
    )
  }

  const TABS: { label: string; value: TabType }[] = [
    { label: 'Attendance',    value: 'attendance' },
    { label: 'Contributions', value: 'contributions' },
  ]

  return (
    <div>

      {/* Back */}
      <button
        onClick={() => navigate('/admin/eyeballs')}
        className="flex items-center gap-2 text-sm text-stone-400 hover:text-[#1a1a18] transition-colors mb-6"
      >
        ← Back to Eyeballs
      </button>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-medium text-[#1a1a18]">
              {eyeball.title ?? 'Eyeball'}
            </h1>
            <p className="text-sm text-stone-400 mt-1">
              {formatDate(eyeball.date)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-stone-300 text-xs">📍</span>
              <span className="text-sm text-stone-500">{eyeball.location}</span>
            </div>
            {eyeball.notes && (
              <p className="text-sm text-stone-400 mt-3 max-w-xl">
                {eyeball.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-lg p-1 w-fit mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-white text-[#1a1a18] shadow-sm'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">

        {/* Attendance tab */}
        {activeTab === 'attendance' && (
          <>
            {attendanceLoading ? (
              <LoadingSpinner />
            ) : attendance.length === 0 ? (
              <EmptyState
                title="No members found"
                description="Add members first before tracking attendance"
              />
            ) : (
              <>
                {/* Summary */}
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

                {/* Toggles */}
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
              </>
            )}
          </>
        )}

        {/* Contributions tab — placeholder for Phase 6 */}
        {activeTab === 'contributions' && (
          <div className="text-center py-10">
            <p className="text-sm text-stone-400">
              Contributions tracking coming in Phase 6
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

export default EyeballDetail