'use client'

import { CartProvider } from "@/contexts/CartContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { UserProvider } from "@/contexts/UserContext"

// احذف تعريف ProvidersProps إذا لم يكن مستخدمًا
const CartWrapper = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UserProvider>
        <CartProvider>
          <CartWrapper>
            {children}
          </CartWrapper>
        </CartProvider>
      </UserProvider>
    </AuthProvider>
  )
}
