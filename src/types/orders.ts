export type ItemType = 'Jersey' | 'T-shirt' | 'Cap' | 'Sticker' | 'Other'

export type OrderStatus = 'Unpaid' | 'Partial' | 'Paid'

export interface OrderBatch {
  id:             string
  name:           string
  description:    string | null
  item_type:      ItemType
  price_per_unit: number
  deadline:       string | null
  created_at:     string
}

export interface OrderItem {
  id:           string
  batch_id:     string
  member_id:    string
  quantity:     number
  total_amount: number
  notes:        string | null
  created_at:   string
}

export interface OrderPayment {
  id:            string
  order_item_id: string
  amount:        number
  notes:         string | null
  created_at:    string
}

export interface OrderItemWithDetails {
  id:            string
  batch_id:      string
  member_id:     string
  member_name:   string
  member_nickname: string | null
  quantity:      number
  total_amount:  number
  amount_paid:   number
  remaining:     number
  status:        OrderStatus
  notes:         string | null
  created_at:    string
  payments:      OrderPayment[]
}