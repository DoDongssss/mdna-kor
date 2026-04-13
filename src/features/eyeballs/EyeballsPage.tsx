import { useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarDays,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useEyeballs } from '../../hooks/useEyeballs'
import { getEyeballById } from '../../lib/eyeballs'
import { createEyeball, updateEyeball, deleteEyeball } from '../../lib/eyeballs'
import type { EyeballSummary, Eyeball } from '../../types/eyeballs'
import type { EyeballFormData } from '../../schemas/eyeball.schema'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EyeballCard from './EyeballCard'
import EyeballForm from './EyeballForm'

const EyeballsPage = () => {
  const { eyeballs, isLoading, error, refetch } = useEyeballs()

  const [formOpen, setFormOpen] = useState(false)
  const [selectedEyeball, setSelectedEyeball] = useState<Eyeball | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [eyeballToDelete, setEyeballToDelete] = useState<EyeballSummary | null>(null)

  const [searchTerm, setSearchTerm] = useState('')

  const filteredEyeballs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return eyeballs
    return eyeballs.filter((e) => JSON.stringify(e).toLowerCase().includes(query))
  }, [eyeballs, searchTerm])

  const handleAdd = () => {
    setSelectedEyeball(null)
    setFormOpen(true)
  }

  const handleEdit = async (eyeball: EyeballSummary) => {
    try {
      const full = await getEyeballById(eyeball.id)
      setSelectedEyeball(full)
      setFormOpen(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    }
  }

  const handleClose = () => {
    setFormOpen(false)
    setSelectedEyeball(null)
  }

  const handleSubmit = async (data: EyeballFormData) => {
    try {
      setIsSubmitting(true)
      if (selectedEyeball) {
        await updateEyeball(selectedEyeball.id, data)
      } else {
        await createEyeball(data)
      }
      await refetch()
      handleClose()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (eyeball: EyeballSummary) => {
    setEyeballToDelete(eyeball)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!eyeballToDelete) return
    try {
      await deleteEyeball(eyeballToDelete.id)
      await refetch()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setConfirmOpen(false)
      setEyeballToDelete(null)
    }
  }

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-widest text-sky-500">Eyeballs</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Club Meetups
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
            Manage meetup schedules, attendance, and contribution records.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-medium text-white transition hover:bg-sky-600 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={15} strokeWidth={2.5} />
          New eyeball
        </button>
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Stats pills */}
          <div className="flex gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-500">
                <CalendarDays size={14} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-sm font-semibold text-slate-900">{eyeballs.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                <Search size={14} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Showing</p>
                <p className="text-sm font-semibold text-slate-900">{filteredEyeballs.length}</p>
              </div>
            </div>
          </div>

          {/* Search + refresh */}
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-72 sm:flex-none">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search eyeballs…"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <button
              type="button"
              onClick={refetch}
              className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50/60 p-6">
          <div className="mx-auto max-w-sm text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-500">
              <AlertCircle size={20} />
            </div>
            <EmptyState
              title="Failed to load eyeballs"
              description={error}
              action={
                <button
                  type="button"
                  onClick={refetch}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                >
                  <RefreshCw size={14} />
                  Try again
                </button>
              }
            />
          </div>
        </div>
      ) : eyeballs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8">
          <EmptyState
            title="No eyeballs yet"
            description="Schedule your first club meetup to start tracking attendance and activity."
            action={
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 active:scale-[0.98]"
              >
                <Plus size={15} />
                New eyeball
              </button>
            }
          />
        </div>
      ) : filteredEyeballs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8">
          <EmptyState
            title="No matching eyeballs"
            description="Try a different search term or clear the search field."
            action={
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Clear search
              </button>
            }
          />
        </div>
      ) : (
        <div>
          <p className="mb-3 text-xs text-slate-400">
            {filteredEyeballs.length} {filteredEyeballs.length === 1 ? 'meetup' : 'meetups'} found
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEyeballs.map((eyeball) => (
              <EyeballCard
                key={eyeball.id}
                eyeball={eyeball}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </div>
      )}

      <EyeballForm
        open={formOpen}
        eyeball={selectedEyeball}
        onSubmit={handleSubmit}
        onClose={handleClose}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete eyeball"
        description="Are you sure you want to delete this meetup? All attendance and contributions linked to it will be affected."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false)
          setEyeballToDelete(null)
        }}
      />
    </div>
  )
}

export default EyeballsPage