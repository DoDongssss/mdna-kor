import { useEffect } from 'react'
import { useFundStore }       from '../../stores/fund.store'
import { useContributions }   from '../../hooks/useContributions'
import { useExpenses }        from '../../hooks/useExpenses'
import { useMembers }         from '../../hooks/useMembers'
import { useEyeballs }        from '../../hooks/useEyeballs'
import LoadingSpinner         from '../../components/common/LoadingSpinner'
import FundSummaryChart       from './FundSummaryChart'
import ExpenseBreakdownChart  from './ExpenseBreakdownChart'
import RecentActivityList     from './RecentActivityList'
import { formatCurrency }     from '../../utils/formatCurrency'
import { TrendingUp, TrendingDown, Users, MapPin, CalendarDays, ArrowUpRight } from 'lucide-react'

const DashboardPage = () => {
  const { totalContributions, totalExpenses, netBalance, isLoading: fundLoading, fetch } =
    useFundStore()

  const { contributions, isLoading: contribLoading } = useContributions()
  const { expenses,      isLoading: expenseLoading }  = useExpenses()
  const { members }                                   = useMembers()
  const { eyeballs }                                  = useEyeballs()

  useEffect(() => {
    fetch()
  }, [fetch])

  const activeMembers   = members.filter((m) => m.is_active).length
  const upcomingEyeball = eyeballs.find((e) => new Date(e.date) >= new Date())
  const isLoading       = fundLoading || contribLoading || expenseLoading

  return (
    <div className="space-y-7">

      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Fund Overview
          </h1>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
          Live
        </span>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Net Balance */}
            <div className={`relative overflow-hidden rounded-2xl p-5 col-span-2 lg:col-span-1 ${
              netBalance >= 0
                ? 'bg-sky-950 text-white'
                : 'bg-red-600 text-white'
            }`}>
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/5" />
              <div className="absolute -right-1 -bottom-6 h-24 w-24 rounded-full bg-white/5" />
              <p className="relative text-[10px] font-medium tracking-[0.12em] uppercase opacity-50 mb-3">
                Net Balance
              </p>
              <p className="relative text-2xl font-semibold tracking-tight leading-none mb-2">
                {formatCurrency(netBalance)}
              </p>
              <div className="relative flex items-center gap-1">
                {netBalance >= 0
                  ? <TrendingUp size={12} className="opacity-60" />
                  : <TrendingDown size={12} className="opacity-60" />
                }
                <span className="text-xs opacity-60">
                  {netBalance >= 0 ? 'Funds available' : 'Deficit'}
                </span>
              </div>
            </div>

            {/* Contributions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-slate-400">
                  Contributions
                </p>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50">
                  <TrendingUp size={11} className="text-sky-500" />
                </div>
              </div>
              <p className="text-xl font-semibold tracking-tight text-slate-950 leading-none mb-1.5">
                {formatCurrency(totalContributions)}
              </p>
              <p className="text-xs text-slate-400">{contributions.length} records</p>
            </div>

            {/* Expenses */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-slate-400">
                  Expenses
                </p>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50">
                  <TrendingDown size={11} className="text-red-400" />
                </div>
              </div>
              <p className="text-xl font-semibold tracking-tight text-slate-950 leading-none mb-1.5">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-xs text-slate-400">{expenses.length} records</p>
            </div>

            {/* Active Members */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-medium tracking-[0.12em] uppercase text-slate-400">
                  Active Members
                </p>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50">
                  <Users size={11} className="text-sky-500" />
                </div>
              </div>
              <p className="text-xl font-semibold tracking-tight text-slate-950 leading-none mb-1.5">
                {activeMembers}
              </p>
              <p className="text-xs text-slate-400">{members.length} total</p>
            </div>

          </div>

          {/* ── Upcoming eyeball banner ── */}
          {upcomingEyeball && (
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-sky-950 px-6 py-5">
              {/* Decorative rings */}
              <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 -translate-y-1/3 translate-x-1/3 rounded-full border border-white/5" />
              <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/3 translate-x-1/3 rounded-full border border-white/5" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <CalendarDays size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-slate-500 mb-1">
                      Next Eyeball
                    </p>
                    <p className="text-base font-semibold text-white leading-tight">
                      {upcomingEyeball.title ?? 'Eyeball'}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span className="text-xs text-slate-400">
                        {new Date(upcomingEyeball.date).toLocaleDateString('en-PH', {
                          weekday: 'long',
                          year:    'numeric',
                          month:   'long',
                          day:     'numeric',
                        })}
                      </span>
                      {upcomingEyeball.location && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={10} />
                          {upcomingEyeball.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:shrink-0 sm:text-right sm:flex-col sm:gap-0">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">
                      Collected
                    </p>
                    <p className="text-xl font-semibold text-white">
                      {formatCurrency(upcomingEyeball.total_collected)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Charts row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Fund summary — wider */}
            <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Contributions vs Expenses
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Monthly overview</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    Income
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    Expense
                  </span>
                </div>
              </div>
              <FundSummaryChart
                contributions={contributions}
                expenses={expenses}
              />
            </div>

            {/* Expense breakdown — narrower */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-slate-950">
                  Expense Breakdown
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">By category (top 7)</p>
              </div>
              <ExpenseBreakdownChart expenses={expenses} />
            </div>

          </div>

          {/* ── Recent activity ── */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">
                  Recent Activity
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Last 10 contributions and expenses
                </p>
              </div>
              <button
                type="button"
                className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
              >
                View all
                <ArrowUpRight size={12} />
              </button>
            </div>
            <RecentActivityList
              contributions={contributions}
              expenses={expenses}
            />
          </div>

        </>
      )}
    </div>
  )
}

export default DashboardPage