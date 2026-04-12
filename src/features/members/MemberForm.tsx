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
  }, [member, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close form"
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 sm:max-h-[calc(100dvh-2rem)] sm:max-w-lg sm:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500">
              Club Member
            </p>

            <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950 sm:text-xl">
              {isEdit ? 'Edit Member' : 'Add Member'}
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-400">
              {isEdit ? 'Update member information.' : 'Add a new club member.'}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Full Name <span className="text-red-400">*</span>
              </label>

              <div
                className={`flex items-center gap-3 rounded-2xl border bg-slate-50 px-3.5 transition ${
                  errors.name
                    ? 'border-red-200 focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-50'
                    : 'border-slate-200 focus-within:border-sky-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100'
                }`}
              >
                <UserRound size={16} className="shrink-0 text-slate-400" />

                <input
                  {...register('name')}
                  type="text"
                  placeholder="Juan dela Cruz"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              {errors.name && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Nickname{' '}
                <span className="font-medium normal-case tracking-normal text-slate-300">
                  optional
                </span>
              </label>

              <div
                className={`flex items-center gap-3 rounded-2xl border bg-slate-50 px-3.5 transition ${
                  errors.nickname
                    ? 'border-red-200 focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-50'
                    : 'border-slate-200 focus-within:border-sky-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100'
                }`}
              >
                <User size={16} className="shrink-0 text-slate-400" />

                <input
                  {...register('nickname')}
                  type="text"
                  placeholder="e.g. Tsupogi"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              {errors.nickname && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.nickname.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Contact Number{' '}
                <span className="font-medium normal-case tracking-normal text-slate-300">
                  optional
                </span>
              </label>

              <div
                className={`flex items-center gap-3 rounded-2xl border bg-slate-50 px-3.5 transition ${
                  errors.contact_number
                    ? 'border-red-200 focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-50'
                    : 'border-slate-200 focus-within:border-sky-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-100'
                }`}
              >
                <Phone size={16} className="shrink-0 text-slate-400" />

                <input
                  {...register('contact_number')}
                  type="text"
                  placeholder="09XX XXX XXXX"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              {errors.contact_number && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {errors.contact_number.message}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">
                    Active Member
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Inactive members will not appear in attendance lists.
                  </p>
                </div>

                <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                  <input
                    {...register('is_active')}
                    type="checkbox"
                    className="peer sr-only"
                  />

                  <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-sky-600" />

                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? isEdit
                  ? 'Saving...'
                  : 'Adding...'
                : isEdit
                  ? 'Save Changes'
                  : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MemberForm