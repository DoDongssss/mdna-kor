import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search, UserCheck, UserX, Users } from 'lucide-react'
import { useAttendance } from '../../hooks/useAttendance'
import { useEyeballs } from '../../hooks/useEyeballs'
import type { EyeballSummary } from '../../types/eyeballs'
import type { AttendanceWithMember } from '../../types/attendance'
import AttendanceToggle from './AttendanceToggle'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { formatDate } from '../../utils/formatDate'

type StatusFilter = 'all' | 'present' | 'absent'

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All',     value: 'all'     },
  { label: 'Present', value: 'present' },
  { label: 'Absent',  value: 'absent'  },
]

const PAGE_SIZE = 10

// ── Inner content component ───────────────────────────────────────────────────
const AttendanceContent = ({ eyeball }: { eyeball: EyeballSummary }) => {
  const { attendance, isLoading, error, savingId, toggle, presentCount, absentCount } =
    useAttendance(eyeball.id)

  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return attendance.filter((r: AttendanceWithMember) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'present' && r.status === 'present') ||
        (statusFilter === 'absent'  && r.status !== 'present')

      const matchesSearch =
        !query ||
        r.member_name.toLowerCase().includes(query) ||
        (r.member_nickname ?? '').toLowerCase().includes(query)

      return matchesStatus && matchesSearch
    })
  }, [attendance, search, statusFilter])

  const totalPages   = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage     = Math.min(currentPage, totalPages)
  const startIndex   = (safePage - 1) * PAGE_SIZE
  const visibleItems = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  if (isLoading) return <LoadingSpinner />

  if (error) return <EmptyState title="Failed to load attendance" description={error} />

  if (attendance.length === 0) {
    return (
      <EmptyState
        title="No members found"
        description="Add members first before tracking attendance"
      />
    )
  }

  return (
    <div className="space-y-3">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            <Users size={16} />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">
            {attendance.length}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Total</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
            <UserCheck size={16} />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{presentCount}</p>
          <p className="mt-0.5 text-xs text-slate-400">Present</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            <UserX size={16} />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">{absentCount}</p>
          <p className="mt-0.5 text-xs text-slate-400">Absent</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search member…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleStatusChange(item.value)}
                className={`flex-1 rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
                  statusFilter === item.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-12 text-center shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <Search size={20} />
          </div>
          <p className="text-sm font-medium text-slate-900">No members found</p>
          <p className="mt-1 text-sm text-slate-400">Try a different search or filter.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {visibleItems.map((record) => (
              <AttendanceToggle
                key={record.member_id}
                record={record}
                isSaving={savingId === record.member_id}
                onToggle={toggle}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <p className="text-xs text-slate-400">
              {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length}
              {filtered.length !== attendance.length
                ? ` (filtered from ${attendance.length})`
                : ''}{' '}
              members
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(safePage - 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <span className="min-w-12 rounded-lg bg-slate-50 px-3 py-1.5 text-center text-xs font-medium text-slate-500">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage(safePage + 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Page component ────────────────────────────────────────────────────────────
const AttendancePage = () => {
  const { eyeballs, isLoading: eyeballsLoading } = useEyeballs()
  const [selectedId, setSelectedId] = useState<string>('')

  const selectedEyeball = eyeballs.find((e) => e.id === selectedId) ?? null

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Mark Attendance
        </h1>
        <p className="max-w-xl text-sm leading-6 text-slate-500">
          Mark members present or absent per eyeball meetup.
        </p>
      </div>

      {/* Eyeball selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
          Select Eyeball
        </label>
        {eyeballsLoading ? (
          <div className="h-10 rounded-lg bg-slate-100 animate-pulse" />
        ) : (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
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

      {/* Content */}
      {!selectedId ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8">
          <EmptyState
            title="No eyeball selected"
            description="Select a meetup above to start marking attendance."
          />
        </section>
      ) : selectedEyeball ? (
        <AttendanceContent eyeball={selectedEyeball} />
      ) : null}

    </div>
  )
}

export default AttendancePage