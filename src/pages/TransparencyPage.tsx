import { useState, useEffect, useMemo } from 'react'
import { getContributions } from '../lib/contributions'
import { getExpenses } from '../lib/expenses'
import type { ContributionWithMember } from '../types/contributions'
import type { Expense } from '../types/expenses'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { supabase } from '../supabase/client'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

type TabType       = 'contributions' | 'expenses'
type DateRangeType = '3months' | '6months' | 'all'

const DATE_RANGES: { label: string; value: DateRangeType }[] = [
  { label: 'Last 3 months', value: '3months' },
  { label: 'Last 6 months', value: '6months' },
  { label: 'All time',      value: 'all' },
]

const getDateThreshold = (range: DateRangeType): Date | null => {
  if (range === 'all') return null
  const d = new Date()
  d.setMonth(d.getMonth() - (range === '3months' ? 3 : 6))
  return d
}

const TransparencyPage = () => {
  const [contributions, setContributions] = useState<ContributionWithMember[]>([])
  const [expenses, setExpenses]           = useState<Expense[]>([])
  const [netBalance, setNetBalance]       = useState<number>(0)
  const [totalIn, setTotalIn]             = useState<number>(0)
  const [totalOut, setTotalOut]           = useState<number>(0)
  const [isLoading, setIsLoading]         = useState(true)
  const [activeTab, setActiveTab]         = useState<TabType>('contributions')
  const [dateRange, setDateRange]         = useState<DateRangeType>('all')

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true)
        const [contribData, expenseData, fundData] = await Promise.all([
          getContributions(),
          getExpenses(),
          supabase.from('fund_summary').select('*').single(),
        ])

        setContributions(contribData)
        setExpenses(expenseData)
        setNetBalance(fundData.data?.net_balance      ?? 0)
        setTotalIn(fundData.data?.total_contributions ?? 0)
        setTotalOut(fundData.data?.total_expenses     ?? 0)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetch()
  }, [])

  // Filter by date range
  const filteredContributions = useMemo(() => {
    const threshold = getDateThreshold(dateRange)
    if (!threshold) return contributions
    return contributions.filter(
      (c) => new Date(c.created_at) >= threshold
    )
  }, [contributions, dateRange])

  const filteredExpenses = useMemo(() => {
    const threshold = getDateThreshold(dateRange)
    if (!threshold) return expenses
    return expenses.filter(
      (e) => new Date(e.date) >= threshold
    )
  }, [expenses, dateRange])

  const filteredIn  = filteredContributions.reduce((s, c) => s + c.amount, 0)
  const filteredOut = filteredExpenses.reduce((s, e) => s + e.amount, 0)

  const TABS: { label: string; value: TabType }[] = [
    { label: `Contributions (${filteredContributions.length})`, value: 'contributions' },
    { label: `Expenses (${filteredExpenses.length})`,           value: 'expenses' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] text-stone-400 tracking-widest uppercase mb-2">
          Open Books
        </p>
        <h1 className="text-2xl font-medium text-[#1a1a18]">
          Fund Transparency
        </h1>
        <p className="text-sm text-stone-400 mt-1 max-w-lg">
          Every peso contributed and spent by MNDA SOX MC is recorded here.
          No hidden transactions, no surprises.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Fund balance hero */}
          <div className="bg-[#1a1a18] rounded-2xl p-8 mb-6 text-center">
            <p className="text-[11px] text-stone-500 tracking-widest uppercase mb-2">
              Current Fund Balance
            </p>
            <p className={`text-4xl font-medium mb-1 ${
              netBalance >= 0 ? 'text-white' : 'text-red-400'
            }`}>
              {formatCurrency(netBalance)}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              {netBalance >= 0 ? 'Funds available' : 'Deficit'}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">
                  Total In
                </p>
                <p className="text-lg font-medium text-green-400">
                  {formatCurrency(totalIn)}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">
                  Total Out
                </p>
                <p className="text-lg font-medium text-red-400">
                  {formatCurrency(totalOut)}
                </p>
              </div>
            </div>
          </div>

          {/* Date range filter */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs text-stone-400">Show:</span>
            <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
              {DATE_RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setDateRange(r.value)}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    dateRange === r.value
                      ? 'bg-white text-[#1a1a18] shadow-sm'
                      : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Filtered totals */}
            {dateRange !== 'all' && (
              <div className="flex gap-3 ml-auto">
                <span className="text-xs text-green-600 font-medium">
                  +{formatCurrency(filteredIn)}
                </span>
                <span className="text-xs text-red-500 font-medium">
                  −{formatCurrency(filteredOut)}
                </span>
              </div>
            )}
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

          {/* Contributions table */}
          {activeTab === 'contributions' && (
            <>
              {filteredContributions.length === 0 ? (
                <EmptyState
                  title="No contributions in this period"
                  description="Try selecting a wider date range"
                />
              ) : (
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
                          Member
                        </th>
                        <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3 hidden sm:table-cell">
                          Method
                        </th>
                        <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
                          Amount
                        </th>
                        <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3 hidden sm:table-cell">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {filteredContributions.map((c) => (
                        <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                <span className="text-xs text-green-500">
                                  {c.member_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="text-sm text-[#1a1a18]">
                                {c.member_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 hidden sm:table-cell">
                            {c.payment_method ? (
                              <span className="text-xs bg-stone-100 text-stone-500 px-2.5 py-1 rounded-full">
                                {c.payment_method}
                              </span>
                            ) : (
                              <span className="text-sm text-stone-300">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(c.amount)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                            <span className="text-xs text-stone-400">
                              {formatDate(c.created_at)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-stone-200 bg-stone-50">
                        <td colSpan={2} className="px-5 py-3 text-sm font-medium text-[#1a1a18]">
                          Total
                        </td>
                        <td className="px-5 py-3 text-right text-sm font-medium text-green-600">
                          {formatCurrency(filteredIn)}
                        </td>
                        <td className="hidden sm:table-cell" />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Expenses table */}
          {activeTab === 'expenses' && (
            <>
              {filteredExpenses.length === 0 ? (
                <EmptyState
                  title="No expenses in this period"
                  description="Try selecting a wider date range"
                />
              ) : (
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
                          Title
                        </th>
                        <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3 hidden md:table-cell">
                          Description
                        </th>
                        <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
                          Amount
                        </th>
                        <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3 hidden sm:table-cell">
                          Date
                        </th>
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
                              <span className="text-sm font-medium text-[#1a1a18]">
                                {e.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <span className="text-sm text-stone-400 line-clamp-1">
                              {e.description ?? '—'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-sm font-medium text-red-500">
                              {formatCurrency(e.amount)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                            <span className="text-xs text-stone-400">
                              {formatDate(e.date)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-stone-200 bg-stone-50">
                        <td colSpan={2} className="px-5 py-3 text-sm font-medium text-[#1a1a18]">
                          Total
                        </td>
                        <td className="px-5 py-3 text-right text-sm font-medium text-red-500">
                          {formatCurrency(filteredOut)}
                        </td>
                        <td className="hidden sm:table-cell" />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Footer note */}
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