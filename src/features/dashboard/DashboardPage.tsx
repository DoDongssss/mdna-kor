import { useEffect } from 'react'
import { useFundStore }       from '../../stores/fund.store'
import { useContributions }   from '../../hooks/useContributions'
import { useExpenses }        from '../../hooks/useExpenses'
import { useMembers }         from '../../hooks/useMembers'
import { useEyeballs }        from '../../hooks/useEyeballs'
import StatCard               from '../../components/common/StatCard'
import LoadingSpinner         from '../../components/common/LoadingSpinner'
import FundSummaryChart       from './FundSummaryChart'
import ExpenseBreakdownChart  from './ExpenseBreakdownChart'
import RecentActivityList     from './RecentActivityList'
import { formatCurrency }     from '../../utils/formatCurrency'

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
  const upcomingEyeball = eyeballs.find(
    (e) => new Date(e.date) >= new Date()
  )

  const isLoading = fundLoading || contribLoading || expenseLoading

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-medium text-[#1a1a18]">Dashboard</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          MNDA SOX MC — Fund overview
        </p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Net Balance"
              value={formatCurrency(netBalance)}
              sublabel={netBalance >= 0 ? 'Funds available' : 'Deficit'}
              variant={netBalance >= 0 ? 'success' : 'danger'}
            />
            <StatCard
              label="Total Contributions"
              value={formatCurrency(totalContributions)}
              sublabel={`${contributions.length} records`}
              variant="default"
            />
            <StatCard
              label="Total Expenses"
              value={formatCurrency(totalExpenses)}
              sublabel={`${expenses.length} records`}
              variant="danger"
            />
            <StatCard
              label="Active Members"
              value={String(activeMembers)}
              sublabel={`${members.length} total`}
              variant="default"
            />
          </div>

          {/* Upcoming eyeball */}
          {upcomingEyeball && (
            <div className="bg-[#1a1a18] rounded-xl px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">
                  Next Eyeball
                </p>
                <p className="text-white text-sm font-medium">
                  {upcomingEyeball.title ?? 'Eyeball'}
                </p>
                <p className="text-stone-400 text-xs mt-0.5">
                  {new Date(upcomingEyeball.date).toLocaleDateString('en-PH', {
                    weekday: 'long',
                    year:    'numeric',
                    month:   'long',
                    day:     'numeric',
                  })} · {upcomingEyeball.location}
                </p>
              </div>
              <div className="text-right">
                <p className="text-stone-400 text-xs uppercase tracking-widest">
                  Collected
                </p>
                <p className="text-white text-lg font-medium mt-0.5">
                  {formatCurrency(upcomingEyeball.total_collected)}
                </p>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Fund summary chart */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h2 className="text-sm font-medium text-[#1a1a18] mb-1">
                Contributions vs Expenses
              </h2>
              <p className="text-xs text-stone-400 mb-4">Monthly overview</p>
              <FundSummaryChart
                contributions={contributions}
                expenses={expenses}
              />
            </div>

            {/* Expense breakdown */}
            <div className="bg-white rounded-xl border border-stone-200 p-5">
              <h2 className="text-sm font-medium text-[#1a1a18] mb-1">
                Expense Breakdown
              </h2>
              <p className="text-xs text-stone-400 mb-4">By title (top 7)</p>
              <ExpenseBreakdownChart expenses={expenses} />
            </div>

          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h2 className="text-sm font-medium text-[#1a1a18] mb-1">
              Recent Activity
            </h2>
            <p className="text-xs text-stone-400 mb-4">
              Last 10 contributions and expenses
            </p>
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