import { useState } from 'react'
import { useContributions } from '../../hooks/useContributions'
import { useEyeballs } from '../../hooks/useEyeballs'
import { deleteContribution } from '../../lib/contributions'
import { supabase } from '../../supabase/client'
import type { ContributionWithMember } from '../../types/contributions'
import type { ContributionFormData } from '../../schemas/contribution.schema'
import PageHeader     from '../../components/common/PageHeader'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState     from '../../components/common/EmptyState'
import ConfirmDialog  from '../../components/common/ConfirmDialog'
import ContributionList from './ContributionList'
import ContributionForm from './ContributionForm'
import { formatCurrency } from '../../utils/formatCurrency'

const ContributionsPage = () => {
  const { contributions, isLoading, error, total, refetch } = useContributions()
  const { eyeballs } = useEyeballs()

  const [formOpen, setFormOpen]                   = useState(false)
  const [isSubmitting, setIsSubmitting]           = useState(false)
  const [confirmOpen, setConfirmOpen]             = useState(false)
  const [contribToDelete, setContribToDelete]     = useState<ContributionWithMember | null>(null)

  // Filter state
  const [filterEyeball, setFilterEyeball]         = useState('')
  const [filterMethod, setFilterMethod]           = useState('')

  // ── Derived filtered list ──────────────────────
  const filtered = contributions
    .filter((c: ContributionWithMember) => filterEyeball ? c.eyeball_id === filterEyeball : true)
    .filter((c: ContributionWithMember) => filterMethod  ? c.payment_method === filterMethod : true)

  const filteredTotal = filtered.reduce((sum: number, c: ContributionWithMember) => sum + c.amount, 0)

  // ── Handlers ──────────────────────────────────
  const handleSubmit = async (data: ContributionFormData) => {
    try {
      setIsSubmitting(true)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('contributions') as any)
        .insert({
          member_id:      data.member_id,
          eyeball_id:     data.eyeball_id     || null,
          amount:         data.amount,
          notes:          data.notes          || null,
          payment_method: data.payment_method || null,
        })
      if (error) throw error
      await refetch()
      setFormOpen(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.message)
    } finally {
      setConfirmOpen(false)
      setContribToDelete(null)
    }
  }

  // ── Render ────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Contributions"
        subtitle="All fund contributions across meetups"
        action={
          <button
            onClick={() => setFormOpen(true)}
            className="bg-[#1a1a18] text-white text-sm px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors"
          >
            + Add Contribution
          </button>
        }
      />

      {/* Summary card */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 px-5 py-4">
          <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1">
            Total Contributions
          </p>
          <p className="text-2xl font-medium text-green-600">
            {formatCurrency(total)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 px-5 py-4">
          <p className="text-[11px] text-stone-400 uppercase tracking-widest mb-1">
            Total Records
          </p>
          <p className="text-2xl font-medium text-[#1a1a18]">
            {contributions.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={filterEyeball}
          onChange={(e) => setFilterEyeball(e.target.value)}
          className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] transition"
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
          className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm text-[#1a1a18] focus:outline-none focus:border-[#1a1a18] transition"
        >
          <option value="">All Payment Methods</option>
          {['Cash', 'GCash', 'Bank Transfer', 'Other'].map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        {(filterEyeball || filterMethod) && (
          <button
            onClick={() => { setFilterEyeball(''); setFilterMethod('') }}
            className="text-sm text-stone-400 hover:text-[#1a1a18] px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Filtered total */}
      {(filterEyeball || filterMethod) && (
        <div className="mb-4 px-1">
          <p className="text-xs text-stone-400">
            Showing {filtered.length} records —
            filtered total:{' '}
            <span className="text-green-600 font-medium">
              {formatCurrency(filteredTotal)}
            </span>
          </p>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <EmptyState
          title="Failed to load contributions"
          description={error}
          action={
            <button
              onClick={refetch}
              className="text-sm text-stone-500 underline"
            >
              Try again
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No contributions found"
          description={
            filterEyeball || filterMethod
              ? 'Try adjusting your filters'
              : 'Record contributions from the Eyeball detail page or add one manually'
          }
          action={
            !filterEyeball && !filterMethod ? (
              <button
                onClick={() => setFormOpen(true)}
                className="bg-[#1a1a18] text-white text-sm px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors"
              >
                + Add Contribution
              </button>
            ) : undefined
          }
        />
      ) : (
        <ContributionList
          contributions={filtered}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Form */}
      <ContributionForm
        open={formOpen}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Contribution"
        description={`Are you sure you want to delete this contribution from ${contribToDelete?.member_name}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false)
          setContribToDelete(null)
        }}
      />
    </div>
  )
}

export default ContributionsPage