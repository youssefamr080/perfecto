import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "@/lib/types"

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  getItemQuantity: (productId: string) => number
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (product: Product, quantity = 1) => {
        const { items } = get()
        const existingItem = items.find((item) => item.product.id === product.id)

        let newItems: CartItem[]
        if (existingItem) {
          newItems = items.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
          )
        } else {
          newItems = [...items, { product, quantity }]
        }

        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
        const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

        set({ items: newItems, itemCount, total })
      },

      removeItem: (productId: string) => {
        const { items } = get()
        const newItems = items.filter((item) => item.product.id !== productId)
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
        const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

        set({ items: newItems, itemCount, total })
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const { items } = get()
        const newItems = items.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
        const total = newItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

        set({ items: newItems, itemCount, total })
      },

      getItemQuantity: (productId: string) => {
        const { items } = get()
        const item = items.find((item) => item.product.id === productId)
        return item?.quantity || 0
      },

      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
    }),
    {
      name: "perfecto-cart",
      skipHydration: true,
    },
  ),
)
