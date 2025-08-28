-- إصلاح مشكلة Row Level Security لجدول loyalty_transactions

-- إلغاء تفعيل RLS مؤقتاً لتطبيق الإصلاحات  
ALTER TABLE loyalty_transactions DISABLE ROW LEVEL SECURITY;

-- حذف أي سياسات موجودة
DROP POLICY IF EXISTS "Users can view own loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "Users can insert own loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "Service role has full access to loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "System can insert loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "System can update loyalty transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "No delete unless admin" ON loyalty_transactions;

-- إعادة تفعيل RLS
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات جديدة أكثر مرونة

-- 1. سياسة القراءة: المستخدمون يمكنهم رؤية معاملاتهم فقط
CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. سياسة الإدراج: السماح للجميع بإضافة معاملات (لأن الدالة محمية)
CREATE POLICY "Allow insert loyalty transactions" ON loyalty_transactions
  FOR INSERT
  WITH CHECK (true);

-- 3. سياسة التحديث: منع التحديث المباشر
CREATE POLICY "No direct updates" ON loyalty_transactions
  FOR UPDATE
  USING (false);

-- 4. سياسة الحذف: منع الحذف تماماً
CREATE POLICY "No delete allowed" ON loyalty_transactions
  FOR DELETE
  USING (false);

-- إنشاء دالة محسنة للتعامل مع معاملات النقاط
CREATE OR REPLACE FUNCTION add_loyalty_transaction(
  p_user_id UUID,
  p_order_id UUID DEFAULT NULL,
  p_transaction_type VARCHAR(20),
  p_points_amount INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- تشغيل بصلاحيات المنشئ
AS $$
DECLARE
  current_points INTEGER;
  new_points INTEGER;
  result JSON;
BEGIN
  -- التحقق من وجود المستخدم
  SELECT loyalty_points INTO current_points 
  FROM users 
  WHERE id = p_user_id;
  
  IF current_points IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'المستخدم غير موجود');
  END IF;

  -- حساب النقاط الجديدة حسب نوع المعاملة
  CASE p_transaction_type
    WHEN 'EARNED' THEN
      new_points := current_points + p_points_amount;
    WHEN 'USED' THEN
      new_points := current_points - p_points_amount;
      IF new_points < 0 THEN
        RETURN json_build_object('success', false, 'error', 'نقاط غير كافية');
      END IF;
    WHEN 'REFUNDED' THEN
      new_points := current_points + p_points_amount;
    WHEN 'DEDUCTED' THEN
      new_points := current_points - p_points_amount;
      IF new_points < 0 THEN
        new_points := 0; -- لا تقل عن الصفر في حالة الخصم
      END IF;
    ELSE
      RETURN json_build_object('success', false, 'error', 'نوع معاملة غير صحيح');
  END CASE;

  -- تحديث نقاط المستخدم
  UPDATE users 
  SET loyalty_points = new_points,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- تسجيل المعاملة بشكل آمن
  INSERT INTO loyalty_transactions (
    user_id,
    order_id,
    transaction_type,
    points_amount,
    points_before,
    points_after,
    description,
    created_by
  ) VALUES (
    p_user_id,
    p_order_id,
    p_transaction_type,
    p_points_amount,
    current_points,
    new_points,
    COALESCE(p_description, 'معاملة نقاط - ' || p_transaction_type),
    'SYSTEM'
  );

  -- إرجاع النتيجة
  RETURN json_build_object(
    'success', true,
    'points_before', current_points,
    'points_change', p_points_amount,
    'points_after', new_points,
    'transaction_type', p_transaction_type
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'خطأ في النظام: ' || SQLERRM
    );
END;
$$;

-- منح الصلاحيات المناسبة
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON loyalty_transactions TO authenticated;
GRANT EXECUTE ON FUNCTION add_loyalty_transaction TO authenticated, anon;

-- إنشاء دالة مساعدة لتبسيط إضافة النقاط
CREATE OR REPLACE FUNCTION earn_loyalty_points(
  user_uuid UUID,
  order_uuid UUID,
  points_amount INTEGER,
  description TEXT DEFAULT 'نقاط من طلب مكتمل'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN add_loyalty_transaction(user_uuid, order_uuid, 'EARNED', points_amount, description);
END;
$$;

-- إنشاء دالة مساعدة لاستخدام النقاط
CREATE OR REPLACE FUNCTION use_loyalty_points(
  user_uuid UUID,
  order_uuid UUID,
  points_amount INTEGER,
  description TEXT DEFAULT 'استخدام نقاط في طلب'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN add_loyalty_transaction(user_uuid, order_uuid, 'USED', points_amount, description);
END;
$$;

-- منح صلاحيات للدوال الجديدة
GRANT EXECUTE ON FUNCTION earn_loyalty_points TO authenticated, anon;
GRANT EXECUTE ON FUNCTION use_loyalty_points TO authenticated, anon;
