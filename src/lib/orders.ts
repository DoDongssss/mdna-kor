import { supabase } from '../supabase/client'
import type { OrderBatch, OrderPayment, OrderItemWithDetails, OrderStatus } from '../types/orders'
import type { OrderBatchFormData, OrderItemFormData, OrderPaymentFormData } from '../schemas/order.schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const batchTable   = () => supabase.from('order_batches')  as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const itemTable    = () => supabase.from('order_items')    as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paymentTable = () => supabase.from('order_payments') as any

const computeStatus = (total: number, paid: number): OrderStatus => {
  if (paid <= 0)          return 'Unpaid'
  if (paid >= total)      return 'Paid'
  return 'Partial'
}

// ── Batches ───────────────────────────────────────────────────────

export const getOrderBatches = async (): Promise<OrderBatch[]> => {
  const { data, error } = await batchTable()
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as OrderBatch[]
}

export const getOrderBatchById = async (id: string): Promise<OrderBatch> => {
  const { data, error } = await batchTable()
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as OrderBatch
}

export const createOrderBatch = async (data: OrderBatchFormData) => {
  const { error } = await batchTable()
    .insert({
      name:           data.name,
      description:    data.description    || null,
      item_type:      data.item_type,
      price_per_unit: data.price_per_unit,
      deadline:       data.deadline       || null,
    })

  if (error) throw error
}

export const updateOrderBatch = async (id: string, data: OrderBatchFormData) => {
  const { error } = await batchTable()
    .update({
      name:           data.name,
      description:    data.description    || null,
      item_type:      data.item_type,
      price_per_unit: data.price_per_unit,
      deadline:       data.deadline       || null,
    })
    .eq('id', id)

  if (error) throw error
}

export const deleteOrderBatch = async (id: string) => {
  const { error } = await batchTable()
    .delete()
    .eq('id', id)

  if (error) throw error
}


export const getOrderItemsByBatch = async (
  batchId: string,
  pricePerUnit: number
): Promise<OrderItemWithDetails[]> => {
  const { data: items, error: itemsError } = await itemTable()
    .select('*, members(name, nickname)')
    .eq('batch_id', batchId)
    .order('created_at', { ascending: true })

  if (itemsError) throw itemsError

  const { data: payments, error: paymentsError } = await paymentTable()
    .select('*')
    .in(
      'order_item_id',
      (items as any[]).map((i: any) => i.id)
    )

  if (paymentsError) throw paymentsError

  return (items as any[]).map((item: any) => {
    const itemPayments = (payments as OrderPayment[]).filter(
      (p) => p.order_item_id === item.id
    )
    const amount_paid = itemPayments.reduce((s, p) => s + p.amount, 0)
    const total_amount = item.total_amount

    return {
      id:              item.id,
      batch_id:        item.batch_id,
      member_id:       item.member_id,
      member_name:     item.members?.name     ?? 'Unknown',
      member_nickname: item.members?.nickname ?? null,
      quantity:        item.quantity,
      total_amount,
      amount_paid,
      remaining:       total_amount - amount_paid,
      status:          computeStatus(total_amount, amount_paid),
      notes:           item.notes,
      created_at:      item.created_at,
      payments:        itemPayments,
    }
  })
}

export const createOrderItem = async (
  batchId:      string,
  pricePerUnit: number,
  data:         OrderItemFormData
) => {
  const { error } = await itemTable()
    .insert({
      batch_id:     batchId,
      member_id:    data.member_id,
      quantity:     data.quantity,
      total_amount: pricePerUnit * data.quantity,
      notes:        data.notes || null,
    })

  if (error) throw error
}

export const deleteOrderItem = async (id: string) => {
  const { error } = await itemTable()
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── Payments ──────────────────────────────────────────────────────

export const addOrderPayment = async (
  orderItemId: string,
  data:        OrderPaymentFormData
) => {
  const { error } = await paymentTable()
    .insert({
      order_item_id: orderItemId,
      amount:        data.amount,
      notes:         data.notes || null,
    })

  if (error) throw error
}

export const deleteOrderPayment = async (id: string) => {
  const { error } = await paymentTable()
    .delete()
    .eq('id', id)

  if (error) throw error
}