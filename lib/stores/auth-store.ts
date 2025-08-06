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

          // تنظيف رقم الهاتف
          const cleanedPhone = phone.replace(/[\s\-\(\)+]/g, '').trim()

          // البحث عن المستخدم الموجود برقم الهاتف
          const { data: existingUser, error: searchError } = await supabase
            .from("users")
            .select("*")
            .eq("phone", cleanedPhone)
            .single()

          if (searchError && searchError.code !== 'PGRST116') {
            console.error("خطأ في البحث عن المستخدم:", searchError)
            set({ isLoading: false })
            return { success: false, message: "حدث خطأ في النظام، يرجى المحاولة مرة أخرى" }
          }

          let userData: User

          if (existingUser) {
            // المستخدم موجود - تسجيل دخول مع تحديث البيانات
            const { data: updatedUser, error: updateError } = await supabase
              .from("users")
              .update({
                name: name.trim(),
                address: address.trim(),
                last_login: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("phone", cleanedPhone)
              .select()
              .single()

            if (updateError) {
              console.error("خطأ في تحديث بيانات المستخدم:", updateError)
              set({ isLoading: false })
              return { success: false, message: "فشل في تحديث البيانات" }
            }

            userData = updatedUser
            console.log("✅ تسجيل دخول لمستخدم موجود:", userData)
          } else {
            // المستخدم جديد - إنشاء حساب جديد
            const newUser = {
              phone: cleanedPhone,
              name: name.trim(),
              address: address.trim(),
              loyalty_points: 0, // بداية بـ 0 نقطة
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            }

            const { data: createdUser, error: createError } = await supabase
              .from("users")
              .insert([newUser])
              .select()
              .single()

            if (createError) {
              console.error("خطأ في إنشاء المستخدم:", createError)
              set({ isLoading: false })
              return { success: false, message: "فشل في إنشاء الحساب، يرجى المحاولة مرة أخرى" }
            }

            userData = createdUser
            console.log("✅ تم إنشاء مستخدم جديد:", userData)
          }

          // حفظ بيانات المستخدم في التطبيق
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false
          })

          const message = existingUser 
            ? `مرحباً بعودتك ${userData.name}! تم تحديث بياناتك`
            : `مرحباً ${userData.name}! تم إنشاء حسابك بنجاح`

          return { success: true, message }

        } catch (error) {
          console.error("خطأ غير متوقع في تسجيل الدخول:", error)
          set({ isLoading: false })
          return { success: false, message: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى" }
        }
      },

      register: async (userData: Partial<User>) => {
        // هذه الدالة لم تعد ضرورية لأن التسجيل يتم عبر login
        return true
      },

      logout: () => {
        // تسجيل الخروج فقط عند الطلب الصريح من المستخدم
        console.log("🚪 تسجيل خروج المستخدم")
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        })
      },

      updateProfile: async (userData: Partial<User>) => {
        try {
          const { user } = get()
          if (!user) return false

          const { data: updatedUser, error } = await supabase
            .from("users")
            .update({
              ...userData,
              updated_at: new Date().toISOString()
            })
            .eq("id", user.id)
            .select()
            .single()

          if (error) {
            console.error("خطأ في تحديث الملف الشخصي:", error)
            return false
          }

          set({ user: updatedUser })
          return true
        } catch (error) {
          console.error("خطأ في تحديث الملف الشخصي:", error)
          return false
        }
      },

      checkAuth: async () => {
        try {
          const { user } = get()
          if (!user) {
            set({ isAuthenticated: false })
            return
          }

          // التحقق من صحة بيانات المستخدم في قاعدة البيانات
          const { data: currentUser, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .eq("is_active", true)
            .single()

          if (error || !currentUser) {
            console.log("المستخدم غير موجود أو غير نشط")
            set({
              user: null,
              isAuthenticated: false
            })
            return
          }

          // تحديث بيانات المستخدم
          set({
            user: currentUser,
            isAuthenticated: true
          })
        } catch (error) {
          console.error("خطأ في التحقق من المصادقة:", error)
          set({
            user: null,
            isAuthenticated: false
          })
        }
      }
    }),
    {
      name: "auth-storage",
      // تخزين دائم - لا يتم حذف البيانات إلا عند تسجيل الخروج الصريح
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
