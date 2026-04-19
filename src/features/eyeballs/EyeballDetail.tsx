import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  MapPin,
  RefreshCw,
  Search,
  StickyNote,
  Users,
  UserX,
  Wallet,
} from 'lucide-react'
import { getEyeballById } from '../../lib/eyeballs'
import { useAttendance } from '../../hooks/useAttendance'
import {
  getContributionsByEyeball,
  upsertContributionByEyeball,
  deleteContributionByMemberEyeball,
} from '../../lib/contributions'
import { upsertAttendance } from '../../lib/attendance'
import type { Eyeball } from '../../types/eyeballs'
import type { ContributionWithMember } from '../../types/contributions'
import { formatDate } from '../../utils/formatDate'
import { formatCurrency } from '../../utils/formatCurrency'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import AttendanceContributionRow from '../attendance/AttendanceContributionRow'
import Pagination from '../../components/common/Pagination'

type TabType = 'attendance' | 'contributions'
type AttendanceFilter = 'all' | 'present' | 'absent'

const PAGE_SIZE = 10

const TABS = [
  {
    label: 'Attendance',
    value: 'attendance',
    icon: ClipboardCheck,
    description: 'Mark present or absent and record contributions.',
  },
  {
    label: 'Contributions',
    value: 'contributions',
    icon: CircleDollarSign,
    description: 'Review payment records for this meetup.',
  },
] satisfies {
  label: string
  value: TabType
  icon: typeof ClipboardCheck
  description: string
}[]

