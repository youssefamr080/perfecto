'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Address {
  id?: string
  title: string
  fullAddress: string
  area?: string
  building?: string
  floor?: string
  apartment?: string
  landmark?: string
  isDefault: boolean
}

interface User {
  id?: string
  name: string
  phone: string
  defaultAddress?: string
  addresses: Address[]
}

interface UserContextType {
  user: User | null
  isLoggedIn: boolean
  login: (userData: { name: string; phone: string }) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>
  updateAddress: (addressId: string, address: Partial<Address>) => Promise<void>
  deleteAddress: (addressId: string) => Promise<void>
  setDefaultAddress: (addressId: string) => Promise<void>
  getDefaultAddress: () => Address | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: React.ReactNode
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // تحميل بيانات المستخدم عند بدء التطبيق
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsLoggedIn(true)
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  // حفظ بيانات المستخدم في localStorage عند التحديث
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }, [user])

  const login = async (userData: { name: string; phone: string }) => {
    try {
      // البحث عن المستخدم أو إنشاء واحد جديد
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const result = await response.json()
      
      if (result.success) {
        setUser(result.user)
        setIsLoggedIn(true)
      } else {
        throw new Error(result.error || 'خطأ في تسجيل الدخول')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('user')
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!user) return

    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...address })
      })

      const result = await response.json()
      
      if (result.success) {
        setUser(prev => prev ? {
          ...prev,
          addresses: [...prev.addresses, result.address]
        } : null)
      } else {
        throw new Error(result.error || 'خطأ في إضافة العنوان')
      }
    } catch (error) {
      console.error('Add address error:', error)
      throw error
    }
  }

  const updateAddress = async (addressId: string, address: Partial<Address>) => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
      })

      const result = await response.json()
      
      if (result.success) {
        setUser(prev => prev ? {
          ...prev,
          addresses: prev.addresses.map(addr => 
            addr.id === addressId ? { ...addr, ...result.address } : addr
          )
        } : null)
      } else {
        throw new Error(result.error || 'خطأ في تحديث العنوان')
      }
    } catch (error) {
      console.error('Update address error:', error)
      throw error
    }
  }

  const deleteAddress = async (addressId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        setUser(prev => prev ? {
          ...prev,
          addresses: prev.addresses.filter(addr => addr.id !== addressId)
        } : null)
      } else {
        throw new Error(result.error || 'خطأ في حذف العنوان')
      }
    } catch (error) {
      console.error('Delete address error:', error)
      throw error
    }
  }

  const setDefaultAddress = async (addressId: string) => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/addresses/${addressId}/default`, {
        method: 'PUT'
      })

      const result = await response.json()
      
      if (result.success) {
        setUser(prev => prev ? {
          ...prev,
          addresses: prev.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
          }))
        } : null)
      } else {
        throw new Error(result.error || 'خطأ في تعيين العنوان الافتراضي')
      }
    } catch (error) {
      console.error('Set default address error:', error)
      throw error
    }
  }

  const getDefaultAddress = (): Address | null => {
    if (!user || !user.addresses.length) return null
    return user.addresses.find(addr => addr.isDefault) || user.addresses[0]
  }

  const value: UserContextType = {
    user,
    isLoggedIn,
    login,
    logout,
    updateUser,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
