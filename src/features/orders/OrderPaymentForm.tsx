import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { orderPaymentSchema, type OrderPaymentFormData } from '../../schemas/order.schema'
import type { OrderItemWithDetails } from '../../types/orders'
import { formatCurrency } from '../../utils/formatCurrency'

interface OrderPaymentFormProps {
  open:         boolean
  orderItem:    OrderItemWithDetails | null
  onSubmit:     (data: OrderPaymentFormData) => Promise<void>
  onClose:      () => void
  isSubmitting: boolean
}

const OrderPaymentForm = ({
  open,
  orderItem,
  onSubmit,
  onClose,
  isSubmitting,
}: OrderPaymentFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderPaymentFormData>({
    resolver: zodResolver(orderPaymentSchema),
    defaultValues: { amount: 0, notes: '' },
  })

  useEffect(() => {
    if (!open) reset({ amount: 0, notes: '' })
  }, [open, reset])

  if (!open || !orderItem) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-sm border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Add Payment
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {orderItem.member_name}
              {orderItem.member_nickname ? ` · ${orderItem.member_nickname}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors">
            ✕
          </button>
        </div>

        {/* Balance summary */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3 text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Total</p>
              <p className="text-sm font-bold text-slate-900">
                {formatCurrency(orderItem.total_amount)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Paid</p>
              <p className="text-sm font-bold text-green-600">
                {formatCurrency(orderItem.amount_paid)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Balance</p>
              <p className="text-sm font-bold text-red-500">
                {formatCurrency(orderItem.remaining)}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
              Amount <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span>
              <input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                min="1"
                step="1"
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:bg-white transition"
              />
            </div>
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1.5">{errors.amount.message}</p>
            )}
          </div>

          {/* Quick fill buttons */}
          <div className="flex gap-2">
            {[
              { label: 'Half',    value: Math.ceil(orderItem.remaining / 2) },
              { label: 'Full',    value: orderItem.remaining },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => reset({ amount: btn.value, notes: '' })}
                className="flex-1 text-xs text-sky-600 border border-sky-200 bg-sky-50 rounded-lg py-1.5 hover:bg-sky-100 transition-colors"
              >
                {btn.label} · ₱{btn.value.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
              Notes{' '}
              <span className="text-slate-300 normal-case tracking-normal font-normal">
                (optional)
              </span>
            </label>
            <input
              {...register('notes')}
              type="text"
              placeholder="e.g. GCash payment"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-sky-400 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Record Payment'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default OrderPaymentForm