'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  phone: string
  address?: string
  role?: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (name: string, phone: string, address?: string, password?: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // تحميل بيانات المستخدم من localStorage عند بدء التطبيق
  useEffect(() => {
    // التأكد من أننا في المتصفح قبل الوصول إلى localStorage
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (error) {
          console.error('Error parsing saved user:', error)
          localStorage.removeItem('user')
        }
      }
    }
    setIsLoading(false)
  }, [])

  // حفظ بيانات المستخدم في localStorage عند تغيير الحالة
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    }
  }, [user])

  const login = async (name: string, phone: string, address?: string, password?: string) => {
    setIsLoading(true)
    try {
      // البحث عن المستخدم أو إنشاء حساب جديد
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, address, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل تسجيل الدخول')
      }

      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
  }

  const updateProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('لا يوجد مستخدم مسجل دخول')

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, ...data }),
      })

      if (!response.ok) {
        throw new Error('فشل تحديث البيانات')
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    updateProfile,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