const getStringValue = (item: unknown, key: string) => {
  if (!item || typeof item !== 'object') return ''
  const value = (item as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : ''
}

const getNestedStringValue = (item: unknown, parentKey: string, childKey: string) => {
  if (!item || typeof item !== 'object') return ''
  const parent = (item as Record<string, unknown>)[parentKey]
  if (!parent || typeof parent !== 'object') return ''
  const value = (parent as Record<string, unknown>)[childKey]
  return typeof value === 'string' ? value : ''
}

const matchesMemberSearch = (item: unknown, query: string) => {
  if (!query) return true
  const searchableText = [
    getStringValue(item, 'member_name'),
    getStringValue(item, 'member_nickname'),
    getStringValue(item, 'name'),
    getStringValue(item, 'nickname'),
    getNestedStringValue(item, 'member', 'name'),
    getNestedStringValue(item, 'member', 'nickname'),
  ].join(' ').toLowerCase()
  return searchableText.includes(query)
}

const EyeballDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [eyeball, setEyeball] = useState<Eyeball | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('attendance')
  const [contributions, setContributions] = useState<ContributionWithMember[]>([])
  const [contribLoading, setContribLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('all')

  const {
    attendance,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
    presentCount,
    absentCount,
  } = useAttendance(id ?? '')

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

  const fetchContributions = useCallback(async () => {
    if (!id) return
    try {
      setContribLoading(true)
      const data = await getContributionsByEyeball(id)
      setContributions(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setContribLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEyeball()
    fetchContributions()
  }, [fetchEyeball, fetchContributions])

  useEffect(() => {
    setCurrentPage(1)
    setAttendanceFilter('all')
  }, [activeTab, search])

  const handleRefresh = async () => {
    await Promise.all([fetchEyeball(), fetchContributions(), refetchAttendance()])
  }

  const handleSave = async (memberId: string, status: 'present' | 'absent', amount: number) => {
    if (!id) return
    try {
      setSavingId(memberId)
      await upsertAttendance(id, memberId, status)
      if (status === 'present' && amount > 0) {
        await upsertContributionByEyeball(memberId, id, amount)
      } else if (status === 'absent') {
        await deleteContributionByMemberEyeball(memberId, id)
      }
      await Promise.all([refetchAttendance(), fetchContributions()])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setSavingId(null)
    }
  }

  const normalizedSearch = search.trim().toLowerCase()

  const searchMatchedAttendance = useMemo(
    () => attendance.filter((r) => matchesMemberSearch(r, normalizedSearch)),
    [attendance, normalizedSearch],
  )

  const filteredAttendance = useMemo(
    () =>
      searchMatchedAttendance.filter((r) => {
        if (attendanceFilter === 'all') return true
        return r.status === attendanceFilter
      }),
    [searchMatchedAttendance, attendanceFilter],
  )

  const filteredContributions = useMemo(
    () => contributions.filter((c) => matchesMemberSearch(c, normalizedSearch)),
    [contributions, normalizedSearch],
  )

  const activeList = activeTab === 'attendance' ? filteredAttendance : filteredContributions
  const totalPages = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  const paginatedAttendance = filteredAttendance.slice(startIndex, endIndex)
  const paginatedContributions = filteredContributions.slice(startIndex, endIndex)

  const totalCollected = useMemo(
    () => contributions.reduce((sum, c) => sum + c.amount, 0),
    [contributions],
  )

  const filteredCollected = useMemo(
    () => filteredContributions.reduce((sum, c) => sum + c.amount, 0),
    [filteredContributions],
  )

  const filterPills = useMemo(
    () => [
      {
        value: 'all' as AttendanceFilter,
        label: 'All',
        count: searchMatchedAttendance.length,
        active: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
        activeBadge: 'bg-sky-100 text-sky-700',
      },
      {
        value: 'present' as AttendanceFilter,
        label: 'Present',
        count: searchMatchedAttendance.filter((r) => r.status === 'present').length,
        active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        activeBadge: 'bg-emerald-100 text-emerald-700',
      },
      {
        value: 'absent' as AttendanceFilter,
        label: 'Absent',
        count: searchMatchedAttendance.filter((r) => r.status === 'absent').length,
        active: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
        activeBadge: 'bg-orange-100 text-orange-700',
      },
    ],
    [searchMatchedAttendance],
  )

  const activeTabDetails = TABS.find((t) => t.value === activeTab)
  const ActiveTabIcon = activeTabDetails?.icon

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !eyeball) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <EmptyState
          title="Eyeball not found"
          description={error ?? 'This meetup does not exist.'}
          action={
            <button
              type="button"
              onClick={() => navigate('/admin/eyeballs')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={15} />
              Back to eyeballs
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/admin/eyeballs')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={15} />
        Back to eyeballs
      </button>

      {/* Eyeball info card */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-widest text-sky-500">
                Eyeball Meetup
              </p>
              <h1 className="mt-1 break-words text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                {eyeball.title || 'Eyeball'}
              </h1>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="flex min-w-0 items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
                    <CalendarDays size={14} />
                  </span>
                  <span className="truncate text-sm text-slate-600">{formatDate(eyeball.date)}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-100">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                    <MapPin size={14} />
                  </span>
                  <span className="truncate text-sm text-slate-600">{eyeball.location}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 transition hover:bg-slate-50 sm:w-auto"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Notes */}
        {eyeball.notes && (
          <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex gap-3 rounded-lg bg-slate-50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-100">
                <StickyNote size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Notes</p>
                <p className="mt-1 break-words text-sm leading-6 text-slate-600">{eyeball.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          <div className="flex flex-col items-center gap-1 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
              <Users size={15} />
            </div>
            <p className="text-lg font-semibold text-slate-950">{presentCount}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Present</p>
          </div>
          <div className="flex flex-col items-center gap-1 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <UserX size={15} />
            </div>
            <p className="text-lg font-semibold text-slate-950">{absentCount}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Absent</p>
          </div>
          <div className="flex flex-col items-center gap-1 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
              <Wallet size={15} />
            </div>
            <p className="truncate text-lg font-semibold text-slate-950">{formatCurrency(totalCollected)}</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">Collected</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all sm:px-4 sm:py-3.5 ${
                isActive
                  ? 'bg-sky-50 ring-1 ring-sky-100'
                  : 'border border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                isActive ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                <Icon size={15} />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-medium ${isActive ? 'text-sky-700' : 'text-slate-700'}`}>
                  {tab.label}
                </span>
                <span className={`mt-0.5 hidden text-xs leading-4 sm:block ${isActive ? 'text-sky-500' : 'text-slate-400'}`}>
                  {tab.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Tab header */}
        <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2.5">
                {ActiveTabIcon && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <ActiveTabIcon size={15} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-950">{activeTabDetails?.label}</p>
                  <p className="text-xs text-slate-400">{activeTabDetails?.description}</p>
                </div>
              </div>
              <div className="relative w-full sm:w-72">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or nickname…"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Attendance filter pills */}
            {activeTab === 'attendance' && (
              <div className="flex items-center gap-1.5">
                {filterPills.map((pill) => {
                  const isActive = attendanceFilter === pill.value
                  return (
                    <button
                      key={pill.value}
                      type="button"
                      onClick={() => { setAttendanceFilter(pill.value); setCurrentPage(1) }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        isActive
                          ? pill.active
                          : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {pill.label}
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                        isActive ? pill.activeBadge : 'bg-slate-100 text-slate-500'
                      }`}>
                        {pill.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Attendance tab */}
        {activeTab === 'attendance' && (
          <>
            {attendanceLoading ? (
              <div className="flex min-h-48 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : attendance.length === 0 ? (
              <div className="p-6">
                <EmptyState title="No members found" description="Add members first before tracking attendance." />
              </div>
            ) : filteredAttendance.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title={attendanceFilter !== 'all' ? `No ${attendanceFilter} members` : 'No matching members'}
                  description={attendanceFilter !== 'all' ? `No members are marked as ${attendanceFilter}.` : 'Try a different name or nickname.'}
                />
              </div>
            ) : (
              <div className="space-y-2 p-3 sm:p-4">
                {paginatedAttendance.map((record) => {
                  const contribution = contributions.find((c) => c.member_id === record.member_id) ?? null
                  return (
                    <AttendanceContributionRow
                      key={`${record.member_id}-${record.status}-${contribution?.amount ?? 0}`}
                      record={record}
                      contribution={contribution}
                      isSaving={savingId === record.member_id}
                      onSave={handleSave}
                    />
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Contributions tab */}
        {activeTab === 'contributions' && (
          <>
            {contribLoading ? (
              <div className="flex min-h-48 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : contributions.length === 0 ? (
              <div className="p-6">
                <EmptyState title="No contributions yet" description="Mark members as present and add amounts in the Attendance tab." />
              </div>
            ) : filteredContributions.length === 0 ? (
              <div className="p-6">
                <EmptyState title="No matching contributions" description="Try a different member name or nickname." />
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="space-y-2 p-3 sm:hidden">
                  {paginatedContributions.map((contribution) => {
                    const nickname = getStringValue(contribution, 'member_nickname')
                    return (
                      <article
                        key={contribution.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-950">{contribution.member_name}</p>
                          {nickname && <p className="mt-0.5 text-xs text-slate-400">{nickname}</p>}
                          <p className="mt-1.5 text-xs text-slate-400">{formatDate(contribution.created_at)}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-emerald-600">
                          {formatCurrency(contribution.amount)}
                        </p>
                      </article>
                    )
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-slate-400">Member</th>
                        <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-widest text-slate-400">Amount</th>
                        <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-widest text-slate-400">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedContributions.map((contribution) => {
                        const nickname = getStringValue(contribution, 'member_nickname')
                        return (
                          <tr key={contribution.id} className="transition-colors hover:bg-slate-50/60">
                            <td className="px-5 py-3.5">
                              <p className="truncate text-sm font-medium text-slate-950">{contribution.member_name}</p>
                              <p className="mt-0.5 text-xs text-slate-400">{nickname || 'Club member'}</p>
                            </td>
                            <td className="px-5 py-3.5 text-right text-sm font-semibold text-emerald-600">
                              {formatCurrency(contribution.amount)}
                            </td>
                            <td className="px-5 py-3.5 text-right text-xs text-slate-400">
                              {formatDate(contribution.created_at)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-100 bg-slate-50/80">
                        <td className="px-5 py-3 text-sm font-medium text-slate-900">Filtered total</td>
                        <td className="px-5 py-3 text-right text-sm font-semibold text-emerald-600">
                          {formatCurrency(filteredCollected)}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </section>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        totalItems={activeList.length}
        filteredItems={activeList.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

export default EyeballDetail