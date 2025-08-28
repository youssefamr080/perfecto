"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { LoyaltyPointsHistory } from "@/lib/types"
import { Gift, TrendingUp, TrendingDown, Award, Star } from "lucide-react"

export default function LoyaltyPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [history, setHistory] = useState<LoyaltyPointsHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    fetchLoyaltyHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router])

  const fetchLoyaltyHistory = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("loyalty_points_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setHistory(data || [])
    } catch (error) {
      console.error("Error fetching loyalty history:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "EARNED":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "REDEEMED":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case "BONUS":
        return <Gift className="h-4 w-4 text-blue-600" />
      case "EXPIRED":
        return <Star className="h-4 w-4 text-black" />
      default:
        return <Gift className="h-4 w-4" />
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "EARNED":
        return "text-green-600"
      case "REDEEMED":
        return "text-red-600"
      case "BONUS":
        return "text-blue-600"
      case "EXPIRED":
        return "text-black"
      default:
        return "text-black"
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "EARNED":
        return "نقاط مكتسبة"
      case "REDEEMED":
        return "نقاط مستخدمة"
      case "BONUS":
        return "نقاط مكافأة"
      case "EXPIRED":
        return "نقاط منتهية"
      default:
        return type
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-8">نقاط الولاء</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Current Points */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-black">
              <Gift className="h-6 w-6 text-green-600" />
              النقاط الحالية
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-black mb-2">{user.loyalty_points}</div>
            <p className="text-sm text-black">نقطة متاحة</p>
          </CardContent>
        </Card>

        {/* Points Value */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-black">
              <Award className="h-6 w-6 text-blue-600" />
              قيمة النقاط
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-black mb-2">
              {Math.floor((user.loyalty_points || 0) / 100)}
            </div>
            <p className="text-sm text-black">جنيه خصم</p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-black">
              <Star className="h-6 w-6 text-yellow-600" />
              إجمالي الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-black mb-2">{user.total_orders || 0}</div>
            <p className="text-sm text-black">طلب</p>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>كيف يعمل نظام نقاط الولاء؟</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1 text-black">اكسب النقاط</h3>
              <p className="text-sm text-black">كل 1 جنيه = 1 نقطة</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <Gift className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1 text-black">استبدل النقاط</h3>
              <p className="text-sm text-black">كل 100 نقطة = 2 جنيه خصم</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1 text-black">توصيل مجاني</h3>
              <p className="text-sm text-black">1000 نقطة = توصيل مجاني</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle>تاريخ النقاط</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-black">لا يوجد تاريخ للنقاط بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="font-semibold text-black">{getTransactionLabel(transaction.transaction_type)}</p>
                      <p className="text-sm text-black">{transaction.description}</p>
                      <p className="text-xs text-black">
                        {new Date(transaction.created_at).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold ${getTransactionColor(transaction.transaction_type).replace('text-white','text-black')}` + ' text-black'}>
                      {transaction.points_change > 0 ? "+" : ""}
                      {transaction.points_change} نقطة
                    </p>
                    <p className="text-sm text-black">الرصيد: {transaction.points_balance}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
