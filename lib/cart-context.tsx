"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useReducer, useSyncExternalStore } from "react"

import { areFunctionalCookiesAllowed, subscribeToCookiePreferences } from "@/lib/cookie-consent"

export interface CartProductSnapshot {
  slug: string
  name: string
  nameSw: string
  image: string
  price: number
  discountPrice?: number
  stock: number
  warrantyMonths: number
  categorySlug: string
  brandSlug: string
}

export interface CartItem {
  product: CartProductSnapshot
  quantity: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartProductSnapshot }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { slug: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_FROM_STORAGE"; payload: CartState }

const CartContext = createContext<{
  state: CartState
  addItem: (product: CartProductSnapshot) => void
  removeItem: (slug: string) => void
  updateQuantity: (slug: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.product.slug === action.payload.slug)
      if (!existingItem) {
        return {
          items: [...state.items, { product: action.payload, quantity: 1 }],
        }
      }

      return {
        items: state.items.map((item) =>
          item.product.slug === action.payload.slug
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, item.product.stock),
              }
            : item,
        ),
      }
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter((item) => item.product.slug !== action.payload),
      }
    case "UPDATE_QUANTITY":
      return {
        items: state.items
          .map((item) =>
            item.product.slug === action.payload.slug
              ? {
                  ...item,
                  quantity: Math.max(1, Math.min(action.payload.quantity, item.product.stock)),
                }
              : item,
          )
          .filter((item) => item.quantity > 0),
      }
    case "CLEAR_CART":
      return { items: [] }
    case "LOAD_FROM_STORAGE":
      return action.payload
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const functionalCookiesAllowed = useSyncExternalStore(
    subscribeToCookiePreferences,
    areFunctionalCookiesAllowed,
    () => false,
  )

  useEffect(() => {
    if (!functionalCookiesAllowed) {
      localStorage.removeItem("ochieng_cart")
      return
    }

    const savedCart = localStorage.getItem("ochieng_cart")
    if (savedCart) {
      try {
        dispatch({ type: "LOAD_FROM_STORAGE", payload: JSON.parse(savedCart) })
      } catch {
        localStorage.removeItem("ochieng_cart")
      }
    }
  }, [functionalCookiesAllowed])

  useEffect(() => {
    if (!functionalCookiesAllowed) {
      localStorage.removeItem("ochieng_cart")
      return
    }

    localStorage.setItem("ochieng_cart", JSON.stringify(state))
  }, [functionalCookiesAllowed, state])

  const itemCount = useMemo(() => state.items.reduce((sum, item) => sum + item.quantity, 0), [state.items])
  const subtotal = useMemo(
    () =>
      state.items.reduce((sum, item) => {
        const activePrice = item.product.discountPrice ?? item.product.price
        return sum + activePrice * item.quantity
      }, 0),
    [state.items],
  )

  return (
    <CartContext.Provider
      value={{
        state,
        addItem: (product) => dispatch({ type: "ADD_ITEM", payload: product }),
        removeItem: (slug) => dispatch({ type: "REMOVE_ITEM", payload: slug }),
        updateQuantity: (slug, quantity) => dispatch({ type: "UPDATE_QUANTITY", payload: { slug, quantity } }),
        clearCart: () => dispatch({ type: "CLEAR_CART" }),
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
