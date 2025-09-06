// Minimal Supabase Database types used by the app.
// Keep this in sync with your SQL migrations. Only essential tables/columns are modeled.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          name: string | null
          email: string | null
          address: string | null
          city: string | null
          area: string | null
          building_number: string | null
          floor_number: string | null
          apartment_number: string | null
          landmark: string | null
          loyalty_points: number
          total_orders: number | null
          total_spent: number | null
          is_active: boolean | null
          is_admin: boolean | null
          birth_date: string | null
          gender: 'male' | 'female' | null
          preferred_delivery_time: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['users']['Row']> & {
          id?: string
          phone?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Row']>
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          subtotal: number
          shipping_fee: number
          discount_amount: number | null
          tax_amount: number | null
          final_amount: number
          points_earned: number
          points_used: number
          status:
            | 'PENDING'
            | 'CONFIRMED'
            | 'PREPARING'
            | 'OUT_FOR_DELIVERY'
            | 'DELIVERED'
            | 'CANCELLED'
            | 'REFUNDED'
          payment_method: string | null
          payment_status: string | null
          delivery_address: string
          delivery_city: string | null
          delivery_area: string | null
          delivery_phone: string | null
          delivery_notes: string | null
          estimated_delivery_time: string | null
          actual_delivery_time: string | null
          cancelled_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          subtotal: number
          shipping_fee: number
          discount_amount?: number | null
          tax_amount?: number | null
          final_amount: number
          points_earned?: number
          points_used?: number
          status?: Database['public']['Tables']['orders']['Row']['status']
          payment_method?: string | null
          payment_status?: string | null
          delivery_address: string
          delivery_city?: string | null
          delivery_area?: string | null
          delivery_phone?: string | null
          delivery_notes?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          cancelled_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_price: number
          quantity: number
          total_price: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_price: number
          quantity: number
          total_price: number
          created_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            referencedRelation: 'orders'
            referencedColumns: ['id']
          }
        ]
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          rating: number
          comment: string | null
          is_approved: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          rating: number
          comment?: string | null
          is_approved?: boolean
          created_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['product_reviews']['Insert']>
        Relationships: []
      }
    }
  Views: Record<string, never>
  Functions: Record<string, never>
  Enums: Record<string, never>
  CompositeTypes: Record<string, never>
  }
}
