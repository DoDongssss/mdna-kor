import type { Expense } from '../../types/expenses'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit:   (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

const ExpenseList = ({ expenses, onEdit, onDelete }: ExpenseListProps) => {
  return (
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
            <th className="text-left text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3 hidden sm:table-cell">
              Date
            </th>
            <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
              Amount
            </th>
            <th className="text-right text-[11px] font-medium text-stone-400 tracking-widest uppercase px-5 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {expenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-stone-50 transition-colors">

              {/* Title */}
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <span className="text-xs text-red-400">−</span>
                  </div>
                  <span className="text-sm font-medium text-[#1a1a18]">
                    {expense.title}
                  </span>
                </div>
              </td>

              {/* Description */}
              <td className="px-5 py-3.5 hidden md:table-cell">
                <span className="text-sm text-stone-400 line-clamp-1">
                  {expense.description ?? '—'}
                </span>
              </td>

              {/* Date */}
              <td className="px-5 py-3.5 hidden sm:table-cell">
                <span className="text-xs text-stone-400">
                  {formatDate(expense.date)}
                </span>
              </td>

              {/* Amount */}
              <td className="px-5 py-3.5 text-right">
                <span className="text-sm font-medium text-red-500">
                  {formatCurrency(expense.amount)}
                </span>
              </td>

              {/* Actions */}
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="text-xs text-stone-400 hover:text-[#1a1a18] px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(expense)}
                    className="text-xs text-red-300 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>

            </tr>
          ))}
        </tbody>

        {/* Total row */}
        <tfoot>
          <tr className="border-t border-stone-200 bg-stone-50">
            <td colSpan={2} className="px-5 py-3 text-sm font-medium text-[#1a1a18]">
              Total
            </td>
            <td className="hidden sm:table-cell" />
            <td className="px-5 py-3 text-right text-sm font-medium text-red-500">
              {formatCurrency(
                expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0)
              )}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default ExpenseList