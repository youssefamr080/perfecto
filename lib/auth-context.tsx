"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { supabase } from "./supabase"
import type { User } from "./types"

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "LOGOUT" }

const AuthContext = createContext<{
  state: AuthState
  login: (phone: string, name: string, address: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
} | null>(null)

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      }
    case "LOGOUT":
      return {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  // Check for existing session on mount
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const sessionToken = localStorage.getItem("perfecto-session")
      if (!sessionToken) {
        dispatch({ type: "SET_LOADING", payload: false })
        return
      }

      const { data: session, error } = await supabase
        .from("user_sessions")
        .select(`
          *,
          user:users(*)
        `)
        .eq("session_token", sessionToken)
        .gt("expires_at", new Date().toISOString())
        .single()

      if (error || !session) {
        localStorage.removeItem("perfecto-session")
        dispatch({ type: "SET_LOADING", payload: false })
        return
      }

      dispatch({ type: "SET_USER", payload: session.user })
    } catch (error) {
      console.error("Error checking session:", error)
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const login = async (phone: string, name: string, address: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })

      // Check if user exists
      let { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .single()

      if (userError && userError.code !== "PGRST116") {
        throw userError
      }

      // Create or update user
      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            phone,
            name,
            address,
          })
          .select()
          .single()

        if (createError) throw createError
        existingUser = newUser
      } else {
        // Update existing user info
        const { data: updatedUser, error: updateError } = await supabase
          .from("users")
          .update({
            name,
            address,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingUser.id)
          .select()
          .single()

        if (updateError) throw updateError
        existingUser = updatedUser
      }

      // Create session
      const sessionToken = generateSessionToken()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 days

      const { error: sessionError } = await supabase.from("user_sessions").insert({
        user_id: existingUser.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      })

      if (sessionError) throw sessionError

      // Store session token
      localStorage.setItem("perfecto-session", sessionToken)

      dispatch({ type: "SET_USER", payload: existingUser })

      return { success: true, message: "تم تسجيل الدخول بنجاح" }
    } catch (error) {
      console.error("Login error:", error)
      dispatch({ type: "SET_LOADING", payload: false })
      return { success: false, message: "حدث خطأ في تسجيل الدخول" }
    }
  }

  const logout = async () => {
    try {
      const sessionToken = localStorage.getItem("perfecto-session")
      if (sessionToken) {
        await supabase.from("user_sessions").delete().eq("session_token", sessionToken)
      }
      localStorage.removeItem("perfecto-session")
      dispatch({ type: "LOGOUT" })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    if (!state.user) return

    try {
      const { data: updatedUser, error } = await supabase
        .from("users")
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", state.user.id)
        .select()
        .single()

      if (error) throw error

      dispatch({ type: "SET_USER", payload: updatedUser })
    } catch (error) {
      console.error("Update user error:", error)
      throw error
    }
  }

  const generateSessionToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  return <AuthContext.Provider value={{ state, login, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
