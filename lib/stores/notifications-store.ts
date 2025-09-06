import { create } from "zustand"
import { supabase } from "@/lib/supabase"
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
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (!error && data) {
      const rows: Notification[] = data as Notification[]
      set({
        notifications: rows,
        unreadCount: rows.filter((n) => !n.is_read).length,
      })
    }
  },

  markAllAsRead: async (userId: string) => {
    if (!userId) return
    // database.types doesn't include notifications table; use loose typed helper
    // Minimal fluent interface typings to avoid explicit any
    interface EqBuilder { eq: (col: string, val: string | boolean) => EqBuilder }
    interface UpdateBuilder { update: (vals: { is_read: boolean }) => EqBuilder }
    interface FromBuilder { from: (table: string) => UpdateBuilder }
    const typed = supabase as unknown as FromBuilder
    typed
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },
}))
