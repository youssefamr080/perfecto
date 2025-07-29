import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase"
import type { User } from "@/lib/types"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (phone: string, name: string, address: string) => Promise<{ success: boolean; message: string }>
  register: (userData: Partial<User>) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<boolean>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phone: string, name: string, address: string) => {
        set({ isLoading: true })
        try {
          // ابحث عن المستخدم برقم الهاتف فقط
          let { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("phone", phone)
            .eq("is_active", true)
            .single()

          // إذا لم يوجد المستخدم، أنشئه
          if (!user) {
            const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert({ phone, name, address, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
              .select()
              .single()
            if (insertError || !newUser) {
              set({ isLoading: false })
              return { success: false, message: "حدث خطأ أثناء إنشاء الحساب" }
            }
            user = newUser
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
          return { success: true, message: "تم تسجيل الدخول بنجاح" }
        } catch (error) {
          console.error("Login error:", error)
          set({ isLoading: false })
          return { success: false, message: "حدث خطأ أثناء تسجيل الدخول" }
        }
      },

      register: async (userData: Partial<User>) => {
        set({ isLoading: true })

        try {
          const { data: user, error } = await supabase
            .from("users")
            .insert({
              ...userData,
              created_at: new Date().toISOString(),
              is_active: true,
            })
            .select()
            .single()

          if (error || !user) {
            set({ isLoading: false })
            return false
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })

          return true
        } catch (error) {
          console.error("Register error:", error)
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      updateProfile: async (userData: Partial<User>) => {
        const { user } = get()
        if (!user) return false

        set({ isLoading: true })

        try {
          const { data: updatedUser, error } = await supabase
            .from("users")
            .update(userData)
            .eq("id", user.id)
            .select()
            .single()

          if (error || !updatedUser) {
            set({ isLoading: false })
            return false
          }

          set({
            user: updatedUser,
            isLoading: false,
          })

          return true
        } catch (error) {
          console.error("Update profile error:", error)
          set({ isLoading: false })
          return false
        }
      },

      checkAuth: async () => {
        const { user } = get()
        if (!user) return

        try {
          const { data: currentUser, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .eq("is_active", true)
            .single()

          if (error || !currentUser) {
            get().logout()
            return
          }

          set({ user: currentUser })
        } catch (error) {
          console.error("Check auth error:", error)
          get().logout()
        }
      },
    }),
    {
      name: "perfecto-auth",
      skipHydration: false,
    },
  ),
)
