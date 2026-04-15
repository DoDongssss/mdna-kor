import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { orderItemSchema, type OrderItemFormData } from '../../schemas/order.schema'
import { useMembers } from '../../hooks/useMembers'

interface OrderItemFormProps {
  open:         boolean
  pricePerUnit: number
  existingOrderMemberIds: string[]
  onSubmit:     (data: OrderItemFormData) => Promise<void>
  onClose:      () => void
  isSubmitting: boolean
}

const OrderItemForm = ({
  open,
  pricePerUnit,
  existingOrderMemberIds,
  onSubmit,
  onClose,
  isSubmitting,
}: OrderItemFormProps) => {
  const { members } = useMembers()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<OrderItemFormData>({
    resolver: zodResolver(orderItemSchema),
    defaultValues: {
      member_id: '',
      quantity:  1,
      notes:     '',
    },
  })

  useEffect(() => {
    if (!open) {
      reset({ member_id: '', quantity: 1, notes: '' })
    }
  }, [open, reset])

  const quantity     = watch('quantity') || 1
  const totalAmount  = pricePerUnit * quantity

  // Filter out members who already have an order in this batch
  const availableMembers = members.filter(
    (m) => m.is_active && !existingOrderMemberIds.includes(m.id)
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-sm border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Add Order
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add a member to this batch
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

          {/* Member */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
              Member <span className="text-red-400">*</span>
            </label>
            {availableMembers.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">
                All active members already have an order in this batch.
              </p>
            ) : (
              <select
                {...register('member_id')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-400 transition"
              >
                <option value="">— Select member —</option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.nickname ? ` (${m.nickname})` : ''}
                  </option>
                ))}
              </select>
            )}
            {errors.member_id && (
              <p className="text-red-400 text-xs mt-1.5">{errors.member_id.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
              Quantity <span className="text-red-400">*</span>
            </label>
            <input
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              min="1"
              step="1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-400 transition"
            />
            {errors.quantity && (
              <p className="text-red-400 text-xs mt-1.5">{errors.quantity.message}</p>
            )}
          </div>

          {/* Total preview */}
          <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-sky-600 font-medium">Total Amount</span>
            <span className="text-sm font-black text-sky-700">
              ₱{totalAmount.toLocaleString()}
            </span>
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
              placeholder="e.g. Size XL"
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
              disabled={isSubmitting || availableMembers.length === 0}
              className="flex-1 px-4 py-2.5 text-sm bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Order'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default OrderItemForm