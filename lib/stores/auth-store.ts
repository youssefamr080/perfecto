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
          // التحقق من صحة البيانات
          if (!phone || phone.length < 11) {
            set({ isLoading: false })
            return { success: false, message: "يرجى إدخال رقم هاتف صحيح (11 رقم على الأقل)" }
          }

          if (!name || name.trim().length < 2) {
            set({ isLoading: false })
            return { success: false, message: "يرجى إدخال اسم صحيح (حرفين على الأقل)" }
          }

          if (!address || address.trim().length < 10) {
            set({ isLoading: false })
            return { success: false, message: "يرجى إدخال عنوان مفصل (10 أحرف على الأقل)" }
          }

          // التحقق من أن رقم الهاتف يحتوي على أرقام فقط
          const phoneRegex = /^[0-9+\-\s()]+$/
          if (!phoneRegex.test(phone)) {
            set({ isLoading: false })
            return { success: false, message: "رقم الهاتف يجب أن يحتوي على أرقام فقط" }
          }

          // ابحث عن المستخدم برقم الهاتف فقط
          let { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("phone", phone)
            .eq("is_active", true)
            .single()

          // إذا لم يوجد المستخدم، أنشئه
          if (!user) {
            // التحقق من عدم وجود رقم الهاتف في قاعدة البيانات مسبقاً
            const { data: existingUser, error: checkError } = await supabase
              .from("users")
              .select("id, phone")
              .eq("phone", phone)
              .maybeSingle()

            if (existingUser) {
              set({ isLoading: false })
              return { success: false, message: "رقم الهاتف مُسجل مسبقاً" }
            }

            const { data: newUser, error: insertError } = await supabase
              .from("users")
              .insert({ 
                phone: phone.trim(), 
                name: name.trim(), 
                address: address.trim(), 
                is_active: true, 
                created_at: new Date().toISOString(), 
                updated_at: new Date().toISOString() 
              })
              .select()
              .single()
              
            if (insertError || !newUser) {
              console.error("Insert error:", insertError)
              set({ isLoading: false })
              return { success: false, message: "حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى" }
            }
            user = newUser
          } else {
            // تحديث بيانات المستخدم الموجود
            const { data: updatedUser, error: updateError } = await supabase
              .from("users")
              .update({ 
                name: name.trim(), 
                address: address.trim(),
                updated_at: new Date().toISOString()
              })
              .eq("id", user.id)
              .select()
              .single()

            if (updateError) {
              console.error("Update error:", updateError)
            } else if (updatedUser) {
              user = updatedUser
            }
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
          return { success: false, message: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى" }
        }
      },

      register: async (userData: Partial<User>) => {
        set({ isLoading: true })

        try {
          // التحقق من صحة البيانات
          if (!userData.phone || userData.phone.length < 11) {
            set({ isLoading: false })
            return false
          }

          if (!userData.name || userData.name.trim().length < 2) {
            set({ isLoading: false })
            return false
          }

          if (!userData.address || userData.address.trim().length < 10) {
            set({ isLoading: false })
            return false
          }

          // التحقق من عدم وجود رقم الهاتف مسبقاً
          const { data: existingUser, error: checkError } = await supabase
            .from("users")
            .select("id, phone")
            .eq("phone", userData.phone)
            .maybeSingle()

          if (existingUser) {
            set({ isLoading: false })
            return false
          }

          const { data: user, error } = await supabase
            .from("users")
            .insert({
              ...userData,
              phone: userData.phone.trim(),
              name: userData.name.trim(),
              address: userData.address.trim(),
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
