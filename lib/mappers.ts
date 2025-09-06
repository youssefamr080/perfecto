import type { Order, OrderItem, Product, User } from './types'

const nowIso = () => new Date().toISOString()

export function mapDbUserToUser(row: any): User {
  return {
    id: String(row?.id ?? ''),
    phone: String(row?.phone ?? ''),
    name: String(row?.name ?? ''),
    email: row?.email ?? undefined,
    address: String(row?.address ?? ''),
    city: row?.city ?? undefined,
    area: row?.area ?? undefined,
    building_number: row?.building_number ?? undefined,
    floor_number: row?.floor_number ?? undefined,
    apartment_number: row?.apartment_number ?? undefined,
    landmark: row?.landmark ?? undefined,
    loyalty_points: Number(row?.loyalty_points ?? 0),
    total_orders: Number(row?.total_orders ?? 0),
    total_spent: Number(row?.total_spent ?? 0),
    is_active: Boolean(row?.is_active ?? true),
    is_admin: row?.is_admin ?? undefined,
    birth_date: row?.birth_date ?? undefined,
    gender: row?.gender ?? undefined,
    preferred_delivery_time: row?.preferred_delivery_time ?? undefined,
    notes: row?.notes ?? undefined,
    created_at: String(row?.created_at ?? nowIso()),
    updated_at: String(row?.updated_at ?? nowIso()),
  }
}

export function mapDbProductToProduct(row: any): Product {
  const images = Array.isArray(row?.images) ? (row.images as string[]) : []
  return {
    id: String(row?.id ?? ''),
    name: String(row?.name ?? ''),
    description: String(row?.description ?? ''),
    price: Number(row?.price ?? 0),
    original_price: row?.original_price ?? undefined,
    images,
    is_available: Boolean(row?.is_available ?? true),
    is_featured: Boolean(row?.is_featured ?? false),
    unit_description: String(row?.unit_description ?? ''),
    weight: row?.weight ?? undefined,
    stock_quantity: Number(row?.stock_quantity ?? 0),
    min_order_quantity: Number(row?.min_order_quantity ?? 1),
    max_order_quantity: Number(row?.max_order_quantity ?? 9999),
    subcategory_id: String(row?.subcategory_id ?? ''),
    tags: (Array.isArray(row?.tags) ? row.tags : []) as string[],
    nutritional_info: row?.nutritional_info ?? null,
    created_at: String(row?.created_at ?? nowIso()),
    updated_at: String(row?.updated_at ?? nowIso()),
    subcategory: row?.subcategory ?? undefined,
  }
}

function mapDbOrderItemToOrderItem(item: any, parentOrder: any): OrderItem {
  const product = item?.product ? mapDbProductToProduct(item.product) : undefined
  const quantity = Number(item?.quantity ?? 0)
  const product_price = Number(item?.product_price ?? item?.price ?? 0)
  const total_price = Number(item?.total_price ?? product_price * quantity)
  return {
    id: String(item?.id ?? `${parentOrder?.id ?? 'order'}-${item?.product_id ?? 'product'}-${Math.random().toString(36).slice(2, 8)}`),
    order_id: String(item?.order_id ?? parentOrder?.id ?? ''),
    product_id: String(item?.product_id ?? ''),
    product_name: String(item?.product_name ?? item?.product?.name ?? 'منتج'),
    product_price,
    quantity,
    total_price,
    created_at: String(item?.created_at ?? parentOrder?.created_at ?? nowIso()),
    product,
  }
}

export function mapDbOrderToOrder(row: any): Order {
  const user = row?.user || row?.users ? mapDbUserToUser(row.user || row.users) : undefined
  const itemsSrc = Array.isArray(row?.order_items) ? row.order_items : []
  const order_items = itemsSrc.map((i: any) => mapDbOrderItemToOrderItem(i, row))
  return {
    id: String(row?.id ?? ''),
    order_number: String(row?.order_number ?? ''),
    user_id: String(row?.user_id ?? ''),
    subtotal: Number(row?.subtotal ?? 0),
    shipping_fee: Number(row?.shipping_fee ?? 0),
    discount_amount: Number(row?.discount_amount ?? 0),
    tax_amount: Number(row?.tax_amount ?? 0),
    final_amount: Number(row?.final_amount ?? 0),
    points_earned: Number(row?.points_earned ?? 0),
    points_used: Number(row?.points_used ?? 0),
    status: (row?.status ?? 'PENDING') as Order['status'],
    payment_method: String(row?.payment_method ?? 'CASH_ON_DELIVERY'),
    payment_status: String(row?.payment_status ?? 'PENDING'),
    delivery_address: String(row?.delivery_address ?? ''),
    delivery_city: row?.delivery_city ?? undefined,
    delivery_area: row?.delivery_area ?? undefined,
    delivery_phone: row?.delivery_phone ?? undefined,
    delivery_notes: row?.delivery_notes ?? undefined,
    estimated_delivery_time: row?.estimated_delivery_time ?? undefined,
    actual_delivery_time: row?.actual_delivery_time ?? undefined,
    cancelled_reason: row?.cancelled_reason ?? undefined,
    cancelled_at: row?.cancelled_at ?? undefined,
    created_at: String(row?.created_at ?? nowIso()),
    updated_at: String(row?.updated_at ?? nowIso()),
    user,
    order_items,
  }
}
