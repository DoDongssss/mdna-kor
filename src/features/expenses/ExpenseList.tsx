import type { Expense } from '../../types/expenses'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import PaginatedTable, { type Column } from '../../components/common/PaginatedTable'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit:   (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

const ExpenseList = ({ expenses, onEdit, onDelete }: ExpenseListProps) => {
  const columns: Column<Expense>[] = [
    {
      key:   'title',
      label: 'Title',
      render: (e) => (
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50">
            <span className="text-xs text-red-400">−</span>
          </div>
          <span className="text-sm font-medium text-[#1a1a18]">{e.title}</span>
        </div>
      ),
    },
    {
      key:       'description',
      label:     'Description',
      className: 'hidden md:table-cell',
      render: (e) => (
        <span className="text-sm text-stone-400 line-clamp-1">{e.description ?? '—'}</span>
      ),
    },
    {
      key:       'date',
      label:     'Date',
      className: 'hidden sm:table-cell',
      render: (e) => (
        <span className="text-xs text-stone-400">{formatDate(e.date)}</span>
      ),
    },
    {
      key:   'amount',
      label: 'Amount',
      align: 'right',
      render: (e) => (
        <span className="text-sm font-medium text-red-500">{formatCurrency(e.amount)}</span>
      ),
    },
    {
      key:   'actions',
      label: 'Actions',
      align: 'right',
      render: (e) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(e)}
            className="text-xs text-stone-400 hover:text-[#1a1a18] px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(e)}
            className="text-xs text-red-300 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <PaginatedTable<Expense>
      data={expenses}
      columns={columns}
      rowKey={(e) => e.id}
      emptyTitle="No expenses found"
      emptyDescription="Record your first club expense to get started."
    />
  )
}

export default ExpenseList