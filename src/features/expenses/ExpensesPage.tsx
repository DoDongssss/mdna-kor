import { useState } from 'react'
import { useExpenses } from '../../hooks/useExpenses'
import { useEyeballs } from '../../hooks/useEyeballs'
import { addExpense, updateExpense, deleteExpense } from '../../lib/expenses'
import type { Expense } from '../../types/expenses'
import type { ExpenseFormData } from '../../schemas/expense.schema'
import PageHeader     from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState     from '../../components/common/EmptyState'
import ConfirmDialog  from '../../components/common/ConfirmDialog'
import ExpenseList    from './ExpenseList'
import ExpenseForm    from './ExpenseForm'
import { formatCurrency } from '../../utils/formatCurrency'

const ExpensesPage = () => {
  const { expenses, isLoading, error, total, refetch } = useExpenses()
  const { eyeballs } = useEyeballs()

  const [formOpen, setFormOpen]               = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isSubmitting, setIsSubmitting]       = useState(false)
  const [confirmOpen, setConfirmOpen]         = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)

  // Filter state
  const [filterEyeball, setFilterEyeball]     = useState('')

  // Derived filtered list
  const filtered = expenses.filter((e) =>
    filterEyeball ? e.eyeball_id === filterEyeball : true
  )

  const filteredTotal = filtered.reduce(
    (sum: number, e: Expense) => sum + e.amount, 0
  )

  // ── Handlers ──────────────────────────────────

  const handleAdd = () => {
    setSelectedExpense(null)
    setFormOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense)
    setFormOpen(true)
  }

  const handleClose = () => {
    setFormOpen(false)
    setSelectedExpense(null)
  }

  const handleSubmit = async (data: ExpenseFormData) => {
    try {
      setIsSubmitting(true)
      if (selectedExpense) {
        await updateExpense(selectedExpense.id, data)
      } else {
        await addExpense(data)
      }
      await refetch()
      handleClose()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return
    try {
      await deleteExpense(expenseToDelete.id)
      await refetch()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setConfirmOpen(false)
      setExpenseToDelete(null)
    }
  }

  // ── Render ────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Track all club expenditures"
        action={
          <button
            onClick={handleAdd}
            className="bg-[#1a1a18] text-white text-sm px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors"
          >
            + Add Expense
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 px-5 py-4">
          <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1">
            Total Expenses
          </p>
          <p className="text-2xl font-medium text-red-500">
            {formatCurrency(total)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 px-5 py-4">
          <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1">
            Total Records
          </p>
          <p className="text-2xl font-medium text-[#1a1a18]">
            {expenses.length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-4">
        <select
          value={filterEyeball}
          onChange={(e) => setFilterEyeball(e.target.value)}
          className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] transition"
        >
          <option value="">All Eyeballs</option>
          <option value="none">Not linked to eyeball</option>
          {eyeballs.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title ?? 'Eyeball'} — {e.date}
            </option>
          ))}
        </select>
        {filterEyeball && (
          <button
            onClick={() => setFilterEyeball('')}
            className="text-sm text-stone-400 hover:text-[#1a1a18] px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filtered total */}
      {filterEyeball && (
        <div className="mb-4 px-1">
          <p className="text-xs text-stone-400">
            Showing {filtered.length} records —
            filtered total:{' '}
            <span className="text-red-500 font-medium">
              {formatCurrency(filteredTotal)}
            </span>
          </p>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState
          title="Failed to load expenses"
          description={error}
          action={
            <button
              onClick={refetch}
              className="text-sm text-stone-500 underline"
            >
              Try again
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No expenses found"
          description={
            filterEyeball
              ? 'No expenses linked to this eyeball'
              : 'Record your first club expense to get started'
          }
          action={
            !filterEyeball ? (
              <button
                onClick={handleAdd}
                className="bg-[#1a1a18] text-white text-sm px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors"
              >
                + Add Expense
              </button>
            ) : undefined
          }
        />
      ) : (
        <ExpenseList
          expenses={filtered}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Form */}
      <ExpenseForm
        open={formOpen}
        expense={selectedExpense}
        onSubmit={handleSubmit}
        onClose={handleClose}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Expense"
        description={`Are you sure you want to delete "${expenseToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false)
          setExpenseToDelete(null)
        }}
      />
    </div>
  )
}

export default ExpensesPage