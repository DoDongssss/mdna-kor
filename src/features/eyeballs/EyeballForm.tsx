import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDays, MapPin, StickyNote, Type, X } from 'lucide-react'
import { eyeballSchema, type EyeballFormData } from '../../schemas/eyeball.schema'
import type { Eyeball } from '../../types/eyeballs'

interface EyeballFormProps {
  open: boolean
  eyeball?: Eyeball | null
  onSubmit: (data: EyeballFormData) => Promise<void>
  onClose: () => void
  isSubmitting: boolean
}

const EyeballForm = ({
  open,
  eyeball,
  onSubmit,
  onClose,
  isSubmitting,
}: EyeballFormProps) => {
  const isEdit = !!eyeball

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EyeballFormData>({
    resolver: zodResolver(eyeballSchema),
    defaultValues: { title: '', date: '', location: '', notes: '' },
  })

  useEffect(() => {
    if (eyeball) {
      reset({
        title: eyeball.title ?? '',
        date: eyeball.date,
        location: eyeball.location,
        notes: eyeball.notes ?? '',
      })
    } else {
      reset({ title: '', date: '', location: '', notes: '' })
    }
  }, [eyeball, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close form"
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white sm:max-h-[calc(100dvh-2rem)] sm:max-w-md sm:rounded-2xl border border-slate-200">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-sky-500">
              Eyeball Meetup
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
              {isEdit ? 'Edit eyeball' : 'New eyeball'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {isEdit ? 'Update meetup details.' : 'Schedule a new club meetup.'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
        >
          <div className="space-y-4">

            {/* Title */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-slate-400">
                Title{' '}
                <span className="font-normal normal-case tracking-normal text-slate-300">optional</span>
              </label>
              <div className={`flex items-center gap-3 rounded-xl border bg-slate-50 px-3.5 transition-all ${
                errors.title
                  ? 'border-red-200 focus-within:ring-2 focus-within:ring-red-100'
                  : 'border-slate-200 focus-within:border-sky-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100'
              }`}>
                <Type size={15} className="shrink-0 text-slate-400" />
                <input
                  {...register('title')}
                  type="text"
                  placeholder="e.g. Monthly Ride Night"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              {errors.title && (
                <p className="mt-1.5 text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-slate-400">
                Date <span className="text-red-400">*</span>
              </label>
              <div className={`flex items-center gap-3 rounded-xl border bg-slate-50 px-3.5 transition-all ${
                errors.date
                  ? 'border-red-200 focus-within:ring-2 focus-within:ring-red-100'
                  : 'border-slate-200 focus-within:border-sky-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100'
              }`}>
                <CalendarDays size={15} className="shrink-0 text-slate-400" />
                <input
                  {...register('date')}
                  type="date"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none"
                />
              </div>
              {errors.date && (
                <p className="mt-1.5 text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-slate-400">
                Location <span className="text-red-400">*</span>
              </label>
              <div className={`flex items-center gap-3 rounded-xl border bg-slate-50 px-3.5 transition-all ${
                errors.location
                  ? 'border-red-200 focus-within:ring-2 focus-within:ring-red-100'
                  : 'border-slate-200 focus-within:border-sky-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100'
              }`}>
                <MapPin size={15} className="shrink-0 text-slate-400" />
                <input
                  {...register('location')}
                  type="text"
                  placeholder="e.g. Poblacion, Libungan"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              {errors.location && (
                <p className="mt-1.5 text-xs text-red-500">{errors.location.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-slate-400">
                Notes{' '}
                <span className="font-normal normal-case tracking-normal text-slate-300">optional</span>
              </label>
              <div className={`flex items-start gap-3 rounded-xl border bg-slate-50 px-3.5 py-3 transition-all ${
                errors.notes
                  ? 'border-red-200 focus-within:ring-2 focus-within:ring-red-100'
                  : 'border-slate-200 focus-within:border-sky-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100'
              }`}>
                <StickyNote size={15} className="mt-0.5 shrink-0 text-slate-400" />
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Any additional details…"
                  className="min-w-0 flex-1 resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              {errors.notes && (
                <p className="mt-1.5 text-xs text-red-500">{errors.notes.message}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex gap-2.5 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 flex-1 items-center justify-center rounded-xl bg-sky-500 text-sm font-medium text-white transition hover:bg-sky-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? isEdit ? 'Saving…' : 'Creating…'
                : isEdit ? 'Save changes' : 'Create eyeball'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EyeballForm