import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOrderItems } from '../../hooks/useOrderItems'
import { useAdminToast } from '../../hooks/useAdminToast'
import {
  getOrderBatchById,
  createOrderItem,
  deleteOrderItem,
  addOrderPayment,
  deleteOrderPayment,
} from '../../lib/orders'
import type { OrderBatch, OrderItemWithDetails } from '../../types/orders'
import type { OrderItemFormData, OrderPaymentFormData } from '../../schemas/order.schema'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import OrderItemForm from './OrderItemForm'
import OrderPaymentForm from './OrderPaymentForm'
import {
  Plus,
  ArrowLeft,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react'

type TabType = 'all' | 'unpaid' | 'partial' | 'paid'

const STATUS_STYLES = {
  Unpaid:  'bg-red-50 text-red-500 border border-red-100',
  Partial: 'bg-amber-50 text-amber-600 border border-amber-100',
  Paid:    'bg-green-50 text-green-600 border border-green-100',
}

const ITEMS_PER_PAGE = 10

const OrderDetail = () => {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const { toast } = useAdminToast()

  const [batch, setBatch]               = useState<OrderBatch | null>(null)
  const [batchLoading, setBatchLoading] = useState(true)
  const [expandedId, setExpandedId]     = useState<string | null>(null)
  const [activeTab, setActiveTab]       = useState<TabType>('all')
  const [search, setSearch]             = useState('')
  const [currentPage, setCurrentPage]   = useState(1)

  // Forms
  const [itemFormOpen, setItemFormOpen]           = useState(false)
  const [itemSubmitting, setItemSubmitting]         = useState(false)
  const [paymentFormOpen, setPaymentFormOpen]       = useState(false)
  const [paymentSubmitting, setPaymentSubmitting]   = useState(false)
  const [selectedItem, setSelectedItem]             = useState<OrderItemWithDetails | null>(null)

  // Confirm dialogs
  const [confirmOpen, setConfirmOpen]         = useState(false)
  const [confirmType, setConfirmType]         = useState<'item' | 'payment'>('item')
  const [itemToDelete, setItemToDelete]       = useState<OrderItemWithDetails | null>(null)
  const [paymentToDelete, setPaymentToDelete] = useState<{ id: string; amount: number } | null>(null)

  // Fetch batch
  const fetchBatch = useCallback(async () => {
    if (!id) return
    try {
      setBatchLoading(true)
      const data = await getOrderBatchById(id)
      setBatch(data)
    } catch (err: any) {
      toast(err.message ?? 'Failed to load batch', 'error')
    } finally {
      setBatchLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchBatch()
  }, [fetchBatch])

  const {
    items,
    isLoading: itemsLoading,
    refetch,
    totalExpected,
    totalCollected,
    totalRemaining,
    unpaidCount,
    partialCount,
    paidCount,
  } = useOrderItems(id ?? '', batch?.price_per_unit ?? 0)

  // Reset page on tab or search change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, search])

  // ── Filtered + paginated items ─────────────────

  const filteredItems = items
    .filter((item) => {
      if (activeTab === 'unpaid')  return item.status === 'Unpaid'
      if (activeTab === 'partial') return item.status === 'Partial'
      if (activeTab === 'paid')    return item.status === 'Paid'
      return true
    })
    .filter((item) => {
      const q = search.toLowerCase()
      return (
        item.member_name.toLowerCase().includes(q) ||
        (item.member_nickname ?? '').toLowerCase().includes(q)
      )
    })

  const totalPages     = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const existingOrderMemberIds = items.map((i) => i.member_id)

  // ── Handlers ──────────────────────────────────

  const handleAddItem = async (data: OrderItemFormData) => {
    if (!id || !batch) return
    try {
      setItemSubmitting(true)
      await createOrderItem(id, batch.price_per_unit, data)
      toast('Order added successfully')
      await refetch()
      setItemFormOpen(false)
    } catch (err: any) {
      toast(err.message ?? 'Something went wrong', 'error')
    } finally {
      setItemSubmitting(false)
    }
  }

  const handleAddPayment = async (data: OrderPaymentFormData) => {
    if (!selectedItem) return
    try {
      setPaymentSubmitting(true)
      await addOrderPayment(selectedItem.id, data)
      toast('Payment recorded successfully')
      await refetch()
      setPaymentFormOpen(false)
      setSelectedItem(null)
    } catch (err: any) {
      toast(err.message ?? 'Something went wrong', 'error')
    } finally {
      setPaymentSubmitting(false)
    }
  }

  const handleDeleteItemClick = (item: OrderItemWithDetails) => {
    setItemToDelete(item)
    setConfirmType('item')
    setConfirmOpen(true)
  }

  const handleDeletePaymentClick = (paymentId: string, amount: number) => {
    setPaymentToDelete({ id: paymentId, amount })
    setConfirmType('payment')
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    try {
      if (confirmType === 'item' && itemToDelete) {
        await deleteOrderItem(itemToDelete.id)
        toast('Order removed successfully')
      } else if (confirmType === 'payment' && paymentToDelete) {
        await deleteOrderPayment(paymentToDelete.id)
        toast('Payment deleted successfully')
      }
      await refetch()
    } catch (err: any) {
      toast(err.message ?? 'Something went wrong', 'error')
    } finally {
      setConfirmOpen(false)
      setItemToDelete(null)
      setPaymentToDelete(null)
    }
  }

  // ── Tabs ──────────────────────────────────────

  const TABS: { label: string; value: TabType; count: number }[] = [
    { label: 'All',     value: 'all',     count: items.length },
    { label: 'Unpaid',  value: 'unpaid',  count: unpaidCount },
    { label: 'Partial', value: 'partial', count: partialCount },
    { label: 'Paid',    value: 'paid',    count: paidCount },
  ]

  // ── Render ────────────────────────────────────

  if (batchLoading) return <LoadingSpinner />

  if (!batch) {
    return (
      <EmptyState
        title="Batch not found"
        description="This order batch does not exist"
        action={
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-sm text-slate-500 underline"
          >
            Back to Orders
          </button>
        }
      />
    )
  }

  const isOverdue = batch.deadline
    ? new Date(batch.deadline) < new Date()
    : false

  return (
    <div className="space-y-5">

      {/* Back */}
      <button
        onClick={() => navigate('/admin/orders')}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Orders
      </button>

      {/* Batch header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Tag size={10} />
                {batch.item_type}
              </span>
              {isOverdue && (
                <span className="text-[11px] font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                  Overdue
                </span>
              )}
            </div>
            <h1 className="text-xl font-black text-slate-950">{batch.name}</h1>
            {batch.description && (
              <p className="text-sm text-slate-400 mt-1">{batch.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-slate-950">
              {formatCurrency(batch.price_per_unit)}
            </p>
            <p className="text-xs text-slate-400">per unit</p>
          </div>
        </div>

        {batch.deadline && (
          <div className={`flex items-center gap-1.5 text-xs mb-4 ${
            isOverdue ? 'text-red-500' : 'text-slate-400'
          }`}>
            <Calendar size={12} />
            <span>Payment deadline: {formatDate(batch.deadline)}</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          <div className="text-center">
            <p className="text-lg font-black text-slate-950">
              {formatCurrency(totalExpected)}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
              Expected
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-green-600">
              {formatCurrency(totalCollected)}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
              Collected
            </p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-red-500">
              {formatCurrency(totalRemaining)}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
              Outstanding
            </p>
          </div>
        </div>
      </div>

      {/* Orders toolbar */}
      <div className="space-y-3">

        {/* Top row — tabs + add button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.value
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => setItemFormOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700 shrink-0"
          >
            <Plus size={13} strokeWidth={2.5} />
            Add Order
          </button>
        </div>

        {/* Search bar */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or nickname..."
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-sky-400 transition"
        />

        {/* Results count */}
        {search && (
          <p className="text-xs text-slate-400 px-1">
            {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{search}"
          </p>
        )}

      </div>

      {/* Orders list */}
      {itemsLoading ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <LoadingSpinner />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8">
          <EmptyState
            title={
              search
                ? `No results for "${search}"`
                : activeTab === 'all'
                ? 'No orders yet'
                : `No ${activeTab} orders`
            }
            description={
              search
                ? 'Try a different search term'
                : activeTab === 'all'
                ? 'Add members to this batch to start tracking orders.'
                : `No members with ${activeTab} status in this batch.`
            }
            action={
              !search && activeTab === 'all' ? (
                <button
                  onClick={() => setItemFormOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
                >
                  <Plus size={15} />
                  Add Order
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedItems.map((item) => {
              const isExpanded = expandedId === item.id

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Row */}
                  <div className="flex items-center gap-3 px-4 py-3.5">

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-slate-500">
                        {item.member_name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Member info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">
                          {item.member_name}
                        </p>
                        {item.member_nickname && (
                          <p className="text-xs text-slate-400">
                            {item.member_nickname}
                          </p>
                        )}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          STATUS_STYLES[item.status]
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-slate-400">
                          Qty: {item.quantity}
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          Paid: {formatCurrency(item.amount_paid)}
                        </span>
                        <span className="text-xs text-red-500 font-medium">
                          Balance: {formatCurrency(item.remaining)}
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-slate-950">
                        {formatCurrency(item.total_amount)}
                      </p>
                      <p className="text-[10px] text-slate-400">total</p>
                    </div>

                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-slate-300 hover:text-slate-500 transition-colors p-1"
                    >
                      {isExpanded
                        ? <ChevronUp size={16} />
                        : <ChevronDown size={16} />
                      }
                    </button>
                  </div>

                  {/* Expanded panel */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-4 py-4 bg-slate-50">

                      {/* Payment history */}
                      <div className="mb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Payment History
                        </p>
                        {item.payments.length === 0 ? (
                          <p className="text-xs text-slate-400 py-2">
                            No payments recorded yet
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {item.payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-slate-100"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-green-600">
                                    +{formatCurrency(payment.amount)}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-400">
                                      {formatDate(payment.created_at)}
                                    </p>
                                    {payment.notes && (
                                      <p className="text-xs text-slate-400">
                                        · {payment.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeletePaymentClick(payment.id, payment.amount)}
                                  className="text-slate-200 hover:text-red-400 transition-colors p-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {item.notes && (
                        <p className="text-xs text-slate-400 mb-3">
                          Note: {item.notes}
                        </p>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        {item.status !== 'Paid' && (
                          <button
                            onClick={() => {
                              setSelectedItem(item)
                              setPaymentFormOpen(true)
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700"
                          >
                            <Plus size={13} />
                            Add Payment
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteItemClick(item)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-100"
                        >
                          <Trash2 size={13} />
                          Remove Order
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-400">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${
                      currentPage === i + 1
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Order Form */}
      <OrderItemForm
        open={itemFormOpen}
        pricePerUnit={batch.price_per_unit}
        existingOrderMemberIds={existingOrderMemberIds}
        onSubmit={handleAddItem}
        onClose={() => setItemFormOpen(false)}
        isSubmitting={itemSubmitting}
      />

      {/* Add Payment Form */}
      <OrderPaymentForm
        open={paymentFormOpen}
        orderItem={selectedItem}
        onSubmit={handleAddPayment}
        onClose={() => {
          setPaymentFormOpen(false)
          setSelectedItem(null)
        }}
        isSubmitting={paymentSubmitting}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmType === 'item' ? 'Remove Order' : 'Delete Payment'}
        description={
          confirmType === 'item'
            ? `Remove ${itemToDelete?.member_name}'s order from this batch? All payment history will be lost.`
            : `Delete this payment of ${formatCurrency(paymentToDelete?.amount ?? 0)}? This cannot be undone.`
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmOpen(false)
          setItemToDelete(null)
          setPaymentToDelete(null)
        }}
      />
    </div>
  )
}

export default OrderDetail