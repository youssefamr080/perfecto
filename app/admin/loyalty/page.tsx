"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Eye,
  Settings,
  ArrowLeft,
  Package,
  BarChart3
} from 'lucide-react'
import {
  auditAllUserPoints,
  validateUserPoints,
  fixUserPoints,
  getUserLoyaltyHistory,
  handleOrderCancellation,
  type LoyaltyTransaction,
  type PointsValidation
} from '@/lib/utils/loyaltyProtection'
import { supabase } from '@/lib/supabase'
import Breadcrumbs from '@/components/navigation/Breadcrumbs'

interface UserPointsInfo {
  id: string
  name: string
  phone: string
  loyalty_points: number
  created_at: string
  last_order_date?: string
  total_orders: number
  validation?: PointsValidation
}

interface AuditResult {
  total_users: number
  valid_users: number
  invalid_users: number
  invalid_details: Array<{
    user_id: string
    current_points: number
    calculated_points: number
    difference: number
  }>
}

export default function LoyaltyAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [searchUserId, setSearchUserId] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserPointsInfo | null>(null)
  const [userHistory, setUserHistory] = useState<LoyaltyTransaction[]>([])
  const [users, setUsers] = useState<UserPointsInfo[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadUsersWithPoints()
  }, [])

  // جلب المستخدمين الذين لديهم نقاط
  const loadUsersWithPoints = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, name, phone, loyalty_points, created_at,
          orders!inner(created_at)
        `)
        .gt('loyalty_points', 0)
        .order('loyalty_points', { ascending: false })

      if (error) throw error

      const usersWithStats = data?.map(user => ({
        ...user,
        total_orders: user.orders?.length || 0,
        last_order_date: user.orders?.[0]?.created_at
      })) || []

      setUsers(usersWithStats)
    } catch (error) {
      console.error('Error loading users:', error)
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات المستخدمين",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // تدقيق شامل لجميع النقاط
  const performFullAudit = async () => {
    setAuditLoading(true)
    try {
      console.log('🔍 Starting comprehensive loyalty points audit...')
      const result = await auditAllUserPoints()
      setAuditResult(result)
      
      toast({
        title: "تم التدقيق بنجاح",
        description: `تم فحص ${result.total_users} مستخدم - وجد ${result.invalid_users} مشكلة`,
        variant: result.invalid_users > 0 ? "destructive" : "default",
      })
    } catch (error) {
      console.error('Error in audit:', error)
      toast({
        title: "خطأ في التدقيق",
        description: "فشل في إجراء التدقيق الشامل",
        variant: "destructive",
      })
    } finally {
      setAuditLoading(false)
    }
  }

  // البحث عن مستخدم وفحص نقاطه
  const searchAndValidateUser = async () => {
    if (!searchUserId.trim()) return

    setLoading(true)
    try {
      // جلب بيانات المستخدم
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', searchUserId.trim())
        .single()

      if (userError || !userData) {
        toast({
          title: "مستخدم غير موجود",
          description: "لم يتم العثور على المستخدم",
          variant: "destructive",
        })
        return
      }

      // التحقق من صحة النقاط
      const validation = await validateUserPoints(searchUserId.trim())
      
      setSelectedUser({
        ...userData,
        total_orders: 0, // سيتم تحديثه لاحقاً
        validation
      })

      // جلب تاريخ المعاملات
      const history = await getUserLoyaltyHistory(searchUserId.trim())
      setUserHistory(history)
      setShowHistory(true)

    } catch (error) {
      console.error('Error searching user:', error)
      toast({
        title: "خطأ في البحث",
        description: "فشل في البحث عن المستخدم",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // إصلاح نقاط المستخدم
  const fixPoints = async (userId: string) => {
    setLoading(true)
    try {
      const result = await fixUserPoints(userId)
      
      toast({
        title: "تم الإصلاح بنجاح",
        description: `تم تحديث النقاط من ${result.old_points} إلى ${result.new_points}`,
        variant: "default",
      })

      // تحديث البيانات
      await searchAndValidateUser()
      await loadUsersWithPoints()

    } catch (error) {
      console.error('Error fixing points:', error)
      toast({
        title: "خطأ في الإصلاح",
        description: "فشل في إصلاح النقاط",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // إلغاء طلب
  const cancelOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟ سيتم خصم نقاط عقوبة من المستخدم.')) {
      return
    }

    setLoading(true)
    try {
      const result = await handleOrderCancellation(orderId)
      
      if (result.success) {
        toast({
          title: "تم إلغاء الطلب",
          description: `تم خصم ${result.points_deducted} نقطة كعقوبة وإرجاع ${result.points_refunded} نقطة`,
          variant: "default",
        })
      } else {
        throw new Error(result.message)
      }

    } catch (error) {
      console.error('Error cancelling order:', error)
      toast({
        title: "خطأ في الإلغاء",
        description: error instanceof Error ? error.message : "فشل في إلغاء الطلب",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header + Breadcrumbs */}
        <div className="text-center mb-8">
          <div className="mb-3 text-left">
            <Breadcrumbs
              segments={[
                { href: '/', label: 'الرئيسية' },
                { href: '/admin', label: 'الإدارة' },
                { label: 'إدارة نقاط الولاء' },
              ]}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            إدارة نقاط الولاء
          </h1>
          <p className="text-gray-600">نظام حماية ومراقبة نقاط الولاء من التلاعب</p>
        </div>

        {/* شريط التنقل السريع */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => router.push('/admin')}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-gray-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  العودة للوحة الرئيسية
                </Button>
                
                <div className="h-6 w-px bg-blue-300 hidden md:block"></div>
                
                <Button
                  onClick={() => router.push('/admin/orders')}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700"
                >
                  <Package className="h-4 w-4 mr-2" />
                  إدارة الطلبات
                </Button>
                
                <Button
                  onClick={() => router.push('/loyalty/history')}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-green-50 border-green-300 text-green-700"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  تاريخ النقاط
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* العمود الأيسر - التحكم والبحث */}
          <div className="lg:col-span-1 space-y-6">
            {/* تدقيق شامل */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  التدقيق الشامل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={performFullAudit}
                  disabled={auditLoading}
                  className="w-full"
                  variant="outline"
                >
                  {auditLoading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      جاري التدقيق...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      فحص جميع النقاط
                    </div>
                  )}
                </Button>

                {auditResult && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-600">{auditResult.total_users}</div>
                        <div className="text-xs text-blue-600">إجمالي</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">{auditResult.valid_users}</div>
                        <div className="text-xs text-green-600">صحيح</div>
                      </div>
                      <div className="p-2 bg-red-50 rounded">
                        <div className="text-lg font-bold text-red-600">{auditResult.invalid_users}</div>
                        <div className="text-xs text-red-600">خطأ</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* البحث عن مستخدم */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  البحث عن مستخدم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="أدخل ID المستخدم"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                />
                <Button 
                  onClick={searchAndValidateUser}
                  disabled={loading || !searchUserId.trim()}
                  className="w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  بحث وفحص
                </Button>
              </CardContent>
            </Card>

            {/* معلومات المستخدم المحدد */}
            {selectedUser && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-600" />
                      تفاصيل المستخدم
                    </span>
                    {selectedUser.validation && (
                      <Badge variant={selectedUser.validation.is_valid ? "default" : "destructive"}>
                        {selectedUser.validation.is_valid ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {selectedUser.validation.is_valid ? 'صحيح' : 'خطأ'}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div><strong>الاسم:</strong> {selectedUser.name}</div>
                    <div><strong>الهاتف:</strong> {selectedUser.phone}</div>
                    <div><strong>النقاط الحالية:</strong> {selectedUser.loyalty_points}</div>
                    
                    {selectedUser.validation && (
                      <div className="p-3 bg-gray-50 rounded">
                        <div><strong>النقاط المحسوبة:</strong> {selectedUser.validation.calculated_points}</div>
                        <div><strong>الفرق:</strong> 
                          <span className={selectedUser.validation.difference !== 0 ? 'text-red-600 font-bold' : 'text-green-600'}>
                            {selectedUser.validation.difference}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedUser.validation && !selectedUser.validation.is_valid && (
                    <Button 
                      onClick={() => fixPoints(selectedUser.id)}
                      disabled={loading}
                      variant="destructive"
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      إصلاح النقاط
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* العمود الأوسط والأيمن - قائمة المستخدمين والتاريخ */}
          <div className="lg:col-span-2 space-y-6">
            {/* قائمة المستخدمين */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    المستخدمون ({users.length})
                  </span>
                  <Button onClick={loadUsersWithPoints} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.phone}</div>
                        <div className="text-xs text-gray-500">طلبات: {user.total_orders}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{user.loyalty_points} نقطة</div>
                        <Button 
                          onClick={() => setSearchUserId(user.id)}
                          size="sm"
                          variant="outline"
                          className="mt-1"
                        >
                          فحص
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* تاريخ المعاملات */}
            {showHistory && userHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-600" />
                    تاريخ المعاملات ({userHistory.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userHistory.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={
                                transaction.transaction_type === 'EARNED' ? 'default' :
                                transaction.transaction_type === 'USED' ? 'secondary' :
                                transaction.transaction_type === 'REFUNDED' ? 'outline' : 'destructive'
                              }
                            >
                              {transaction.transaction_type === 'EARNED' && <TrendingUp className="h-3 w-3 mr-1" />}
                              {transaction.transaction_type === 'USED' && <TrendingDown className="h-3 w-3 mr-1" />}
                              {transaction.transaction_type === 'REFUNDED' && <RefreshCw className="h-3 w-3 mr-1" />}
                              {transaction.transaction_type === 'DEDUCTED' && <XCircle className="h-3 w-3 mr-1" />}
                              {transaction.transaction_type}
                            </Badge>
                            <span className="font-medium">{transaction.points_amount} نقطة</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{transaction.description}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.created_at).toLocaleString('ar-EG')}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div>من: {transaction.points_before}</div>
                          <div>إلى: {transaction.points_after}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* المستخدمون الذين بهم مشاكل */}
            {auditResult && auditResult.invalid_details.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    مستخدمون بهم مشاكل ({auditResult.invalid_details.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {auditResult.invalid_details.map((issue) => (
                      <div key={issue.user_id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div>
                          <div className="font-medium text-red-800">User: {issue.user_id.slice(0, 8)}...</div>
                          <div className="text-sm text-red-600">
                            الحالي: {issue.current_points} | المحسوب: {issue.calculated_points}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">
                            فرق: {issue.difference}
                          </Badge>
                          <Button 
                            onClick={() => fixPoints(issue.user_id)}
                            size="sm"
                            variant="outline"
                          >
                            إصلاح
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
