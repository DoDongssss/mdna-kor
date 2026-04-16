import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Phone, User, UserRound, X } from 'lucide-react'
import { memberSchema, type MemberFormData } from '../../schemas/member.schema'
import type { Member } from '../../types/members'

interface MemberFormProps {
  open: boolean
  member?: Member | null
  onSubmit: (data: MemberFormData) => Promise<void>
  onClose: () => void
  isSubmitting: boolean
}

const MemberForm = ({
  open,
  member,
  onSubmit,
  onClose,
  isSubmitting,
}: MemberFormProps) => {
  const isEdit = !!member

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      nickname: '',
      contact_number: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (member) {
      reset({
        name: member.name,
        nickname: member.nickname ?? '',
        contact_number: member.contact_number ?? '',
        is_active: member.is_active,
      })
    } else {
      reset({
        name: '',
        nickname: '',
        contact_number: '',
        is_active: true,
      })
    }
  }, [member, reset, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close form"
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white sm:max-h-[calc(100dvh-2rem)] sm:max-w-md sm:rounded-2xl border border-slate-200">

        {/* Drag handle - mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-sky-500">
              Club Member
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
              {isEdit ? 'Edit member' : 'Add member'}
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">
              {isEdit ? 'Update member information.' : 'Fill in the details below.'}
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

        {/* Form body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-5"
        >
          <div className="space-y-4">

            {/* Full name */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-slate-400">
                Full name <span className="text-red-400">*</span>
              </label>
              <div
                className={`flex items-center gap-3 rounded-xl border bg-slate-50 px-3.5 transition-all ${
                  errors.name
                    ? 'border-red-200 focus-within:ring-2 focus-within:ring-red-100'
                    : 'border-slate-200 focus-within:border-sky-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100'
                }`}
              >
                <UserRound size={15} className="shrink-0 text-slate-400" />
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Juan dela Cruz"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Nickname */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-slate-400">
                Nickname{' '}
                <span className="font-normal normal-case tracking-normal text-slate-300">
                  optional
                </span>
              </label>
              <div
                className={`flex items-center gap-3 rounded-xl border bg-slate-50 px-3.5 transition-all ${
                  errors.nickname
                    ? 'border-red-200 focus-within:ring-2 focus-within:ring-red-100'
                    : 'border-slate-200 focus-within:border-sky-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100'
                }`}
              >
                <User size={15} className="shrink-0 text-slate-400" />
                <input
                  {...register('nickname')}
                  type="text"
                  placeholder="e.g. Tsupogi"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              {errors.nickname && (
                <p className="mt-1.5 text-xs text-red-500">{errors.nickname.message}</p>
              )}
            </div>

            {/* Contact number */}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-slate-400">
                Contact number{' '}
                <span className="font-normal normal-case tracking-normal text-slate-300">
                  optional
                </span>
              </label>
              <div
                className={`flex items-center gap-3 rounded-xl border bg-slate-50 px-3.5 transition-all ${
                  errors.contact_number
                    ? 'border-red-200 focus-within:ring-2 focus-within:ring-red-100'
                    : 'border-slate-200 focus-within:border-sky-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-100'
                }`}
              >
                <Phone size={15} className="shrink-0 text-slate-400" />
                <input
                  {...register('contact_number')}
                  type="text"
                  placeholder="09XX XXX XXXX"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              {errors.contact_number && (
                <p className="mt-1.5 text-xs text-red-500">{errors.contact_number.message}</p>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-medium text-slate-900">Active member</p>
                <p className="mt-0.5 text-xs leading-5 text-slate-400">
                  Inactive members won't appear in attendance lists.
                </p>
              </div>
              <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                <input
                  {...register('is_active')}
                  type="checkbox"
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-sky-500" />
                <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-6 flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-5 sm:flex-row">
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
                ? isEdit ? 'Saving…' : 'Adding…'
                : isEdit ? 'Save changes' : 'Add member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MemberForm