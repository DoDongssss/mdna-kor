import { useState, useEffect, useMemo } from 'react'
import {
  CalendarDays,
  ChevronDown,
  MapPin,
  TrendingUp,
  Users,
  UserX,
} from 'lucide-react'
import { getContributions } from '../lib/contributions'
import { getExpenses } from '../lib/expenses'
import { supabase } from '../supabase/client'
import type { ContributionWithMember } from '../types/contributions'
import type { Expense } from '../types/expenses'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

type TabType = 'contributions' | 'expenses' | 'attendance'
type DateRangeType = '3months' | '6months' | 'all'

interface EyeballOption {
  id: string
  title: string | null
  date: string
  location: string
}

interface AttendanceRecord {
  member_id: string
  member_name: string
  member_nickname: string | null
  status: 'present' | 'absent'
}

const DATE_RANGES: { label: string; value: DateRangeType }[] = [
  { label: '3 months', value: '3months' },
  { label: '6 months', value: '6months' },
  { label: 'All time', value: 'all' },
]

const getDateThreshold = (range: DateRangeType): Date | null => {
  if (range === 'all') return null
  const d = new Date()
  d.setMonth(d.getMonth() - (range === '3months' ? 3 : 6))
  return d
}

const TransparencyPage = () => {
  const [contributions, setContributions] = useState<ContributionWithMember[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [eyeballs, setEyeballs] = useState<EyeballOption[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [netBalance, setNetBalance] = useState(0)
  const [totalIn, setTotalIn] = useState(0)
  const [totalOut, setTotalOut] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('contributions')
  const [dateRange, setDateRange] = useState<DateRangeType>('all')
  const [selectedEyeballId, setSelectedEyeballId] = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const [contribData, expenseData, fundData, eyeballData] = await Promise.all([
          getContributions(),
          getExpenses(),
          supabase.from('fund_summary').select('*').single(),
          supabase
            .from('eyeballs')
            .select('id, title, date, location')
            .order('date', { ascending: false }),
        ])
        setContributions(contribData)
        setExpenses(expenseData)
        setNetBalance(fundData.data?.net_balance ?? 0)
        setTotalIn(fundData.data?.total_contributions ?? 0)
        setTotalOut(fundData.data?.total_expenses ?? 0)
        setEyeballs(eyeballData.data ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (selectedEyeballId === 'all') {
      setAttendance([])
      return
    }
    const loadAttendance = async () => {
      try {
        setAttendanceLoading(true)
        const { data, error } = await supabase
          .from('attendance')
          .select(`member_id, status, members(name, nickname)`)
          .eq('eyeball_id', selectedEyeballId)
        if (error) throw error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAttendance((data as any[]).map((row) => ({
          member_id: row.member_id,
          member_name: row.members?.name ?? 'Unknown',
          member_nickname: row.members?.nickname ?? null,
          status: row.status,
        })))
      } catch (err) {
        console.error(err)
      } finally {
        setAttendanceLoading(false)
      }
    }
    loadAttendance()
  }, [selectedEyeballId])

  const filteredContributions = useMemo(() => {
    const threshold = getDateThreshold(dateRange)
    return contributions.filter((c) => {
      if (selectedEyeballId !== 'all' && c.eyeball_id !== selectedEyeballId) return false
      if (threshold && new Date(c.created_at) < threshold) return false
      return true
    })
  }, [contributions, dateRange, selectedEyeballId])

  const filteredExpenses = useMemo(() => {
    const threshold = getDateThreshold(dateRange)
    return expenses.filter((e) => {
      if (selectedEyeballId !== 'all' && e.eyeball_id !== selectedEyeballId) return false
      if (threshold && new Date(e.date) < threshold) return false
      return true
    })
  }, [expenses, dateRange, selectedEyeballId])

  const top10Contributors = useMemo(() =>
    [...filteredContributions].sort((a, b) => b.amount - a.amount).slice(0, 10),
    [filteredContributions]
  )

  const filteredIn = filteredContributions.reduce((s, c) => s + c.amount, 0)
  const filteredOut = filteredExpenses.reduce((s, e) => s + e.amount, 0)
  const presentMembers = attendance.filter((a) => a.status === 'present')
  const absentMembers = attendance.filter((a) => a.status === 'absent')
  const selectedEyeball = eyeballs.find((e) => e.id === selectedEyeballId)

  const TABS: { label: string; value: TabType; count: number }[] = [
    { label: 'Contributions', value: 'contributions', count: filteredContributions.length },
    { label: 'Expenses', value: 'expenses', count: filteredExpenses.length },
    ...(selectedEyeballId !== 'all'
      ? [{ label: 'Attendance', value: 'attendance' as TabType, count: attendance.length }]
      : []),
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <p className="text-[11px] text-stone-400 tracking-widest uppercase mb-1.5">Open Books</p>
        <h1 className="text-xl sm:text-2xl font-medium text-[#1a1a18]">Fund Transparency</h1>
        <p className="text-sm text-stone-400 mt-1 max-w-lg">
          Every peso contributed and spent is recorded here. No hidden transactions, no surprises.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Fund balance hero */}
          <div className="bg-[#1a1a18] rounded-2xl p-5 sm:p-8 mb-5 sm:mb-6">
            <div className="text-center mb-5 sm:mb-6">
              <p className="text-[11px] text-stone-500 tracking-widest uppercase mb-2">
                Current Fund Balance
              </p>
              <p className={`text-3xl sm:text-4xl font-medium mb-1 ${netBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                {formatCurrency(netBalance)}
              </p>
              <p className="text-xs text-stone-500">
                {netBalance >= 0 ? 'Funds available' : 'Deficit'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-white/5">
              <div className="text-center">
                <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Total In</p>
                <p className="text-base sm:text-lg font-medium text-green-400">{formatCurrency(totalIn)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Total Out</p>
                <p className="text-base sm:text-lg font-medium text-red-400">{formatCurrency(totalOut)}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 mb-5 sm:mb-6">
            {/* Eyeball selector */}
            <div className="relative w-full">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                <CalendarDays size={14} />
              </div>
              <select
                value={selectedEyeballId}
                onChange={(e) => {
                  setSelectedEyeballId(e.target.value)
                  setActiveTab('contributions')
                }}
                className="h-10 w-full appearance-none rounded-lg border border-stone-200 bg-white pl-9 pr-8 text-sm text-[#1a1a18] outline-none transition focus:border-stone-400 focus:ring-2 focus:ring-stone-100"
              >
                <option value="all">All eyeballs</option>
                {eyeballs.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title ?? 'Eyeball'} — {formatDate(e.date)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Date range + filtered totals */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
                {DATE_RANGES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setDateRange(r.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      dateRange === r.value
                        ? 'bg-white text-[#1a1a18] shadow-sm'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {dateRange !== 'all' && (
                <div className="flex gap-3">
                  <span className="text-xs text-green-600 font-medium">+{formatCurrency(filteredIn)}</span>
                  <span className="text-xs text-red-500 font-medium">−{formatCurrency(filteredOut)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Selected eyeball info strip */}
          {selectedEyeballId !== 'all' && selectedEyeball && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 mb-5 sm:mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={13} className="text-stone-400 shrink-0" />
                <span className="text-sm text-stone-600 truncate">{selectedEyeball.location}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'Collected', value: formatCurrency(filteredIn), color: 'text-green-600' },
                  { label: 'Spent', value: formatCurrency(filteredOut), color: 'text-red-500' },
                  { label: 'Present', value: String(presentMembers.length), color: 'text-[#1a1a18]' },
                  { label: 'Absent', value: String(absentMembers.length), color: 'text-[#1a1a18]' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg bg-white border border-stone-100 px-3 py-2 text-center">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                    <p className={`text-sm font-semibold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 10 contributors */}
          {selectedEyeballId !== 'all' && top10Contributors.length > 0 && (
            <div className="mb-5 sm:mb-6 rounded-xl border border-stone-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100">
                <TrendingUp size={14} className="text-stone-400" />
                <p className="text-[11px] font-medium text-stone-400 tracking-widest uppercase">
                  Top Contributors
                </p>
              </div>
              <div className="divide-y divide-stone-50">
                {top10Contributors.map((c, i) => {
                  const maxAmount = top10Contributors[0].amount
                  const pct = maxAmount > 0 ? (c.amount / maxAmount) * 100 : 0
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                      <span className={`w-5 text-center text-xs font-semibold shrink-0 ${
                        i === 0 ? 'text-amber-500' : i === 1 ? 'text-stone-400' : i === 2 ? 'text-amber-700' : 'text-stone-300'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                        <span className="text-xs text-green-500">{c.member_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm text-[#1a1a18] truncate">{c.member_name}</span>
                          <span className="text-sm font-semibold text-green-600 shrink-0">{formatCurrency(c.amount)}</span>
                        </div>
                        <div className="h-1 rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-400 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-stone-100 rounded-lg p-1 w-full sm:w-fit mb-5 sm:mb-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.value
                    ? 'bg-white text-[#1a1a18] shadow-sm'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-semibold ${
                  activeTab === tab.value ? 'bg-stone-100 text-stone-500' : 'bg-stone-200 text-stone-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Contributions */}
          {activeTab === 'contributions' && (
            filteredContributions.length === 0 ? (
              <EmptyState
                title="No contributions in this period"
                description="Try selecting a wider date range or a different eyeball."
              />
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                {/* Mobile cards */}
                <div className="divide-y divide-stone-50 sm:hidden">
                  {filteredContributions.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                          <span className="text-xs text-green-500">{c.member_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-[#1a1a18] truncate">{c.member_name}</p>
                          <p className="text-xs text-stone-400">{formatDate(c.created_at)}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(c.amount)}</p>
                        {c.payment_method && (
                          <p className="text-[10px] text-stone-400 mt-0.5">{c.payment_method}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-t border-stone-200">
                    <span className="text-sm font-medium text-[#1a1a18]">Total</span>
                    <span className="text-sm font-semibold text-green-600">{formatCurrency(filteredIn)}</span>
                  </div>
                </div>
                {/* Desktop table */}
                <table className="w-full hidden sm:table">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">Member</th>
                      <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">Method</th>
                      <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">Amount</th>
                      <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filteredContributions.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                              <span className="text-xs text-green-500">{c.member_name.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-sm text-[#1a1a18]">{c.member_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {c.payment_method ? (
                            <span className="text-xs bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full">{c.payment_method}</span>
                          ) : (
                            <span className="text-sm text-stone-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-medium text-green-600">{formatCurrency(c.amount)}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-xs text-stone-400">{formatDate(c.created_at)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-stone-200 bg-stone-50">
                      <td colSpan={2} className="px-5 py-3 text-sm font-medium text-[#1a1a18]">Total</td>
                      <td className="px-5 py-3 text-right text-sm font-medium text-green-600">{formatCurrency(filteredIn)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          )}

          {/* Expenses */}
          {activeTab === 'expenses' && (
            filteredExpenses.length === 0 ? (
              <EmptyState
                title="No expenses in this period"
                description="Try selecting a wider date range or a different eyeball."
              />
            ) : (
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                {/* Mobile cards */}
                <div className="divide-y divide-stone-50 sm:hidden">
                  {filteredExpenses.map((e) => (
                    <div key={e.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs text-red-400">−</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1a1a18] truncate">{e.title}</p>
                          {e.description && (
                            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{e.description}</p>
                          )}
                          <p className="text-xs text-stone-400 mt-0.5">{formatDate(e.date)}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-red-500 shrink-0">{formatCurrency(e.amount)}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-t border-stone-200">
                    <span className="text-sm font-medium text-[#1a1a18]">Total</span>
                    <span className="text-sm font-semibold text-red-500">{formatCurrency(filteredOut)}</span>
                  </div>
                </div>
                {/* Desktop table */}
                <table className="w-full hidden sm:table">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">Title</th>
                      <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">Description</th>
                      <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">Amount</th>
                      <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filteredExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                              <span className="text-xs text-red-400">−</span>
                            </div>
                            <span className="text-sm font-medium text-[#1a1a18]">{e.title}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-stone-400 line-clamp-1">{e.description ?? '—'}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-medium text-red-500">{formatCurrency(e.amount)}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-xs text-stone-400">{formatDate(e.date)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-stone-200 bg-stone-50">
                      <td colSpan={2} className="px-5 py-3 text-sm font-medium text-[#1a1a18]">Total</td>
                      <td className="px-5 py-3 text-right text-sm font-medium text-red-500">{formatCurrency(filteredOut)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )
          )}

          {/* Attendance */}
          {activeTab === 'attendance' && selectedEyeballId !== 'all' && (
            attendanceLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : attendance.length === 0 ? (
              <EmptyState
                title="No attendance recorded"
                description="No attendance has been marked for this eyeball yet."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Present */}
                <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100 bg-emerald-50">
                    <Users size={14} className="text-emerald-500" />
                    <p className="text-[11px] font-medium text-emerald-700 tracking-widest uppercase">Present</p>
                    <span className="ml-auto text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {presentMembers.length}
                    </span>
                  </div>
                  {presentMembers.length === 0 ? (
                    <p className="text-sm text-stone-400 text-center py-8">No present members</p>
                  ) : (
                    <ul className="divide-y divide-stone-50">
                      {presentMembers.map((m) => (
                        <li key={m.member_id} className="flex items-center gap-3 px-4 py-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                            <span className="text-xs text-emerald-500">{m.member_name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-[#1a1a18] truncate">{m.member_name}</p>
                            {m.member_nickname && (
                              <p className="text-xs text-stone-400">{m.member_nickname}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Absent */}
                <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100 bg-orange-50">
                    <UserX size={14} className="text-orange-400" />
                    <p className="text-[11px] font-medium text-orange-600 tracking-widest uppercase">Absent</p>
                    <span className="ml-auto text-xs font-semibold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
                      {absentMembers.length}
                    </span>
                  </div>
                  {absentMembers.length === 0 ? (
                    <p className="text-sm text-stone-400 text-center py-8">No absent members</p>
                  ) : (
                    <ul className="divide-y divide-stone-50">
                      {absentMembers.map((m) => (
                        <li key={m.member_id} className="flex items-center gap-3 px-4 py-3">
                          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                            <span className="text-xs text-orange-400">{m.member_name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-[#1a1a18] truncate">{m.member_name}</p>
                            {m.member_nickname && (
                              <p className="text-xs text-stone-400">{m.member_nickname}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          )}

          {/* Footer */}
          <p className="text-center text-xs text-stone-300 mt-8">
            All records are live and updated in real time.
            MDNA SOX © {new Date().getFullYear()} Build to inspire.
          </p>
        </>
      )}
    </div>
  )
}

export default TransparencyPage