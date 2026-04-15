import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { orderBatchSchema, type OrderBatchFormData } from '../../schemas/order.schema'
import type { OrderBatch, ItemType } from '../../types/orders'

interface OrderBatchFormProps {
  open:         boolean
  batch?:       OrderBatch | null
  onSubmit:     (data: OrderBatchFormData) => Promise<void>
  onClose:      () => void
  isSubmitting: boolean
}

const ITEM_TYPES: ItemType[] = ['Jersey', 'T-shirt', 'Cap', 'Sticker', 'Other']

const OrderBatchForm = ({
  open,
  batch,
  onSubmit,
  onClose,
  isSubmitting,
}: OrderBatchFormProps) => {
  const isEdit = !!batch

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderBatchFormData>({
    resolver: zodResolver(orderBatchSchema),
    defaultValues: {
      name:           '',
      description:    '',
      item_type:      'Jersey',
      price_per_unit: 0,
      deadline:       '',
    },
  })

  useEffect(() => {
    if (batch) {
      reset({
        name:           batch.name,
        description:    batch.description    ?? '',
        item_type:      batch.item_type,
        price_per_unit: batch.price_per_unit,
        deadline:       batch.deadline       ?? '',
      })
    } else {
      reset({
        name:           '',
        description:    '',
        item_type:      'Jersey',
        price_per_unit: 0,
        deadline:       '',
      })
    }
  }, [batch, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-md border border-slate-200 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {isEdit ? 'Edit Order Batch' : 'New Order Batch'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit ? 'Update batch details' : 'Create a new order batch'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-slate-500 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
              Batch Name <span className="text-red-400">*</span>
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="e.g. MDNA KORONADAL Jersey 2025"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-sky-400 focus:bg-white transition"
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>
            )}
          </div>

          {/* Item Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
              Item Type <span className="text-red-400">*</span>
            </label>
            <select
              {...register('item_type')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-400 transition"
            >
              {ITEM_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.item_type && (
              <p className="text-red-400 text-xs mt-1.5">{errors.item_type.message}</p>
            )}
          </div>

          {/* Price per unit */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
              Price per Unit <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                ₱
              </span>
              <input
                {...register('price_per_unit', { valueAsNumber: true })}
                type="number"
                min="1"
                step="1"
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:bg-white transition"
              />
            </div>
            {errors.price_per_unit && (
              <p className="text-red-400 text-xs mt-1.5">{errors.price_per_unit.message}</p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
              Payment Deadline{' '}
              <span className="text-slate-300 normal-case tracking-normal font-normal">
                (optional)
              </span>
            </label>
            <input
              {...register('deadline')}
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-400 focus:bg-white transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 tracking-widest uppercase mb-2">
              Description{' '}
              <span className="text-slate-300 normal-case tracking-normal font-normal">
                (optional)
              </span>
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Any additional details..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-sky-400 focus:bg-white transition resize-none"
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
              className="flex-1 px-4 py-2.5 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm bg-sky-600 text-white rounded-xl hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting
                ? isEdit ? 'Saving...'    : 'Creating...'
                : isEdit ? 'Save Changes' : 'Create Batch'
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default OrderBatchForm