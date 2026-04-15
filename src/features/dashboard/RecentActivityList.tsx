import type { ContributionWithMember } from '../../types/contributions'
import type { Expense } from '../../types/expenses'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate }     from '../../utils/formatDate'

interface RecentActivityListProps {
  contributions: ContributionWithMember[]
  expenses:      Expense[]
}

type ActivityItem =
  | { type: 'contribution'; date: string; label: string; amount: number }
  | { type: 'expense';      date: string; label: string; amount: number }

const RecentActivityList = ({ contributions, expenses }: RecentActivityListProps) => {
  const items: ActivityItem[] = [
    ...contributions.map((c) => ({
      type:   'contribution' as const,
      date:   c.created_at,
      label:  c.member_name,
      amount: c.amount,
    })),
    ...expenses.map((e) => ({
      type:   'expense' as const,
      date:   e.created_at,
      label:  e.title,
      amount: e.amount,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-10">
        <p className="text-sm text-slate-400">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-50">
      {items.map((item, index) => (
        <div
          key={index}
          className="group flex items-center justify-between gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          {/* Icon + label */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              item.type === 'contribution'
                ? 'bg-sky-50 text-sky-600'
                : 'bg-rose-50 text-rose-500'
            }`}>
              {item.type === 'contribution' ? '+' : '−'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {item.label}
              </p>
              <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
            </div>
          </div>

          {/* Amount + type badge */}
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className={`text-sm font-semibold tabular-nums ${
              item.type === 'contribution' ? 'text-sky-600' : 'text-rose-500'
            }`}>
              {item.type === 'contribution' ? '+' : '−'}
              {formatCurrency(item.amount)}
            </span>
            <span className={`text-[10px] font-medium uppercase tracking-wide ${
              item.type === 'contribution' ? 'text-sky-400' : 'text-rose-300'
            }`}>
              {item.type === 'contribution' ? 'contrib' : 'expense'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentActivityList