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

  const openDetails = () => navigate(`/admin/eyeballs/${eyeball.id}`)

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <button
        type="button"
        onClick={openDetails}
        className="flex flex-1 flex-col p-4 text-left"
      >
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="mb-1.5 inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-medium text-sky-600">
              Eyeball
            </span>
            <h3 className="break-words text-sm font-semibold tracking-tight text-slate-950">
              {eyeball.title || 'Eyeball'}
            </h3>
            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-400">
              <CalendarDays size={12} className="shrink-0" />
              <span className="truncate">{formatDate(eyeball.date)}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Edit eyeball"
              onClick={(e) => { e.stopPropagation(); onEdit(eyeball) }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              aria-label="Delete eyeball"
              onClick={(e) => { e.stopPropagation(); onDelete(eyeball) }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
          <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-500" />
          <span className="min-w-0 break-words text-xs text-slate-600">{eyeball.location}</span>
        </div>

        {/* Stats */}
        <div className="mt-auto grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-lg border border-slate-100 bg-white py-2.5">
            <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
              <Users size={12} />
            </div>
            <p className="text-sm font-semibold text-slate-950">{eyeball.present_count}</p>
            <p className="text-[10px] text-slate-400">Present</p>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-slate-100 bg-white py-2.5">
            <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <UserX size={12} />
            </div>
            <p className="text-sm font-semibold text-slate-950">{eyeball.absent_count}</p>
            <p className="text-[10px] text-slate-400">Absent</p>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-slate-100 bg-white py-2.5">
            <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
              <Wallet size={12} />
            </div>
            <p className="truncate text-xs font-semibold text-slate-950">
              {formatCurrency(eyeball.total_collected)}
            </p>
            <p className="text-[10px] text-slate-400">Collected</p>
          </div>
        </div>
      </button>

      {/* Footer CTA */}
      <button
        type="button"
        onClick={openDetails}
        className="flex w-full items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-sky-50 hover:text-sky-600"
      >
        <span>View details</span>
        <ArrowRight size={14} className="shrink-0 transition group-hover:translate-x-0.5" />
      </button>
    </article>
  )
}

export default EyeballCard