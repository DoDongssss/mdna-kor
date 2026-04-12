import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { expenseSchema, type ExpenseFormData } from '../../schemas/expense.schema'
import { useEyeballs } from '../../hooks/useEyeballs'
import type { Expense } from '../../types/expenses'

interface ExpenseFormProps {
  open:         boolean
  expense?:     Expense | null
  onSubmit:     (data: ExpenseFormData) => Promise<void>
  onClose:      () => void
  isSubmitting: boolean
}

const ExpenseForm = ({
  open,
  expense,
  onSubmit,
  onClose,
  isSubmitting,
}: ExpenseFormProps) => {
  const isEdit = !!expense
  const { eyeballs } = useEyeballs()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title:       '',
      amount:      0,
      description: '',
      date:        new Date().toISOString().split('T')[0],
      eyeball_id:  undefined,
    },
  })

  useEffect(() => {
    if (expense) {
      reset({
        title:       expense.title,
        amount:      expense.amount,
        description: expense.description ?? '',
        date:        expense.date,
        eyeball_id:  expense.eyeball_id   ?? undefined,
      })
    } else {
      reset({
        title:       '',
        amount:      0,
        description: '',
        date:        new Date().toISOString().split('T')[0],
        eyeball_id:  undefined,
      })
    }
  }, [expense, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md border border-stone-200 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-medium text-[#1a1a18]">
              {isEdit ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {isEdit ? 'Update expense record' : 'Record a club expense'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-300 hover:text-stone-500 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

          {/* Title */}
          <div>
            <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register('title')}
              type="text"
              placeholder="e.g. Venue rental, Food, Fuel"
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] placeholder:text-stone-300 focus:outline-none focus:border-[#1a1a18] focus:bg-white transition"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1.5">{errors.title.message}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
              Amount <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                ₱
              </span>
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                min="1"
                step="1"
                placeholder="0"
                className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-4 py-2.5 text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] focus:bg-white transition"
              />
            </div>
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1.5">{errors.amount.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
              Date <span className="text-red-400">*</span>
            </label>
            <input
              {...register('date')}
              type="date"
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] focus:bg-white transition"
            />
            {errors.date && (
              <p className="text-red-400 text-xs mt-1.5">{errors.date.message}</p>
            )}
          </div>

          {/* Eyeball — optional */}
          <div>
            <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
              Eyeball{' '}
              <span className="text-stone-300 normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <select
              {...register('eyeball_id')}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] transition"
            >
              <option value="">— Not linked to a meetup —</option>
              {eyeballs.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title ?? 'Eyeball'} — {e.date} · {e.location}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
              Description{' '}
              <span className="text-stone-300 normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Any additional details..."
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] placeholder:text-stone-300 focus:outline-none focus:border-[#1a1a18] focus:bg-white transition resize-none"
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1.5">{errors.description.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm text-stone-500 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm bg-[#1a1a18] text-white rounded-lg hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? isEdit ? 'Saving...'    : 'Adding...'
                : isEdit ? 'Save Changes' : 'Add Expense'
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default ExpenseForm