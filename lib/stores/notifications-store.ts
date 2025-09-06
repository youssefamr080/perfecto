import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import type { Notification } from "@/lib/types"

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  fetchNotifications: (userId: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async (userId: string) => {
    if (!userId) return
    const db = supabase as unknown as SupabaseClient<Database>
    const { data, error } = await db
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (!error && data) {
      const rows: Notification[] = data as unknown as Notification[]
      set({
        notifications: rows,
        unreadCount: rows.filter((n) => !n.is_read).length,
      })
    }
  },

  markAllAsRead: async (userId: string) => {
    if (!userId) return
    const db = supabase as unknown as SupabaseClient<Database>
    await db
      .from("notifications")
      .update({ is_read: true } as Database['public']['Tables']['notifications']['Update'])
      .eq("user_id", userId)
      .eq("is_read", false)
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },
}))
