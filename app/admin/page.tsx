'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminDashboard from './AdminDashboard'

const AdminPage: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !isAdmin) {
      router.push('/')
    }
  }, [mounted, isLoading, isAdmin, router])

  // Show loading while checking authentication
  if (!mounted || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحقق من الصلاحيات...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <LockClosedIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح لك بالوصول</h1>
            <p className="text-gray-600 mb-6">هذا القسم مخصص للمديرين فقط</p>
            <button
              onClick={() => router.push('/')}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Show admin dashboard if user is admin
  return (
    <>
      <Header />
      <AdminDashboard />
      <Footer />
    </>
  )
}

export default AdminPage
