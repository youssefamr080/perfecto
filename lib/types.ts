export interface Category {
  id: string
  name: string
  description?: string
  image_url?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SubCategory {
  id: string
  name: string
  description?: string
  image_url?: string
  category_id: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  original_price?: number
  images: string[]
  is_available: boolean
  is_featured: boolean
  unit_description: string
  weight?: number
  stock_quantity: number
  min_order_quantity: number
  max_order_quantity: number
  subcategory_id: string
  tags: string[]
  nutritional_info?: any
  created_at: string
  updated_at: string
  subcategory?: SubCategory
}

export interface User {
  id: string
  phone: string
  name: string
  email?: string
  address: string
  city?: string
  area?: string
  building_number?: string
  floor_number?: string
  apartment_number?: string
  landmark?: string
  loyalty_points: number
  total_orders: number
  total_spent: number
  is_active: boolean
  birth_date?: string
  gender?: "male" | "female"
  preferred_delivery_time?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  subtotal: number
  shipping_fee: number
  discount_amount: number
  tax_amount: number
  final_amount: number
  points_earned: number
  points_used: number
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "REFUNDED"
  payment_method: string
  payment_status: string
  delivery_address: string
  delivery_city?: string
  delivery_area?: string
  delivery_phone?: string
  delivery_notes?: string
  estimated_delivery_time?: string
  actual_delivery_time?: string
  cancelled_reason?: string
  cancelled_at?: string
  created_at: string
  updated_at: string
  user?: User
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  total_price: number
  created_at: string
  product?: Product
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface LoyaltyPointsHistory {
  id: string
  user_id: string
  order_id?: string
  points_change: number
  points_balance: number
  transaction_type: "EARNED" | "REDEEMED" | "EXPIRED" | "BONUS" | "REFUND"
  description: string
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  title: string
  description?: string
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT"
  discount_value: number
  min_order_amount: number
  max_discount_amount?: number
  usage_limit?: number
  used_count: number
  is_active: boolean
  valid_from: string
  valid_until?: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: "ORDER_UPDATE" | "PROMOTION" | "LOYALTY_POINTS" | "GENERAL"
  is_read: boolean
  data?: any
  created_at: string
}
