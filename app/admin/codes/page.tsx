"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Copy, 
  Gift, 
  UserPlus, 
  CheckCircle2, 
  Clock,
  Phone,
  MessageSquare,
  Share2,
  Award,
  Trash2,
  Edit2,
  Users,
  RefreshCw,
  Database,
  AlertCircle
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface Ambassador {
  id: string
  name: string
  phone: string
  created_at: string
  is_active: boolean
  codes: Code[]
  stats: AmbassadorStats
}

interface Code {
  id: string
  code: string
  is_used: boolean
  expires_at: string
  created_at: string
}

interface AmbassadorStats {
  total_codes_generated: number
  total_codes_used: number
  total_discount_given: number
  is_eligible_for_bonus: boolean
  last_activity_at: string | null
}

interface CodeUsage {
  id: string
  code: string
  ambassador_name: string
  used_at: string
  customer_info?: string
}

interface SystemStats {
  total_ambassadors: number
  active_ambassadors: number
  eligible_for_bonus: number
  total_codes_generated: number
  total_codes_used: number
  total_discount_given: number
  codes_usage_rate: number
}

export default function AdminCodesPage() {
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([])
  const [codeUsages, setCodeUsages] = useState<CodeUsage[]>([])
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_ambassadors: 0,
    active_ambassadors: 0,
    eligible_for_bonus: 0,
    total_codes_generated: 0,
    total_codes_used: 0,
    total_discount_given: 0,
    codes_usage_rate: 0
  })
  const [newAmbassador, setNewAmbassador] = useState({ name: '', phone: '' })
  const [searchCode, setSearchCode] = useState('')
  const [customerInfo, setCustomerInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchAmbassador, setSearchAmbassador] = useState('')
  const [codeValidationResult, setCodeValidationResult] = useState<any>(null)

  // تحميل البيانات من قاعدة البيانات
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchAmbassadors(),
        fetchRecentCodeUsages(),
        fetchSystemStats()
      ])
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات من قاعدة البيانات",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAmbassadors = async () => {
    const { data: ambassadorsData, error: ambassadorsError } = await supabase
      .from('ambassadors')
      .select(`
        id,
        name,
        phone,
        created_at,
        is_active,
        ambassador_codes (
          id,
          code,
          is_used,
          expires_at,
          created_at
        ),
        ambassador_stats (
          total_codes_generated,
          total_codes_used,
          total_discount_given,
          is_eligible_for_bonus,
          last_activity_at
        )
      `)
      .order('created_at', { ascending: false })

    if (ambassadorsError) {
      throw ambassadorsError
    }

    const formattedAmbassadors = ambassadorsData?.map((ambassador: any) => ({
      id: ambassador.id,
      name: ambassador.name,
      phone: ambassador.phone,
      created_at: ambassador.created_at,
      is_active: ambassador.is_active,
      codes: ambassador.ambassador_codes || [],
      stats: ambassador.ambassador_stats?.[0] || {
        total_codes_generated: 0,
        total_codes_used: 0,
        total_discount_given: 0,
        is_eligible_for_bonus: false,
        last_activity_at: null
      }
    })) || []

    setAmbassadors(formattedAmbassadors)
  }

  const fetchRecentCodeUsages = async () => {
    const { data, error } = await supabase
      .from('code_usages')
      .select(`
        id,
        used_at,
        customer_info,
        ambassador_codes (
          code,
          ambassadors (
            name
          )
        )
      `)
      .order('used_at', { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    const formattedUsages = data?.map((usage: any) => ({
      id: usage.id,
      code: usage.ambassador_codes?.code || '',
      ambassador_name: usage.ambassador_codes?.ambassadors?.name || '',
      used_at: usage.used_at,
      customer_info: usage.customer_info
    })) || []

    setCodeUsages(formattedUsages)
  }

  const fetchSystemStats = async () => {
    const { data, error } = await supabase
      .rpc('get_ambassador_system_stats')

    if (error) {
      throw error
    }

    setSystemStats(data || {
      total_ambassadors: 0,
      active_ambassadors: 0,
      eligible_for_bonus: 0,
      total_codes_generated: 0,
      total_codes_used: 0,
      total_discount_given: 0,
      codes_usage_rate: 0
    })
  }

  // إنشاء سفير جديد
  const createAmbassador = async () => {
    if (!newAmbassador.name.trim() || !newAmbassador.phone.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم السفير ورقم الهاتف",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .rpc('create_ambassador_with_codes', {
          p_name: newAmbassador.name.trim(),
          p_phone: newAmbassador.phone.trim()
        })

      if (error) {
        throw error
      }

      await fetchData()
      setNewAmbassador({ name: '', phone: '' })

      toast({
        title: "تم إنشاء السفير بنجاح! 🎉",
        description: `تم إنشاء 3 أكواد للسفير ${newAmbassador.name}`
      })
    } catch (error: any) {
      console.error('خطأ في إنشاء السفير:', error)
      toast({
        title: "خطأ",
        description: error.message === "duplicate key value violates unique constraint \"ambassadors_phone_key\"" 
          ? "رقم الهاتف مسجل من قبل"
          : "فشل في إنشاء السفير",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // توليد رسائل السفير
  const generateMessages = (ambassador: Ambassador) => {
    const baseMessage = (codeObj: Code, ambassadorName: string) => `🎯 ${ambassadorName} بيبعتلك هدية مجانية من بيرفكتو طيبة

🥗 منتجات طبيعيه 100% بدون مواد حافظة!

🎁 خصم 10% على أول طلب ليك

🔑 كودك: ${codeObj.code}

📲 اطلب على واتساب: 01034207175

وابعتلنا الرسالة دي مع الكود، أو ورينا الرسالة من موبايلك في المحل علشان تستفيد بالخصم 😉

💎 لو عملت طلب من موقعنا، هتكسب نقاط تستبدلها بهدايا على طلباتك الجاية 🎯 (النقاط بتضاف للطلبات أونلاين بس).

📅 العرض ساري لغاية ${new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('ar-EG')}.

💬 وعايز تبعت هدايا لصحابك زي ما ${ambassadorName} عمل؟

اطلب من موقعنا + لايك وشير لصفحتنا، وهتاخد 3 دعوات باسمك.

🌐 رابط موقعنا: https://perfecto-phi.vercel.app/

👍 رابط صفحتنا على فيسبوك: https://www.facebook.com/profile.php?id=61570486528410`

    return ambassador.codes.map(code => baseMessage(code, ambassador.name))
  }

  // نسخ الرسالة
  const copyMessage = (message: string, index: number) => {
    navigator.clipboard.writeText(message)
    toast({
      title: "تم النسخ! 📋",
      description: `تم نسخ الرسالة رقم ${index + 1}`
    })
  }

  // نسخ جميع الرسائل
  const copyAllMessages = (ambassador: Ambassador) => {
    const messages = generateMessages(ambassador)
    const allMessages = messages.join('\n\n' + '='.repeat(50) + '\n\n')
    navigator.clipboard.writeText(allMessages)
    toast({
      title: "تم نسخ جميع الرسائل! 📋",
      description: `تم نسخ ${messages.length} رسائل للسفير ${ambassador.name}`
    })
  }

  // التحقق من صحة الكود قبل الاستخدام
  const validateCode = async (codeToValidate: string) => {
    if (!codeToValidate.trim()) {
      setCodeValidationResult(null)
      return
    }

    try {
      // البحث عن الكود في قاعدة البيانات
      const { data: codeData, error } = await supabase
        .from('ambassador_codes')
        .select(`
          id,
          code,
          is_used,
          expires_at,
          created_at,
          ambassadors (
            id,
            name,
            phone,
            is_active
          )
        `)
        .eq('code', codeToValidate.trim())
        .single()

      if (error || !codeData) {
        setCodeValidationResult({
          valid: false,
          message: "كود غير موجود",
          type: "not_found"
        })
        return
      }

      // التحقق من انتهاء الصلاحية
      const isExpired = new Date(codeData.expires_at) < new Date()
      
      // التحقق من حالة السفير
      const ambassadorActive = codeData.ambassadors?.[0]?.is_active

      if (!ambassadorActive) {
        setCodeValidationResult({
          valid: false,
          message: "السفير غير نشط",
          type: "ambassador_inactive",
          codeInfo: codeData
        })
        return
      }

      if (codeData.is_used) {
        setCodeValidationResult({
          valid: false,
          message: "الكود تم استخدامه من قبل",
          type: "already_used",
          codeInfo: codeData
        })
        return
      }

      if (isExpired) {
        setCodeValidationResult({
          valid: false,
          message: "الكود منتهي الصلاحية",
          type: "expired",
          codeInfo: codeData
        })
        return
      }

      setCodeValidationResult({
        valid: true,
        message: "الكود صالح للاستخدام",
        type: "valid",
        codeInfo: codeData
      })

    } catch (error) {
      console.error('خطأ في التحقق من الكود:', error)
      setCodeValidationResult({
        valid: false,
        message: "خطأ في التحقق من الكود",
        type: "error"
      })
    }
  }

  // تمييز الكود كمستخدم يدوياً
  const markCodeAsUsed = async (codeId: string, ambassadorName: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('ambassador_codes')
        .update({ is_used: true })
        .eq('id', codeId)

      if (error) {
        throw error
      }

      // إضافة سجل في code_usages
      const { error: usageError } = await supabase
        .from('code_usages')
        .insert({
          code_id: codeId,
          customer_info: 'تم تمييزه يدوياً من قبل الآدمن'
        })

      if (usageError) {
        console.error('خطأ في إضافة سجل الاستخدام:', usageError)
      }

      await fetchData()
      setCodeValidationResult(null)
      setSearchCode('')

      toast({
        title: "تم تمييز الكود كمستخدم! ✅",
        description: `كود السفير ${ambassadorName} تم تمييزه كمستخدم`
      })
    } catch (error: any) {
      console.error('خطأ في تمييز الكود:', error)
      toast({
        title: "خطأ",
        description: "فشل في تمييز الكود كمستخدم",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // استخدام كود
  // استخدام كود
  const useCode = async () => {
    if (!searchCode.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الكود",
        variant: "destructive"
      })
      return
    }

    // التحقق من صحة الكود أولاً
    await validateCode(searchCode.trim())
    
    // التحقق من نتيجة التحقق
    const tempResult = await new Promise(resolve => {
      setTimeout(() => {
        resolve(codeValidationResult)
      }, 100)
    })

    if (!codeValidationResult?.valid) {
      return // الخطأ سيظهر من دالة التحقق
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .rpc('use_ambassador_code', {
          p_code: searchCode.trim(),
          p_customer_info: customerInfo.trim() || null
        })

      if (error) {
        throw error
      }

      if (!data.success) {
        toast({
          title: "كود غير صحيح ❌",
          description: data.message || "الكود غير موجود أو تم استخدامه من قبل أو منتهي الصلاحية",
          variant: "destructive"
        })
        return
      }

      await fetchData()
      setSearchCode('')
      setCustomerInfo('')
      setCodeValidationResult(null)

      toast({
        title: "تم تسجيل استخدام الكود! ✅",
        description: `الكود ${searchCode.trim()} تم استخدامه بنجاح`
      })
    } catch (error: any) {
      console.error('خطأ في استخدام الكود:', error)
      toast({
        title: "خطأ",
        description: "فشل في تسجيل استخدام الكود",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // حذف سفير
  const deleteAmbassador = async (ambassadorId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('ambassadors')
        .update({ is_active: false })
        .eq('id', ambassadorId)

      if (error) {
        throw error
      }

      await fetchData()
      
      toast({
        title: "تم إلغاء تفعيل السفير",
        description: "تم إلغاء تفعيل السفير بنجاح"
      })
    } catch (error: any) {
      console.error('خطأ في حذف السفير:', error)
      toast({
        title: "خطأ",
        description: "فشل في حذف السفير",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // فلترة السفراء حسب البحث
  const filteredAmbassadors = ambassadors.filter(ambassador => {
    if (!searchAmbassador.trim()) return true
    
    const searchTerm = searchAmbassador.trim().toLowerCase()
    return (
      ambassador.name.toLowerCase().includes(searchTerm) ||
      ambassador.phone.includes(searchTerm)
    )
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Gift className="h-8 w-8" />
                  إدارة أكواد السفراء
                </CardTitle>
                <p className="text-white">
                  نظام إدارة أكواد الخصم والسفراء - للآدمن فقط
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchData}
                disabled={loading}
                className="bg-transparent text-white border-white hover:bg-white hover:text-red-600"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                تحديث البيانات
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.total_ambassadors}</p>
                  <p className="text-sm text-gray-800 font-medium">إجمالي السفراء</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.eligible_for_bonus}</p>
                  <p className="text-sm text-gray-800 font-medium">مؤهل للخصم</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Gift className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.total_codes_generated}</p>
                  <p className="text-sm text-gray-800 font-medium">إجمالي الأكواد</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{systemStats.total_codes_used}</p>
                  <p className="text-sm text-gray-800 font-medium">أكواد مستخدمة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* إنشاء سفير جديد */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <UserPlus className="h-6 w-6" />
                إنشاء سفير جديد
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ambassadorName">اسم السفير</Label>
                <Input
                  id="ambassadorName"
                  value={newAmbassador.name}
                  onChange={(e) => setNewAmbassador({...newAmbassador, name: e.target.value})}
                  placeholder="أدخل اسم السفير"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="ambassadorPhone">رقم الهاتف</Label>
                <Input
                  id="ambassadorPhone"
                  value={newAmbassador.phone}
                  onChange={(e) => setNewAmbassador({...newAmbassador, phone: e.target.value})}
                  placeholder="01xxxxxxxxx"
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={createAmbassador}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    إنشاء السفير مع 3 أكواد
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* استخدام كود */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                تسجيل استخدام كود
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="searchCode">الكود</Label>
                <Input
                  id="searchCode"
                  value={searchCode}
                  onChange={(e) => {
                    setSearchCode(e.target.value)
                    validateCode(e.target.value)
                  }}
                  placeholder="PT-xxxxxxxx"
                  className="mt-1 font-mono"
                />
                
                {/* نتيجة التحقق من الكود */}
                {codeValidationResult && (
                  <div className={`mt-2 p-3 rounded-lg border ${
                    codeValidationResult.valid 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      {codeValidationResult.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{codeValidationResult.message}</span>
                    </div>
                    
                    {codeValidationResult.codeInfo && (
                      <div className="mt-2 text-sm">
                        <p><strong>السفير:</strong> {codeValidationResult.codeInfo.ambassadors?.[0]?.name}</p>
                        <p><strong>هاتف:</strong> {codeValidationResult.codeInfo.ambassadors?.[0]?.phone}</p>
                        <p><strong>تاريخ الانتهاء:</strong> {new Date(codeValidationResult.codeInfo.expires_at).toLocaleDateString('ar-EG')}</p>
                        
                        {/* زر تمييز كمستخدم يدوياً */}
                        {codeValidationResult.type === 'valid' && (
                          <Button
                            onClick={() => markCodeAsUsed(
                              codeValidationResult.codeInfo.id,
                              codeValidationResult.codeInfo.ambassadors?.[0]?.name
                            )}
                            disabled={loading}
                            size="sm"
                            variant="outline"
                            className="mt-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            تمييز كمستخدم يدوياً
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="customerInfo">معلومات العميل (اختياري)</Label>
                <Input
                  id="customerInfo"
                  value={customerInfo}
                  onChange={(e) => setCustomerInfo(e.target.value)}
                  placeholder="اسم العميل أو رقم الهاتف"
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={useCode}
                disabled={loading || !codeValidationResult?.valid}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    تسجيل الاستخدام
                  </>
                )}
              </Button>
              
              {searchCode.trim() && (
                <Button 
                  onClick={() => validateCode(searchCode.trim())}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  إعادة فحص الكود
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* قائمة السفراء */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              قائمة السفراء والأكواد ({filteredAmbassadors.length})
            </CardTitle>
            
            {/* شريط البحث */}
            <div className="mt-4">
              <Label htmlFor="searchAmbassador">البحث عن سفير (بالاسم أو رقم الهاتف)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="searchAmbassador"
                  value={searchAmbassador}
                  onChange={(e) => setSearchAmbassador(e.target.value)}
                  placeholder="اكتب اسم السفير أو رقم الهاتف..."
                  className="flex-1"
                />
                {searchAmbassador && (
                  <Button
                    onClick={() => setSearchAmbassador('')}
                    variant="outline"
                    size="icon"
                  >
                    ✕
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredAmbassadors.length === 0 ? (
                <div className="text-center py-8 text-gray-800 font-medium">
                  {searchAmbassador.trim() ? (
                    <div>
                      <p>لا توجد نتائج للبحث عن: "{searchAmbassador}"</p>
                      <Button 
                        onClick={() => setSearchAmbassador('')}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        مسح البحث
                      </Button>
                    </div>
                  ) : (
                    'لا يوجد سفراء حتى الآن'
                  )}
                </div>
              ) : (
                filteredAmbassadors.map((ambassador) => {
                  const messages = generateMessages(ambassador)
                  const usagePercentage = (ambassador.stats.total_codes_used / ambassador.stats.total_codes_generated) * 100 || 0

                  return (
                    <Card key={ambassador.id} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              <span className="text-black font-bold">{ambassador.name}</span>
                              {ambassador.stats.is_eligible_for_bonus && (
                                <Badge className="bg-green-100 text-green-800">
                                  <Award className="h-3 w-3 mr-1" />
                                  مؤهل للخصم
                                </Badge>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 text-gray-800 font-medium mt-1">
                              <Phone className="h-4 w-4" />
                              {ambassador.phone}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyAllMessages(ambassador)}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              نسخ الكل
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAmbassador(ambassador.id)}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-800 font-medium">
                          <span>الأكواد المستخدمة: {ambassador.stats.total_codes_used}/{ambassador.stats.total_codes_generated}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full transition-all"
                              style={{ width: `${usagePercentage}%` }}
                            />
                          </div>
                          <span>{Math.round(usagePercentage)}%</span>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {messages.map((message, index) => {
                            const code = ambassador.codes[index]
                            const isUsed = code?.is_used || false
                            
                            return (
                              <Card key={index} className={`${isUsed ? 'bg-gray-50 border-gray-300' : 'bg-white border-red-200'}`}>
                                <CardHeader className="pb-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-black">رسالة {index + 1}</h4>
                                    <div className="flex items-center gap-2">
                                      {isUsed ? (
                                        <Badge className="bg-gray-100 text-gray-600">
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          مستخدم
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-green-100 text-green-800">
                                          <Clock className="h-3 w-3 mr-1" />
                                          متاح
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <code className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                                    <span className="text-black">{code?.code || 'لا يوجد كود'}</span>
                                  </code>
                                </CardHeader>
                                
                                <CardContent className="pt-0">
                                  <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto mb-3">
                                    <span className="text-black">{message.split('\n').slice(0, 3).join('\n')}...</span>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => copyMessage(message, index)}
                                      className="w-full text-black font-bold"
                                      disabled={isUsed}
                                    >
                                      <Copy className="h-4 w-4 mr-2" />
                                      <span className="text-black font-bold">نسخ الرسالة</span>
                                    </Button>
                                    
                                    {!isUsed && code?.id && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => markCodeAsUsed(code.id, ambassador.name)}
                                        className="w-full text-orange-600 border-orange-600 hover:bg-orange-50"
                                        disabled={loading}
                                      >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        تمييز كمستخدم
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* سجل استخدام الأكواد */}
        {codeUsages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                سجل استخدام الأكواد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {codeUsages.slice().reverse().slice(0, 10).map((usage, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <code className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                        {usage.code}
                      </code>
                      <span className="text-gray-800 font-medium mr-3">بواسطة: {usage.ambassador_name}</span>
                      {usage.customer_info && (
                        <span className="text-blue-700 font-medium mr-3">العميل: {usage.customer_info}</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {new Date(usage.used_at).toLocaleString('ar-EG')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
