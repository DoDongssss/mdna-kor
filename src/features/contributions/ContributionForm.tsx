import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contributionSchema, type ContributionFormData } from '../../schemas/contribution.schema'
import { useMembers } from '../../hooks/useMembers'
import { useEyeballs } from '../../hooks/useEyeballs'
import type { Contribution } from '../../types/contributions'

interface ContributionFormProps {
  open:         boolean
  contribution?: Contribution | null
  onSubmit:     (data: ContributionFormData) => Promise<void>
  onClose:      () => void
  isSubmitting: boolean
}

const PAYMENT_METHODS = ['Cash', 'GCash', 'Bank Transfer', 'Other']

const ContributionForm = ({
  open,
  contribution,
  onSubmit,
  onClose,
  isSubmitting,
}: ContributionFormProps) => {
  const isEdit = !!contribution
  const { members } = useMembers()
  const { eyeballs } = useEyeballs()

    const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    } = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
        member_id:      '',
        eyeball_id:     undefined,
        amount:         0,
        notes:          '',
        payment_method: '',
    },
    })

    useEffect(() => {
    if (contribution) {
        reset({
        member_id:      contribution.member_id,
        eyeball_id:     contribution.eyeball_id ?? undefined,
        amount:         contribution.amount,
        notes:          contribution.notes          ?? '',
        payment_method: contribution.payment_method ?? '',
        })
    } else {
        reset({
        member_id:      '',
        eyeball_id:     undefined,
        amount:         0,
        notes:          '',
        payment_method: '',
        })
    }
    }, [contribution, reset])

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
              {isEdit ? 'Edit Contribution' : 'Add Contribution'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {isEdit ? 'Update contribution record' : 'Record a fund contribution'}
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

          {/* Member */}
          <div>
            <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
              Member <span className="text-red-400">*</span>
            </label>
            <select
              {...register('member_id')}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] transition"
            >
              <option value="">— Select member —</option>
              {members
                .filter((m) => m.is_active)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.nickname ? ` (${m.nickname})` : ''}
                  </option>
                ))}
            </select>
            {errors.member_id && (
              <p className="text-red-400 text-xs mt-1.5">{errors.member_id.message}</p>
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
            min="0"
            step="1"
            placeholder="0"
            className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-4 py-2.5 text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] focus:bg-white transition"
            />
        </div>
        {errors.amount && (
            <p className="text-red-400 text-xs mt-1.5">{errors.amount.message}</p>
        )}
        </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
              Payment Method{' '}
              <span className="text-stone-300 normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <select
              {...register('payment_method')}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] transition"
            >
              <option value="">— Select method —</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
              Notes{' '}
              <span className="text-stone-300 normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Any additional details..."
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] placeholder:text-stone-300 focus:outline-none focus:border-[#1a1a18] focus:bg-white transition resize-none"
            />
            {errors.notes && (
              <p className="text-red-400 text-xs mt-1.5">{errors.notes.message}</p>
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
                : isEdit ? 'Save Changes' : 'Add Contribution'
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default ContributionForm