import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrderBatches } from '../../hooks/useOrderBatches'
import { createOrderBatch, updateOrderBatch, deleteOrderBatch } from '../../lib/orders'
import type { OrderBatch } from '../../types/orders'
import type { OrderBatchFormData } from '../../schemas/order.schema'
import { useAdminToast } from '../../hooks/useAdminToast'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import OrderBatchForm from './OrderBatchForm'
import {
  Plus,
  ShoppingBag,
  ChevronRight,
  Calendar,
  Tag,
} from 'lucide-react'

const ITEM_TYPE_STYLES: Record<string, string> = {
  Jersey:   'bg-sky-50 text-sky-600',
  'T-shirt':'bg-violet-50 text-violet-600',
  Cap:      'bg-amber-50 text-amber-600',
  Sticker:  'bg-green-50 text-green-600',
  Other:    'bg-slate-100 text-slate-500',
}

const OrdersPage = () => {
  const navigate               = useNavigate()
  const { toast }              = useAdminToast()
  const { batches, isLoading, error, refetch } = useOrderBatches()

  const [formOpen, setFormOpen]           = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<OrderBatch | null>(null)
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [confirmOpen, setConfirmOpen]     = useState(false)
  const [batchToDelete, setBatchToDelete] = useState<OrderBatch | null>(null)

  // ── Handlers ──────────────────────────────────

  const handleAdd = () => {
    setSelectedBatch(null)
    setFormOpen(true)
  }

  const handleEdit = (e: React.MouseEvent, batch: OrderBatch) => {
    e.stopPropagation()
    setSelectedBatch(batch)
    setFormOpen(true)
  }

  const handleClose = () => {
    setFormOpen(false)
    setSelectedBatch(null)
  }

  const handleSubmit = async (data: OrderBatchFormData) => {
    try {
      setIsSubmitting(true)
      if (selectedBatch) {
        await updateOrderBatch(selectedBatch.id, data)
        toast('Order batch updated successfully')
      } else {
        await createOrderBatch(data)
        toast('Order batch created successfully')
      }
      await refetch()
      handleClose()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err.message ?? 'Something went wrong', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, batch: OrderBatch) => {
    e.stopPropagation()
    setBatchToDelete(batch)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!batchToDelete) return
    try {
      await deleteOrderBatch(batchToDelete.id)
      toast('Order batch deleted successfully')
      await refetch()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast(err.message ?? 'Something went wrong', 'error')
    } finally {
      setConfirmOpen(false)
      setBatchToDelete(null)
    }
  }

  // ── Render ────────────────────────────────────

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-500">
            Orders
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Order Batches
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Manage club merchandise orders and track member payments per batch.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition-all hover:bg-sky-700 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={16} strokeWidth={2.4} />
          New Batch
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <ShoppingBag size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">Total Batches</p>
              <p className="text-2xl font-black tracking-tight text-slate-950">
                {batches.length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">Active</p>
              <p className="text-2xl font-black tracking-tight text-slate-950">
                {batches.filter((b) =>
                  b.deadline ? new Date(b.deadline) >= new Date() : true
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
          <EmptyState
            title="Failed to load orders"
            description={error}
            action={
              <button
                onClick={refetch}
                className="text-sm text-red-600 underline"
              >
                Try again
              </button>
            }
          />
        </div>
      ) : batches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8">
          <EmptyState
            title="No order batches yet"
            description="Create your first batch to start tracking member orders and payments."
            action={
              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
              >
                <Plus size={16} />
                New Batch
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => {
            const isOverdue = batch.deadline
              ? new Date(batch.deadline) < new Date()
              : false

            return (
              <div
                key={batch.id}
                onClick={() => navigate(`/admin/orders/${batch.id}`)}
                className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-sky-200 hover:shadow-md"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                    ITEM_TYPE_STYLES[batch.item_type] ?? ITEM_TYPE_STYLES.Other
                  }`}>
                    <Tag size={10} className="inline mr-1" />
                    {batch.item_type}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-sky-400 transition-colors"
                  />
                </div>

                {/* Batch name */}
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {batch.name}
                </h3>

                {/* Description */}
                {batch.description && (
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                    {batch.description}
                  </p>
                )}

                {/* Price */}
                <p className="text-lg font-black text-slate-950 mb-3">
                  {formatCurrency(batch.price_per_unit)}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    / unit
                  </span>
                </p>

                {/* Deadline */}
                {batch.deadline && (
                  <div className={`flex items-center gap-1.5 text-xs mb-3 ${
                    isOverdue ? 'text-red-500' : 'text-slate-400'
                  }`}>
                    <Calendar size={12} />
                    <span>
                      {isOverdue ? 'Overdue · ' : 'Deadline · '}
                      {formatDate(batch.deadline)}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-slate-50">
                  <button
                    onClick={(e) => handleEdit(e, batch)}
                    className="flex-1 text-xs text-slate-400 hover:text-slate-700 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, batch)}
                    className="flex-1 text-xs text-red-300 hover:text-red-500 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form */}
      <OrderBatchForm
        open={formOpen}
        batch={selectedBatch}
        onSubmit={handleSubmit}
        onClose={handleClose}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Order Batch"
        description={`Are you sure you want to delete "${batchToDelete?.name}"? All orders and payments in this batch will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setConfirmOpen(false)
          setBatchToDelete(null)
        }}
      />
    </div>
  )
}

export default OrdersPage