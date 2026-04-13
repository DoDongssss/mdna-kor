import { useState } from 'react'
import { useAdminToast } from '../../hooks/useAdminToast'
import { AlertCircle, Plus, RefreshCw, TrendingUp, Receipt, Filter } from 'lucide-react'
import { useContributions } from '../../hooks/useContributions'
import { useEyeballs } from '../../hooks/useEyeballs'
import { deleteContribution } from '../../lib/contributions'
import { supabase } from '../../supabase/client'
import type { ContributionWithMember } from '../../types/contributions'
import type { ContributionFormData } from '../../schemas/contribution.schema'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import ContributionList from './ContributionList'
import ContributionForm from './ContributionForm'
import { formatCurrency } from '../../utils/formatCurrency'

const ContributionsPage = () => {
  const { toast } = useAdminToast()
  const { contributions, isLoading, error, total, refetch } = useContributions()
  const { eyeballs } = useEyeballs()

  const [formOpen, setFormOpen]               = useState(false)
  const [isSubmitting, setIsSubmitting]       = useState(false)
  const [confirmOpen, setConfirmOpen]         = useState(false)
  const [contribToDelete, setContribToDelete] = useState<ContributionWithMember | null>(null)
  const [filterEyeball, setFilterEyeball]     = useState('')
  const [filterMethod, setFilterMethod]       = useState('')
  const [filtersOpen, setFiltersOpen]         = useState(false)

  const filtered = contributions
    .filter((c: ContributionWithMember) => filterEyeball ? c.eyeball_id === filterEyeball : true)
    .filter((c: ContributionWithMember) => filterMethod  ? c.payment_method === filterMethod : true)

  const filteredTotal = filtered.reduce((sum: number, c: ContributionWithMember) => sum + c.amount, 0)
  const hasFilters = !!(filterEyeball || filterMethod)

  const handleSubmit = async (data: ContributionFormData) => {
    try {
      setIsSubmitting(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('contributions') as any).insert({
        member_id:      data.member_id,
        eyeball_id:     data.eyeball_id     || null,
        amount:         data.amount,
        notes:          data.notes          || null,
        payment_method: data.payment_method || null,
      })
      if (error) throw error
      await refetch()
      setFormOpen(false)
      toast('Contribution added successfully')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err.message ?? 'Something went wrong', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (contribution: ContributionWithMember) => {
    setContribToDelete(contribution)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!contribToDelete) return
    try {
      await deleteContribution(contribToDelete.id)
      await refetch()
      toast('Contribution deleted')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err.message ?? 'Something went wrong', 'error')
    } finally {
      setConfirmOpen(false)
      setContribToDelete(null)
    }
  }

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-500">Finance</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Contributions
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
            Track all fund contributions across eyeballs and members.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-medium text-white transition hover:bg-emerald-600 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={15} strokeWidth={2.5} />
          Add contribution
        </button>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <TrendingUp size={16} />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(total)}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Total Funds</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
            <Receipt size={16} />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">
            {contributions.length}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Records</p>
        </div>
      </section>

      {/* Filters */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setFiltersOpen(v => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Filter size={14} />
            Filters
            {hasFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                {[filterEyeball, filterMethod].filter(Boolean).length}
              </span>
            )}
          </span>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {filtersOpen && (
          <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <select
                value={filterEyeball}
                onChange={(e) => setFilterEyeball(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-slate-400 transition"
              >
                <option value="">All Eyeballs</option>
                {eyeballs.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title ?? 'Eyeball'} — {e.date}
                  </option>
                ))}
              </select>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-slate-400 transition"
              >
                <option value="">All Methods</option>
                {['Cash', 'GCash', 'Bank Transfer', 'Other'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            {hasFilters && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''} ·{' '}
                  <span className="font-semibold text-emerald-600">{formatCurrency(filteredTotal)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => { setFilterEyeball(''); setFilterMethod('') }}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Content */}
      {isLoading ? (
        <section className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <LoadingSpinner />
        </section>
      ) : error ? (
        <section className="rounded-2xl border border-red-100 bg-red-50/60 p-6">
          <div className="mx-auto max-w-sm text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-500">
              <AlertCircle size={20} />
            </div>
            <EmptyState
              title="Failed to load contributions"
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
        </section>
      ) : filtered.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8">
          <EmptyState
            title="No contributions found"
            description={
              hasFilters
                ? 'Try adjusting your filters.'
                : 'Record your first contribution to get started.'
            }
            action={
              !hasFilters ? (
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 active:scale-[0.98]"
                >
                  <Plus size={15} />
                  Add contribution
                </button>
              ) : undefined
            }
          />
        </section>
      ) : (
        <ContributionList contributions={filtered} onDelete={handleDeleteClick} />
      )}

      <ContributionForm
        open={formOpen}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Contribution"
        description={`Remove contribution from ${contribToDelete?.member_name}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setConfirmOpen(false); setContribToDelete(null) }}
      />
    </div>
  )
}

export default ContributionsPage