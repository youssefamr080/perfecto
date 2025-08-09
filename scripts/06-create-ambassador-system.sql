-- إنشاء جداول نظام السفراء والأكواد (منفصل عن باقي الموقع)

-- 1. جدول السفراء
CREATE TABLE ambassadors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);

-- 2. جدول أكواد الخصم
CREATE TABLE ambassador_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER DEFAULT 1
);

-- 3. جدول استخدام الأكواد
CREATE TABLE code_usages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES ambassador_codes(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_info TEXT,
  discount_amount DECIMAL(10,2),
  order_reference VARCHAR(255),
  notes TEXT
);

-- 4. جدول إحصائيات السفراء
CREATE TABLE ambassador_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  total_codes_generated INTEGER DEFAULT 0,
  total_codes_used INTEGER DEFAULT 0,
  total_discount_given DECIMAL(10,2) DEFAULT 0,
  is_eligible_for_bonus BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(ambassador_id)
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX idx_ambassadors_phone ON ambassadors(phone);
CREATE INDEX idx_ambassador_codes_code ON ambassador_codes(code);
CREATE INDEX idx_ambassador_codes_ambassador_id ON ambassador_codes(ambassador_id);
CREATE INDEX idx_code_usages_code_id ON code_usages(code_id);
CREATE INDEX idx_code_usages_used_at ON code_usages(used_at);
CREATE INDEX idx_ambassador_stats_ambassador_id ON ambassador_stats(ambassador_id);

-- تمكين Row Level Security
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_stats ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان - يمكن الوصول لها من أي مستخدم مؤقتاً للتطوير
-- في المستقبل يمكن تقييدها لمستخدمين محددين فقط

CREATE POLICY "Allow all operations on ambassadors" ON ambassadors FOR ALL USING (true);
CREATE POLICY "Allow all operations on ambassador_codes" ON ambassador_codes FOR ALL USING (true);
CREATE POLICY "Allow all operations on code_usages" ON code_usages FOR ALL USING (true);
CREATE POLICY "Allow all operations on ambassador_stats" ON ambassador_stats FOR ALL USING (true);

-- دوال مساعدة لإدارة النظام

-- دالة لتوليد كود عشوائي
CREATE OR REPLACE FUNCTION generate_ambassador_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := 'PT-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- دالة لإنشاء سفير جديد مع 3 أكواد
CREATE OR REPLACE FUNCTION create_ambassador_with_codes(
  p_name TEXT,
  p_phone TEXT
)
RETURNS JSON AS $$
DECLARE
  v_ambassador_id UUID;
  v_code TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_codes JSON[] := '{}';
  i INTEGER;
BEGIN
  -- إدراج السفير
  INSERT INTO ambassadors (name, phone)
  VALUES (p_name, p_phone)
  RETURNING id INTO v_ambassador_id;
  
  -- حساب تاريخ انتهاء الصلاحية (15 يوم)
  v_expires_at := NOW() + INTERVAL '15 days';
  
  -- إنشاء 3 أكواد
  FOR i IN 1..3 LOOP
    LOOP
      v_code := generate_ambassador_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM ambassador_codes WHERE code = v_code);
    END LOOP;
    
    INSERT INTO ambassador_codes (code, ambassador_id, expires_at)
    VALUES (v_code, v_ambassador_id, v_expires_at);
    
    v_codes := v_codes || json_build_object('code', v_code, 'expires_at', v_expires_at);
  END LOOP;
  
  -- إنشاء سجل إحصائيات
  INSERT INTO ambassador_stats (ambassador_id, total_codes_generated)
  VALUES (v_ambassador_id, 3);
  
  RETURN json_build_object(
    'ambassador_id', v_ambassador_id,
    'name', p_name,
    'phone', p_phone,
    'codes', array_to_json(v_codes)
  );
END;
$$ LANGUAGE plpgsql;

-- دالة لاستخدام كود
CREATE OR REPLACE FUNCTION use_ambassador_code(
  p_code TEXT,
  p_customer_info TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_code_record RECORD;
  v_ambassador_record RECORD;
  v_usage_id UUID;
  v_total_used INTEGER;
BEGIN
  -- البحث عن الكود
  SELECT ac.*, a.name as ambassador_name, a.phone as ambassador_phone
  INTO v_code_record
  FROM ambassador_codes ac
  JOIN ambassadors a ON ac.ambassador_id = a.id
  WHERE ac.code = p_code
    AND ac.is_used = false
    AND ac.expires_at > NOW()
    AND a.is_active = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'كود غير صحيح أو منتهي الصلاحية أو مستخدم من قبل'
    );
  END IF;
  
  -- تسجيل استخدام الكود
  INSERT INTO code_usages (code_id, customer_info)
  VALUES (v_code_record.id, p_customer_info)
  RETURNING id INTO v_usage_id;
  
  -- تحديث حالة الكود
  UPDATE ambassador_codes 
  SET is_used = true 
  WHERE id = v_code_record.id;
  
  -- تحديث إحصائيات السفير
  UPDATE ambassador_stats 
  SET 
    total_codes_used = total_codes_used + 1,
    last_activity_at = NOW(),
    is_eligible_for_bonus = (total_codes_used + 1 >= 3)
  WHERE ambassador_id = v_code_record.ambassador_id;
  
  -- جلب العدد الكلي للأكواد المستخدمة
  SELECT total_codes_used INTO v_total_used
  FROM ambassador_stats
  WHERE ambassador_id = v_code_record.ambassador_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'تم تسجيل استخدام الكود بنجاح',
    'code', p_code,
    'ambassador_name', v_code_record.ambassador_name,
    'ambassador_phone', v_code_record.ambassador_phone,
    'total_codes_used', v_total_used,
    'is_eligible_for_bonus', v_total_used >= 3,
    'usage_id', v_usage_id
  );
END;
$$ LANGUAGE plpgsql;

-- دالة للحصول على إحصائيات النظام
CREATE OR REPLACE FUNCTION get_ambassador_system_stats()
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_ambassadors', COUNT(DISTINCT a.id),
    'active_ambassadors', COUNT(DISTINCT CASE WHEN a.is_active THEN a.id END),
    'eligible_for_bonus', COUNT(DISTINCT CASE WHEN ast.is_eligible_for_bonus THEN a.id END),
    'total_codes_generated', COALESCE(SUM(ast.total_codes_generated), 0),
    'total_codes_used', COALESCE(SUM(ast.total_codes_used), 0),
    'total_discount_given', COALESCE(SUM(ast.total_discount_given), 0),
    'codes_usage_rate', 
      CASE 
        WHEN COALESCE(SUM(ast.total_codes_generated), 0) > 0 
        THEN ROUND((COALESCE(SUM(ast.total_codes_used), 0)::DECIMAL / COALESCE(SUM(ast.total_codes_generated), 1)::DECIMAL) * 100, 2)
        ELSE 0 
      END
  )
  INTO v_stats
  FROM ambassadors a
  LEFT JOIN ambassador_stats ast ON a.id = ast.ambassador_id;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- إدراج بيانات تجريبية للاختبار (يمكن حذفها لاحقاً)
/*
-- إنشاء سفير تجريبي
SELECT create_ambassador_with_codes('أحمد محمد', '01234567890');
SELECT create_ambassador_with_codes('فاطمة علي', '01234567891');

-- اختبار استخدام كود
-- SELECT use_ambassador_code('PT-xxxxxxxx', 'عميل تجريبي');
*/
