import type { ContributionWithMember } from '../../types/contributions'
import type { Expense } from '../../types/expenses'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

interface RecentActivityListProps {
  contributions: ContributionWithMember[]
  expenses:      Expense[]
}

type ActivityItem =
  | { type: 'contribution'; date: string; label: string; amount: number }
  | { type: 'expense';      date: string; label: string; amount: number }

const RecentActivityList = ({
  contributions,
  expenses,
}: RecentActivityListProps) => {
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
        <p className="text-sm text-stone-400">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-stone-50">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-3 hover:bg-stone-50 px-1 rounded-lg transition-colors"
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              item.type === 'contribution'
                ? 'bg-green-100'
                : 'bg-red-50'
            }`}>
              <span className={`text-xs font-medium ${
                item.type === 'contribution'
                  ? 'text-green-600'
                  : 'text-red-400'
              }`}>
                {item.type === 'contribution' ? '+' : '−'}
              </span>
            </div>
            <div>
              <p className="text-sm text-[#1a1a18]">{item.label}</p>
              <p className="text-xs text-stone-400">{formatDate(item.date)}</p>
            </div>
          </div>

          {/* Right */}
          <span className={`text-sm font-medium ${
            item.type === 'contribution'
              ? 'text-green-600'
              : 'text-red-500'
          }`}>
            {item.type === 'contribution' ? '+' : '−'}
            {formatCurrency(item.amount)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default RecentActivityList