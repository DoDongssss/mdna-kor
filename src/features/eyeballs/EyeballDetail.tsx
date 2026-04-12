import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
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

type TabType = 'attendance' | 'contributions'

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
  ]
    .join(' ')
    .toLowerCase()

  return searchableText.includes(query)
}

const EyeballDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [eyeball, setEyeball] = useState<Eyeball | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('attendance')
  const [contributions, setContributions] = useState<ContributionWithMember[]>(
    [],
  )
  const [contribLoading, setContribLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

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
  }, [activeTab, search])

  const handleRefresh = async () => {
    await Promise.all([fetchEyeball(), fetchContributions(), refetchAttendance()])
  }

  const handleSave = async (
    memberId: string,
    status: 'present' | 'absent',
    amount: number,
  ) => {
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

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) =>
      matchesMemberSearch(record, normalizedSearch),
    )
  }, [attendance, normalizedSearch])

  const filteredContributions = useMemo(() => {
    return contributions.filter((contribution) =>
      matchesMemberSearch(contribution, normalizedSearch),
    )
  }, [contributions, normalizedSearch])

  const activeList =
    activeTab === 'attendance' ? filteredAttendance : filteredContributions

  const totalPages = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE

  const paginatedAttendance = filteredAttendance.slice(startIndex, endIndex)
  const paginatedContributions = filteredContributions.slice(
    startIndex,
    endIndex,
  )

  const totalCollected = useMemo(() => {
    return contributions.reduce((sum, contribution) => {
      return sum + contribution.amount
    }, 0)
  }, [contributions])

  const filteredCollected = useMemo(() => {
    return filteredContributions.reduce((sum, contribution) => {
      return sum + contribution.amount
    }, 0)
  }, [filteredContributions])

  const activeTabDetails = TABS.find((tab) => tab.value === activeTab)
  const ActiveTabIcon = activeTabDetails?.icon

  const canGoPrevious = safePage > 1
  const canGoNext = safePage < totalPages

  if (isLoading) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm sm:min-h-[420px] sm:rounded-3xl">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !eyeball) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
        <EmptyState
          title="Eyeball not found"
          description={error ?? 'This meetup does not exist.'}
          action={
            <button
              type="button"
              onClick={() => navigate('/admin/eyeballs')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              <ArrowLeft size={16} />
              Back to Eyeballs
            </button>
          }
        />
      </section>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <button
        type="button"
        onClick={() => navigate('/admin/eyeballs')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-950"
      >
        <ArrowLeft size={16} />
        Back to Eyeballs
      </button>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
        <div className="border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white to-white px-4 py-5 sm:px-6 sm:py-6 lg:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500">
                Eyeball Meetup
              </p>

              <h1 className="mt-2 break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {eyeball.title || 'Eyeball'}
              </h1>

              <div className="mt-4 grid gap-2 text-sm font-medium text-slate-500 sm:grid-cols-2">
                <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white/80 p-2 ring-1 ring-slate-100">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <CalendarDays size={16} />
                  </span>

                  <span className="min-w-0 truncate">
                    {formatDate(eyeball.date)}
                  </span>
                </div>

                <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white/80 p-2 ring-1 ring-slate-100">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <MapPin size={16} />
                  </span>

                  <span className="min-w-0 truncate">{eyeball.location}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 sm:w-auto"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        {eyeball.notes && (
          <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-100">
                  <StickyNote size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Notes
                  </p>

                  <p className="mt-1 break-words text-sm leading-6 text-slate-600">
                    {eyeball.notes}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 border-t border-slate-100 p-4 sm:grid-cols-3 sm:p-5 lg:px-7">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3 sm:block sm:text-center lg:flex lg:text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 sm:mx-auto sm:mb-2 lg:mx-0 lg:mb-0">
                <Users size={18} />
              </div>

              <div>
                <p className="text-2xl font-black tracking-tight text-slate-950">
                  {presentCount}
                </p>

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Present
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-3 sm:block sm:text-center lg:flex lg:text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 ring-1 ring-slate-200 sm:mx-auto sm:mb-2 lg:mx-0 lg:mb-0">
                <UserX size={18} />
              </div>

              <div>
                <p className="text-2xl font-black tracking-tight text-slate-950">
                  {absentCount}
                </p>

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Absent
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex min-w-0 items-center gap-3 sm:block sm:text-center lg:flex lg:text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 sm:mx-auto sm:mb-2 lg:mx-0 lg:mb-0">
                <Wallet size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-2xl font-black tracking-tight text-slate-950">
                  {formatCurrency(totalCollected)}
                </p>

                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Collected
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:rounded-3xl sm:p-2">
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-start gap-3 rounded-xl px-3 py-3 text-left transition-all sm:rounded-2xl sm:px-4 sm:py-4 ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-100'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition sm:h-9 sm:w-9 ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon size={16} />
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-bold">{tab.label}</span>

                  <span
                    className={`mt-0.5 block text-xs leading-5 ${
                      isActive ? 'text-sky-600/80' : 'text-slate-400'
                    }`}
                  >
                    {tab.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5 lg:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {ActiveTabIcon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <ActiveTabIcon size={17} />
                </div>
              )}

              <div className="min-w-0">
                <h2 className="truncate text-sm font-black text-slate-950">
                  {activeTabDetails?.label}
                </h2>

                <p className="text-xs font-medium text-slate-400">
                  {activeTabDetails?.description}
                </p>
              </div>
            </div>

            <div className="relative w-full lg:w-80">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or nickname..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>
          </div>
        </div>

        {activeTab === 'attendance' && (
          <>
            {attendanceLoading ? (
              <div className="flex min-h-[260px] items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : attendance.length === 0 ? (
              <div className="p-6 sm:p-8">
                <EmptyState
                  title="No members found"
                  description="Add members first before tracking attendance."
                />
              </div>
            ) : filteredAttendance.length === 0 ? (
              <div className="p-6 sm:p-8">
                <EmptyState
                  title="No matching members"
                  description="Try a different name or nickname."
                />
              </div>
            ) : (
              <div className="p-3 sm:p-4 lg:p-5">
                <div className="space-y-2">
                  {paginatedAttendance.map((record) => {
                    const contribution =
                      contributions.find(
                        (item) => item.member_id === record.member_id,
                      ) ?? null

                    return (
                      <AttendanceContributionRow
                        key={`${record.member_id}-${record.status}-${
                          contribution?.amount ?? 0
                        }`}
                        record={record}
                        contribution={contribution}
                        isSaving={savingId === record.member_id}
                        onSave={handleSave}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'contributions' && (
          <>
            {contribLoading ? (
              <div className="flex min-h-[260px] items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : contributions.length === 0 ? (
              <div className="p-6 sm:p-8">
                <EmptyState
                  title="No contributions yet"
                  description="Mark members as present and add amounts in the Attendance tab."
                />
              </div>
            ) : filteredContributions.length === 0 ? (
              <div className="p-6 sm:p-8">
                <EmptyState
                  title="No matching contributions"
                  description="Try a different member name or nickname."
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 p-3 sm:hidden">
                  {paginatedContributions.map((contribution) => {
                    const nickname = getStringValue(
                      contribution,
                      'member_nickname',
                    )

                    return (
                      <article
                        key={contribution.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="break-words text-sm font-black text-slate-950">
                              {contribution.member_name}
                            </p>

                            {nickname && (
                              <p className="mt-0.5 text-xs font-medium text-slate-400">
                                {nickname}
                              </p>
                            )}

                            <p className="mt-2 text-xs font-medium text-slate-400">
                              {formatDate(contribution.created_at)}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-black text-emerald-600">
                            {formatCurrency(contribution.amount)}
                          </p>
                        </div>
                      </article>
                    )
                  })}
                </div>

                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full min-w-[560px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Member
                        </th>
                        <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Amount
                        </th>
                        <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {paginatedContributions.map((contribution) => {
                        const nickname = getStringValue(
                          contribution,
                          'member_nickname',
                        )

                        return (
                          <tr
                            key={contribution.id}
                            className="transition-colors hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-950">
                                  {contribution.member_name}
                                </p>

                                <p className="mt-0.5 text-xs font-medium text-slate-400">
                                  {nickname || 'Club member'}
                                </p>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-right text-sm font-black text-emerald-600">
                              {formatCurrency(contribution.amount)}
                            </td>

                            <td className="px-5 py-4 text-right text-xs font-medium text-slate-400">
                              {formatDate(contribution.created_at)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>

                    <tfoot>
                      <tr className="border-t border-slate-100 bg-slate-50/80">
                        <td className="px-5 py-4 text-sm font-black text-slate-950">
                          Filtered total
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-black text-emerald-600">
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

        {activeList.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 lg:px-6">
            <p className="text-center text-xs font-medium text-slate-400 sm:text-left">
              Showing {startIndex + 1}-
              {Math.min(endIndex, activeList.length)} of {activeList.length}
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={!canGoPrevious}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Prev
              </button>

              <span className="min-w-16 rounded-xl bg-slate-50 px-3 py-2 text-center text-xs font-bold text-slate-500">
                {safePage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={!canGoNext}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default EyeballDetail