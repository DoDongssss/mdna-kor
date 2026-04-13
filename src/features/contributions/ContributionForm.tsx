import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contributionSchema, type ContributionFormData } from '../../schemas/contribution.schema'
import { useMembers } from '../../hooks/useMembers'
import { useEyeballs } from '../../hooks/useEyeballs'
import type { Contribution } from '../../types/contributions'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'

interface ContributionFormProps {
  open:          boolean
  contribution?: Contribution | null
  onSubmit:      (data: ContributionFormData) => Promise<void>
  onClose:       () => void
  isSubmitting:  boolean
}

const PAYMENT_METHODS = ['Cash', 'GCash', 'Bank Transfer', 'Other']

const STEPS = [
  { id: 1, label: 'Member'  },
  { id: 2, label: 'Amount'  },
  { id: 3, label: 'Details' },
]

const QUICK_AMOUNTS = [50, 100, 200, 500]

const ContributionForm = ({
  open,
  contribution,
  onSubmit,
  onClose,
  isSubmitting,
}: ContributionFormProps) => {
  const isEdit = !!contribution
  const { members }  = useMembers()
  const { eyeballs } = useEyeballs()
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    setValue,
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

  const watchedMemberId      = watch('member_id')
  const watchedAmount        = watch('amount')
  const watchedPaymentMethod = watch('payment_method')
  const watchedEyeballId     = watch('eyeball_id')

  const selectedMember  = members.find(m => m.id === watchedMemberId)
  const selectedEyeball = eyeballs.find(e => e.id === watchedEyeballId)

  useEffect(() => {
    if (open) {
      if (contribution) {
        reset({
          member_id:      contribution.member_id,
          eyeball_id:     contribution.eyeball_id ?? undefined,
          amount:         contribution.amount,
          notes:          contribution.notes          ?? '',
          payment_method: contribution.payment_method ?? '',
        })
      } else {
        reset({ member_id: '', eyeball_id: undefined, amount: 0, notes: '', payment_method: '' })
      }
      setStep(1)
    }
  }, [contribution, open, reset])

  const handleNext = async () => {
    const fieldsPerStep: (keyof ContributionFormData)[][] = [
      ['member_id'],
      ['amount'],
      [],
    ]
    const valid = await trigger(fieldsPerStep[step - 1])
    if (valid) setStep(s => Math.min(3, s + 1))
  }

  if (!open) return null

  // ── Shared label style ──
  const labelCls = 'block text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-2'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92dvh]">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {isEdit ? 'Edit Contribution' : 'Add Contribution'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Step {step} of {STEPS.length} — {STEPS[step - 1].label}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-1.5 flex-1 last:flex-none">
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all
                    ${step === s.id
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : step > s.id
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider hidden sm:inline transition-colors
                    ${step === s.id ? 'text-emerald-600' : step > s.id ? 'text-emerald-400' : 'text-slate-300'}`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-px transition-colors ${step > s.id ? 'bg-emerald-200' : 'bg-slate-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-5">

            {/* ── STEP 1: Member + Eyeball ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <label className={labelCls}>
                    Member <span className="text-red-400">*</span>
                  </label>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                    {members.filter(m => m.is_active).map(m => (
                      <label
                        key={m.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                          ${watchedMemberId === m.id
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                          }`}
                      >
                        <input type="radio" value={m.id} {...register('member_id')} className="sr-only" />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-slate-600">
                            {m.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-800 truncate">{m.name}</p>
                          {m.nickname && <p className="text-xs text-slate-400 truncate">{m.nickname}</p>}
                        </div>
                        {watchedMemberId === m.id && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                            <span className="text-white text-[9px] font-bold">✓</span>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
                  {errors.member_id && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.member_id.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>
                    Eyeball <span className="text-slate-300 normal-case tracking-normal font-normal">(optional)</span>
                  </label>
                  <select
                    {...register('eyeball_id')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-slate-400 focus:bg-white transition"
                  >
                    <option value="">— Not linked to a meetup —</option>
                    {eyeballs.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title ?? 'Eyeball'} — {e.date} · {e.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ── STEP 2: Amount ── */}
            {step === 2 && (
              <div className="space-y-5">
                {/* Context bar */}
                {selectedMember && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-emerald-700">
                        {selectedMember.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">Contributing as</p>
                      <p className="text-sm font-semibold text-emerald-800 truncate">{selectedMember.name}</p>
                    </div>
                    {selectedEyeball && (
                      <div className="ml-auto shrink-0 text-right">
                        <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider">Eyeball</p>
                        <p className="text-xs font-medium text-emerald-700 truncate max-w-[100px]">
                          {selectedEyeball.title ?? 'Eyeball'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className={labelCls}>
                    Amount <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-semibold select-none">₱</span>
                    <input
                      {...register('amount', { valueAsNumber: true })}
                      type="number"
                      inputMode="numeric"
                      min="0"
                      step="1"
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-4 text-3xl font-bold text-slate-800 focus:outline-none focus:border-emerald-400 focus:bg-white transition text-center"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <p className={labelCls}>Quick amounts</p>
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_AMOUNTS.map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setValue('amount', amt)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95
                          ${watchedAmount === amt
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                      >
                        ₱{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Details ── */}
            {step === 3 && (
              <div className="space-y-5">

                {/* Summary card — always visible on step 3 */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Member</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-slate-600">
                          {selectedMember?.name.charAt(0).toUpperCase() ?? '?'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        {selectedMember?.name ?? '—'}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Amount</span>
                    <span className="text-base font-bold text-emerald-600">
                      {watchedAmount ? formatCurrency(watchedAmount) : '—'}
                    </span>
                  </div>
                  {selectedEyeball && (
                    <div className="px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Eyeball</span>
                      <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {selectedEyeball.title ?? 'Eyeball'}
                      </span>
                    </div>
                  )}
                  {watchedPaymentMethod && (
                    <div className="px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">Method</span>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {watchedPaymentMethod}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className={labelCls}>
                    Payment Method{' '}
                    <span className="text-slate-300 normal-case tracking-normal font-normal">(optional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((m) => (
                      <label
                        key={m}
                        className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-sm font-medium active:scale-95
                          ${watchedPaymentMethod === m
                            ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                      >
                        <input type="radio" value={m} {...register('payment_method')} className="sr-only" />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={labelCls}>
                    Notes{' '}
                    <span className="text-slate-300 normal-case tracking-normal font-normal">(optional)</span>
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    placeholder="Any additional details..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-slate-400 focus:bg-white transition resize-none"
                  />
                  {errors.notes && (
                    <p className="text-red-400 text-xs mt-1.5">{errors.notes.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-100 flex gap-3 bg-white">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 px-4 py-3 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all font-medium shrink-0"
              >
                <ChevronLeft size={15} />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all font-medium"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 text-sm bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 active:scale-95 transition-all font-medium"
              >
                Next
                <ChevronRight size={15} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 text-sm bg-slate-900 text-white rounded-xl hover:bg-slate-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium"
              >
                {isSubmitting
                  ? (isEdit ? 'Saving…' : 'Adding…')
                  : (isEdit ? 'Save Changes' : 'Add Contribution')
                }
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ContributionForm