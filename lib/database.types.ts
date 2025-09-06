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
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          original_price: number | null
          images: string[] | null
          is_available: boolean
          is_featured: boolean
          unit_description: string | null
          weight: number | null
          stock_quantity: number
          min_order_quantity: number | null
          max_order_quantity: number | null
          subcategory_id: string | null
          tags: string[] | null
          nutritional_info: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['products']['Row']> & {
          id?: string
          name: string
          price: number
          is_available?: boolean
          is_featured?: boolean
          stock_quantity?: number
        }
        Update: Partial<Database['public']['Tables']['products']['Row']>
        Relationships: []
      }
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
          updated_at: string | null
          // Enhanced review fields
          store_reply: string | null
          store_reply_at: string | null
          replied_by_admin: boolean | null
          helpful_count: number | null
          not_helpful_count: number | null
          is_verified_purchase: boolean | null
          is_featured: boolean | null
          flagged_count: number | null
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          rating: number
          comment?: string | null
          is_approved?: boolean
          created_at?: string | null
          updated_at?: string | null
          store_reply?: string | null
          store_reply_at?: string | null
          replied_by_admin?: boolean | null
          helpful_count?: number | null
          not_helpful_count?: number | null
          is_verified_purchase?: boolean | null
          is_featured?: boolean | null
          flagged_count?: number | null
        }
        Update: Partial<Database['public']['Tables']['product_reviews']['Insert']>
        Relationships: []
      }
      ,
      review_votes: {
        Row: {
          id: string
          user_id: string
          review_id: string
          vote_type: 'helpful' | 'not_helpful'
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          review_id: string
          vote_type: 'helpful' | 'not_helpful'
          created_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['review_votes']['Insert']>
        Relationships: []
      }
      ,
      review_notifications: {
        Row: {
          id: string
          review_id: string
          type: 'new_review' | 'review_approved' | 'review_reported'
          read: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          review_id: string
          type: 'new_review' | 'review_approved' | 'review_reported'
          read?: boolean
          created_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['review_notifications']['Insert']>
        Relationships: []
      }
      ,
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'ORDER_UPDATE' | 'PROMOTION' | 'LOYALTY_POINTS' | 'GENERAL'
          is_read: boolean
          data: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'ORDER_UPDATE' | 'PROMOTION' | 'LOYALTY_POINTS' | 'GENERAL'
          is_read?: boolean
          data?: Json | null
          created_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      insert_review_vote: {
        Args: {
          p_user_id: string
          p_review_id: string
          p_vote_type: 'helpful' | 'not_helpful'
        }
        Returns: null
      }
      update_review_vote: {
        Args: {
          p_vote_id: string
          p_vote_type: 'helpful' | 'not_helpful'
        }
        Returns: null
      }
      delete_review_vote: {
        Args: { p_vote_id: string }
        Returns: null
      }
    }
  Enums: Record<string, never>
  CompositeTypes: Record<string, never>
  }
}
