import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema, type EventFormData } from '../../schemas/event.schema'
import type { ClubEvent } from '../../types/events'

interface EventFormProps {
  open:         boolean
  event?:       ClubEvent | null
  onSubmit:     (data: EventFormData) => Promise<void>
  onClose:      () => void
  isSubmitting: boolean
}

const EVENT_TYPES = [
  { value: 'meetup',       label: 'Meetup' },
  { value: 'charity_ride', label: 'Charity Ride' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'other',        label: 'Other' },
]

const EventForm = ({
  open,
  event,
  onSubmit,
  onClose,
  isSubmitting,
}: EventFormProps) => {
  const isEdit = !!event

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title:       '',
      type:        'announcement',
      date:        new Date().toISOString().split('T')[0],
      description: '',
      location:    '',
    },
  })

  useEffect(() => {
    if (event) {
      reset({
        title:       event.title,
        type:        event.type,
        date:        event.date,
        description: event.description ?? '',
        location:    event.location    ?? '',
      })
    } else {
      reset({
        title:       '',
        type:        'announcement',
        date:        new Date().toISOString().split('T')[0],
        description: '',
        location:    '',
      })
    }
  }, [event, reset])

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
              {isEdit ? 'Edit Event' : 'New Event'}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {isEdit ? 'Update event details' : 'Create a public club event'}
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
              placeholder="e.g. Monthly Ride, Charity Run"
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] placeholder:text-stone-300 focus:outline-none focus:border-[#1a1a18] focus:bg-white transition"
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1.5">{errors.title.message}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
              Type <span className="text-red-400">*</span>
            </label>
            <select
              {...register('type')}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] transition"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-400 text-xs mt-1.5">{errors.type.message}</p>
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

          {/* Location */}
          <div>
            <label className="block text-[11px] font-medium text-stone-400 tracking-widest uppercase mb-2">
              Location{' '}
              <span className="text-stone-300 normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <input
              {...register('location')}
              type="text"
              placeholder="e.g. Poblacion, Libungan"
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-[#1a1a18] placeholder:text-stone-300 focus:outline-none focus:border-[#1a1a18] focus:bg-white transition"
            />
            {errors.location && (
              <p className="text-red-400 text-xs mt-1.5">{errors.location.message}</p>
            )}
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
                ? isEdit ? 'Saving...'    : 'Creating...'
                : isEdit ? 'Save Changes' : 'Create Event'
              }
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EventForm