"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth-store'
import { getUserLoyaltyHistory, validateUserPoints, type LoyaltyTransaction } from '@/lib/utils/loyaltyProtection'
import { useToast } from '@/hooks/use-toast'
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Gift,
  ShoppingBag,
  Ban,
  ArrowLeft,
  Shield,
  Package
} from 'lucide-react'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

const TRANSACTION_TYPES = {
  'EARNED': {
    label: 'نقاط مكتسبة',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-800',
    description: 'نقاط حصلت عليها من طلباتك'
  },
  'USED': {
    label: 'نقاط مستخدمة',
    icon: TrendingDown,
    color: 'bg-blue-100 text-blue-800',
    description: 'نقاط استخدمتها للحصول على خصم'
  },
  'REFUNDED': {
    label: 'نقاط مسترجعة',
    icon: RefreshCw,
    color: 'bg-purple-100 text-purple-800',
    description: 'نقاط تم إرجاعها لك'
  },
  'DEDUCTED': {
    label: 'نقاط مخصومة',
    icon: Ban,
    color: 'bg-red-100 text-red-800',
    description: 'نقاط تم خصمها كعقوبة'
  }
}

export default function LoyaltyHistoryPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [pointsValid, setPointsValid] = useState<boolean | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (isAuthenticated && user) {
      loadTransactions()
      validatePoints()
    }
  }, [isAuthenticated, user])

  const loadTransactions = async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      const history = await getUserLoyaltyHistory(user.id, 100)
      setTransactions(history)
    } catch (error) {
      console.error('Error loading loyalty history:', error)
      toast({
        title: "خطأ",
        description: "فشل في جلب تاريخ نقاط الولاء",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validatePoints = async () => {
    if (!user?.id) return
    
    try {
      const validation = await validateUserPoints(user.id)
      setPointsValid(validation?.is_valid || false)
      
      if (validation && !validation.is_valid) {
        toast({
          title: "تنبيه",
          description: `يوجد خلل في رصيد نقاطك. يرجى التواصل مع الدعم الفني.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error validating points:', error)
    }
  }

  const groupTransactionsByDate = (transactions: LoyaltyTransaction[]) => {
    const groups: { [key: string]: LoyaltyTransaction[] } = {}
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toLocaleDateString('ar-EG')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(transaction)
    })
    
    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    )
  }

  const calculateDailyNet = (transactions: LoyaltyTransaction[]) => {
    return transactions.reduce((net, transaction) => {
      switch (transaction.transaction_type) {
        case 'EARNED':
        case 'REFUNDED':
          return net + transaction.points_amount
        case 'USED':
        case 'DEDUCTED':
          return net - transaction.points_amount
        default:
          return net
      }
    }, 0)
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <Coins className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">مطلوب تسجيل الدخول</h2>
            <p className="text-gray-600">يرجى تسجيل الدخول لمراجعة تاريخ نقاط الولاء</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const groupedTransactions = groupTransactionsByDate(transactions)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header + Breadcrumbs */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            رجوع
          </Button>
          
          <div className="flex-1">
            <div className="mb-2">
              <Breadcrumbs
                segments={[
                  { href: '/', label: 'الرئيسية' },
                  { label: 'تاريخ نقاط الولاء' },
                ]}
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Coins className="h-8 w-8 text-yellow-600" />
              تاريخ نقاط الولاء
            </h1>
            <p className="text-gray-600">مراجعة شاملة لجميع معاملات نقاط الولاء</p>
          </div>

          <Button 
            onClick={() => { loadTransactions(); validatePoints(); }}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* شريط التنقل السريع للأدمن */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => router.push('/admin')}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  لوحة تحكم الأدمن
                </Button>
                
                <div className="h-6 w-px bg-yellow-300 hidden md:block"></div>
                
                <Button
                  onClick={() => router.push('/admin/loyalty')}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-yellow-50 border-yellow-300 text-yellow-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  إدارة نقاط الولاء
                </Button>
                
                <Button
                  onClick={() => router.push('/admin/orders')}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  إدارة الطلبات
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Points Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Balance */}
              <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Coins className="h-6 w-6 text-yellow-600" />
                  <span className="font-medium text-yellow-800">رصيدك الحالي</span>
                  {pointsValid !== null && (
                    pointsValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )
                  )}
                </div>
                <div className="text-3xl font-bold text-yellow-600">{user?.loyalty_points || 0}</div>
                <div className="text-sm text-yellow-700">نقطة</div>
              </div>

              {/* Total Earned */}
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <span className="font-medium text-green-800">إجمالي المكتسب</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {transactions
                    .filter(t => ['EARNED', 'REFUNDED'].includes(t.transaction_type))
                    .reduce((sum, t) => sum + t.points_amount, 0)
                  }
                </div>
                <div className="text-sm text-green-700">نقطة</div>
              </div>

              {/* Total Used */}
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className="h-6 w-6 text-blue-600" />
                  <span className="font-medium text-blue-800">إجمالي المستخدم</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {transactions
                    .filter(t => ['USED', 'DEDUCTED'].includes(t.transaction_type))
                    .reduce((sum, t) => sum + t.points_amount, 0)
                  }
                </div>
                <div className="text-sm text-blue-700">نقطة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">أنواع المعاملات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(TRANSACTION_TYPES).map(([type, config]) => {
                const Icon = config.icon
                return (
                  <div key={type} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-sm">{config.label}</div>
                      <div className="text-xs text-gray-600">{config.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">جاري تحميل تاريخ المعاملات...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-6">
            {groupedTransactions.map(([date, dayTransactions]) => {
              const dailyNet = calculateDailyNet(dayTransactions)
              
              return (
                <Card key={date}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{date}</CardTitle>
                      <Badge 
                        variant={dailyNet >= 0 ? "default" : "destructive"}
                        className="px-3 py-1"
                      >
                        {dailyNet >= 0 ? '+' : ''}{dailyNet} نقطة
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dayTransactions.map((transaction) => {
                        const config = TRANSACTION_TYPES[transaction.transaction_type as keyof typeof TRANSACTION_TYPES]
                        const Icon = config.icon
                        
                        return (
                          <div key={transaction.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className={`p-2 rounded-lg ${config.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{config.label}</h4>
                                <div className="text-right">
                                  <div className={`text-lg font-bold ${
                                    ['EARNED', 'REFUNDED'].includes(transaction.transaction_type) 
                                      ? 'text-green-600' 
                                      : 'text-red-600'
                                  }`}>
                                    {['EARNED', 'REFUNDED'].includes(transaction.transaction_type) ? '+' : '-'}
                                    {transaction.points_amount} نقطة
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {transaction.points_before} → {transaction.points_after}
                                  </div>
                                </div>
                              </div>
                              
                              {transaction.description && (
                                <p className="text-sm text-gray-600 mb-2">{transaction.description}</p>
                              )}
                              
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{new Date(transaction.created_at).toLocaleTimeString('ar-EG')}</span>
                                <span>بواسطة: {transaction.created_by}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد معاملات</h3>
              <p className="text-gray-600 mb-6">لم تقم بأي معاملات نقاط ولاء حتى الآن</p>
              <Button asChild>
                <a href="/categories">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  ابدأ التسوق
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
