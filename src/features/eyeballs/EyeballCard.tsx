import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Pencil,
  Trash2,
  Users,
  UserX,
  Wallet,
} from 'lucide-react'
import type { EyeballSummary } from '../../types/eyeballs'
import { formatDate } from '../../utils/formatDate'
import { formatCurrency } from '../../utils/formatCurrency'

interface EyeballCardProps {
  eyeball: EyeballSummary
  onEdit: (eyeball: EyeballSummary) => void
  onDelete: (eyeball: EyeballSummary) => void
}

const EyeballCard = ({ eyeball, onEdit, onDelete }: EyeballCardProps) => {
  const navigate = useNavigate()

  const openDetails = () => {
    navigate(`/admin/eyeballs/${eyeball.id}`)
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-sky-100 hover:shadow-md hover:shadow-slate-200/70 sm:rounded-3xl">
      <button
        type="button"
        onClick={openDetails}
        className="flex flex-1 flex-col p-4 text-left sm:p-5"
      >
        <div className="mb-4 flex items-start justify-between gap-3 sm:mb-5">
          <div className="min-w-0 flex-1">
            <span className="mb-2 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-sky-600 ring-1 ring-sky-100 sm:text-[10px]">
              Eyeball
            </span>

            <h3 className="wrap-break-word text-base font-black tracking-tight text-slate-950">
              {eyeball.title || 'Eyeball'}
            </h3>

            <div className="mt-2 flex min-w-0 items-center gap-2 text-xs font-medium text-slate-400">
              <CalendarDays size={14} className="shrink-0" />
              <span className="min-w-0 truncate">
                {formatDate(eyeball.date)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Edit eyeball"
              onClick={(event) => {
                event.stopPropagation()
                onEdit(eyeball)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Pencil size={15} />
            </button>

            <button
              type="button"
              aria-label="Delete eyeball"
              onClick={(event) => {
                event.stopPropagation()
                onDelete(eyeball)
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 transition hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm font-medium text-slate-600 sm:mb-5">
          <MapPin size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <span className="min-w-0 wrap-break-word">{eyeball.location}</span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white px-2 py-3 text-center sm:rounded-2xl">
            <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Users size={14} />
            </div>

            <p className="text-base font-black text-slate-950">
              {eyeball.present_count}
            </p>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">
              Present
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white px-2 py-3 text-center sm:rounded-2xl">
            <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <UserX size={14} />
            </div>

            <p className="text-base font-black text-slate-950">
              {eyeball.absent_count}
            </p>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">
              Absent
            </p>
          </div>

          <div className="col-span-2 rounded-xl border border-slate-100 bg-white px-2 py-3 text-center sm:col-span-1 sm:rounded-2xl">
            <div className="mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet size={14} />
            </div>

            <p className="truncate text-sm font-black text-slate-950 sm:text-base">
              {formatCurrency(eyeball.total_collected)}
            </p>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[10px]">
              Collected
            </p>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={openDetails}
        className="flex w-full items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-3 text-sm font-bold text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 sm:px-5"
      >
        <span>View details</span>
        <ArrowRight
          size={16}
          className="shrink-0 transition group-hover:translate-x-0.5"
        />
      </button>
    </article>
  )
}

export default EyeballCard