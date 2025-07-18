'use client'

import { CartProvider } from "@/contexts/CartContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { UserProvider } from "@/contexts/UserContext"

interface ProvidersProps {
  children: React.ReactNode
}

// This new component ensures that CartProvider is not re-rendered unnecessarily
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
