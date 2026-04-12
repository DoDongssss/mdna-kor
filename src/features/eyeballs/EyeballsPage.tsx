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
  const [eyeballToDelete, setEyeballToDelete] =
    useState<EyeballSummary | null>(null)

  const [searchTerm, setSearchTerm] = useState('')

  const filteredEyeballs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) return eyeballs

    return eyeballs.filter((eyeball) =>
      JSON.stringify(eyeball).toLowerCase().includes(query),
    )
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
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500">
            Eyeballs
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Club Meetups
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Manage meetup schedules, attendance, and related contribution
            records.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-all hover:bg-sky-700 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={16} strokeWidth={2.4} />
          New Eyeball
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-4 lg:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 sm:rounded-2xl sm:px-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 sm:h-9 sm:w-9">
                  <CalendarDays size={16} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-slate-400 sm:text-xs">
                    Total meetups
                  </p>
                  <p className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                    {eyeballs.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 sm:rounded-2xl sm:px-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 sm:h-9 sm:w-9">
                  <Search size={16} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-slate-400 sm:text-xs">
                    Showing
                  </p>
                  <p className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                    {filteredEyeballs.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="relative w-full lg:w-80">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search eyeballs..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <button
              type="button"
              onClick={refetch}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-950 sm:w-auto"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="flex min-h-65 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm sm:min-h-80 sm:rounded-3xl">
          <LoadingSpinner />
        </section>
      ) : error ? (
        <section className="rounded-2xl border border-red-100 bg-red-50/70 p-5 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertCircle size={22} />
            </div>

            <EmptyState
              title="Failed to load eyeballs"
              description={error}
              action={
                <button
                  type="button"
                  onClick={refetch}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <RefreshCw size={15} />
                  Try again
                </button>
              }
            />
          </div>
        </section>
      ) : eyeballs.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
          <EmptyState
            title="No eyeballs yet"
            description="Schedule your first club meetup to start tracking attendance and activity."
            action={
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-all hover:bg-sky-700 active:scale-[0.98]"
              >
                <Plus size={16} />
                New Eyeball
              </button>
            }
          />
        </section>
      ) : filteredEyeballs.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
          <EmptyState
            title="No matching eyeballs"
            description="Try a different search term or clear the search field."
            action={
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                Clear search
              </button>
            }
          />
        </section>
      ) : (
        <section>
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">
              {filteredEyeballs.length}{' '}
              {filteredEyeballs.length === 1 ? 'meetup' : 'meetups'} found
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {filteredEyeballs.map((eyeball) => (
              <EyeballCard
                key={eyeball.id}
                eyeball={eyeball}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </section>
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
        title="Delete Eyeball"
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