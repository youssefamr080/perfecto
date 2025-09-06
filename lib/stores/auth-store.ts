import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
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
  // Locally typed Supabase client for safe writes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...((): Record<string, unknown> => ({}))(),
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (phone: string, name: string, address: string) => {
        set({ isLoading: true })
        try {
          console.log("🔄 بدء تسجيل الدخول...")
          
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
          console.log("📱 رقم الهاتف المنظف:", cleanedPhone)

          // البحث عن المستخدم الموجود برقم الهاتف
          console.log("🔍 البحث عن المستخدم...")
          const db = supabase as unknown as SupabaseClient<Database>
          const { data: existingUser, error: searchError } = await db
            .from("users")
            .select("*")
            .eq("phone", cleanedPhone)
            .single()

          if (searchError && searchError.code !== 'PGRST116') {
            console.error("❌ خطأ في البحث عن المستخدم:", searchError)
            console.error("تفاصيل الخطأ:", {
              code: searchError.code,
              message: searchError.message,
              details: searchError.details,
              hint: searchError.hint
            })
            set({ isLoading: false })
            return { success: false, message: `خطأ في قاعدة البيانات: ${searchError.message}` }
          }

          let userData: User

          if (existingUser) {
            console.log("👤 مستخدم موجود، تحديث البيانات...")
            // المستخدم موجود - تسجيل دخول مع تحديث البيانات
            const { data: updatedUser, error: updateError } = await db
              .from("users")
              .update({
                name: name.trim(),
                address: address.trim(),
                updated_at: new Date().toISOString()
              })
              .eq("phone", cleanedPhone)
              .select()
              .single()

            if (updateError) {
              console.error("❌ خطأ في تحديث بيانات المستخدم:", updateError)
              console.error("تفاصيل الخطأ:", {
                code: updateError.code,
                message: updateError.message,
                details: updateError.details,
                hint: updateError.hint
              })
              set({ isLoading: false })
              return { success: false, message: `فشل في تحديث البيانات: ${updateError.message}` }
            }

            userData = mapDbUserToUser(updatedUser as Database['public']['Tables']['users']['Row'])
            console.log("✅ تسجيل دخول لمستخدم موجود:", userData)
          } else {
            console.log("👤 مستخدم جديد، إنشاء حساب...")
            // المستخدم جديد - إنشاء حساب جديد
            const newUser: Database['public']['Tables']['users']['Insert'] = {
              phone: cleanedPhone,
              name: name.trim(),
              address: address.trim(),
              loyalty_points: 0,
              total_orders: 0,
              total_spent: 0,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            const { data: createdUser, error: createError } = await db
              .from("users")
              .insert([newUser])
              .select()
              .single()

            if (createError) {
              console.error("❌ خطأ في إنشاء المستخدم:", createError)
              console.error("تفاصيل الخطأ:", {
                code: createError.code,
                message: createError.message,
                details: createError.details,
                hint: createError.hint
              })
              set({ isLoading: false })
              return { success: false, message: `فشل في إنشاء الحساب: ${createError.message}` }
            }

            userData = mapDbUserToUser(createdUser as Database['public']['Tables']['users']['Row'])
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

          console.log("🎉 تم تسجيل الدخول بنجاح!")
          return { success: true, message }

        } catch (error) {
          console.error("💥 خطأ غير متوقع في تسجيل الدخول:", error)
          set({ isLoading: false })
          return { success: false, message: `خطأ غير متوقع: ${error instanceof Error ? error.message : 'خطأ غير محدد'}` }
        }
      },

  register: async () => {
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

          const db = supabase as unknown as SupabaseClient<Database>
          const { data: updatedUser, error } = await db
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

          set({ user: mapDbUserToUser(updatedUser as Database['public']['Tables']['users']['Row']) })
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
            user: mapDbUserToUser(currentUser as Database['public']['Tables']['users']['Row']),
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

// Helper: map DB user row (nullable fields) to strict app User type with safe defaults
function mapDbUserToUser(row: Database['public']['Tables']['users']['Row']): User {
  return {
    id: row.id,
    phone: row.phone,
    name: row.name ?? "",
    email: row.email ?? undefined,
    address: row.address ?? "",
    city: row.city ?? undefined,
    area: row.area ?? undefined,
    building_number: row.building_number ?? undefined,
    floor_number: row.floor_number ?? undefined,
    apartment_number: row.apartment_number ?? undefined,
    landmark: row.landmark ?? undefined,
    loyalty_points: row.loyalty_points ?? 0,
    total_orders: row.total_orders ?? 0,
    total_spent: row.total_spent ?? 0,
    is_active: row.is_active ?? true,
    is_admin: row.is_admin ?? undefined,
    birth_date: row.birth_date ?? undefined,
    gender: row.gender ?? undefined,
    preferred_delivery_time: row.preferred_delivery_time ?? undefined,
    notes: row.notes ?? undefined,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  }
}
