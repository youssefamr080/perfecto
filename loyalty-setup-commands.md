# تعليمات إعداد نظام حماية نقاط الولاء

## خطوات التشغيل على Supabase SQL Editor:

1. افتح Supabase Dashboard
2. اذهب إلى SQL Editor
3. انسخ والصق الأوامر التالية **بالترتيب**:

### 1. إنشاء جدول تتبع المعاملات:
```sql
CREATE TABLE loyalty_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  transaction_type VARCHAR(20) NOT NULL,
  points_amount INTEGER NOT NULL,
  points_before INTEGER NOT NULL,
  points_after INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(50) DEFAULT 'SYSTEM'
);
```

### 2. إنشاء الفهارس:
```sql
CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_transactions_order_id ON loyalty_transactions(order_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);
```

### 3. إضافة عمود للطلبات:
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS previous_status VARCHAR(20);
```

### 4. دالة التحقق من النقاط:
```sql
CREATE OR REPLACE FUNCTION validate_user_points(user_uuid UUID)
RETURNS TABLE(
  is_valid BOOLEAN,
  current_points INTEGER,
  calculated_points INTEGER,
  difference INTEGER,
  error_message TEXT
) AS $$
DECLARE
  user_points INTEGER;
  earned_points INTEGER;
  used_points INTEGER;
  refunded_points INTEGER;
  deducted_points INTEGER;
  calculated_total INTEGER;
BEGIN
  SELECT loyalty_points INTO user_points
  FROM users WHERE id = user_uuid;
  
  IF user_points IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 0, 0, 'User not found'::TEXT;
    RETURN;
  END IF;
  
  SELECT 
    COALESCE(SUM(CASE WHEN transaction_type = 'EARNED' THEN points_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'USED' THEN points_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'REFUNDED' THEN points_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN transaction_type = 'DEDUCTED' THEN points_amount ELSE 0 END), 0)
  INTO earned_points, used_points, refunded_points, deducted_points
  FROM loyalty_transactions
  WHERE user_id = user_uuid;
  
  calculated_total := earned_points - used_points + refunded_points - deducted_points;
  
  RETURN QUERY SELECT 
    (user_points = calculated_total),
    user_points,
    calculated_total,
    (user_points - calculated_total),
    CASE 
      WHEN user_points = calculated_total THEN 'Points are valid'::TEXT
      ELSE 'Points mismatch detected'::TEXT
    END;
END;
$$ LANGUAGE plpgsql;
```

### 5. دالة إضافة معاملة:
```sql
CREATE OR REPLACE FUNCTION add_loyalty_transaction(
  p_user_id UUID,
  p_order_id UUID,
  p_transaction_type VARCHAR(20),
  p_points_amount INTEGER,
  p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  current_points INTEGER;
  new_points INTEGER;
  transaction_id UUID;
BEGIN
  IF p_transaction_type NOT IN ('EARNED', 'USED', 'REFUNDED', 'DEDUCTED') THEN
    RAISE EXCEPTION 'Invalid transaction type: %', p_transaction_type;
  END IF;
  
  SELECT loyalty_points INTO current_points
  FROM users WHERE id = p_user_id FOR UPDATE;
  
  IF current_points IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  CASE p_transaction_type
    WHEN 'EARNED' THEN new_points := current_points + p_points_amount;
    WHEN 'USED' THEN 
      IF current_points < p_points_amount THEN
        RAISE EXCEPTION 'Insufficient points. Current: %, Required: %', current_points, p_points_amount;
      END IF;
      new_points := current_points - p_points_amount;
    WHEN 'REFUNDED' THEN new_points := current_points + p_points_amount;
    WHEN 'DEDUCTED' THEN new_points := current_points - p_points_amount;
  END CASE;
  
  IF new_points < 0 THEN
    new_points := 0;
  END IF;
  
  INSERT INTO loyalty_transactions (
    user_id, order_id, transaction_type, points_amount, 
    points_before, points_after, description
  ) VALUES (
    p_user_id, p_order_id, p_transaction_type, p_points_amount,
    current_points, new_points, p_description
  ) RETURNING id INTO transaction_id;
  
  UPDATE users SET loyalty_points = new_points WHERE id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 6. دالة معالجة إلغاء الطلب:
```sql
CREATE OR REPLACE FUNCTION handle_order_cancellation(p_order_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  points_deducted INTEGER,
  points_refunded INTEGER
) AS $$
DECLARE
  order_record RECORD;
  points_to_deduct INTEGER := 0;
  points_to_refund INTEGER := 0;
  penalty_points INTEGER;
BEGIN
  SELECT * INTO order_record FROM orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Order not found'::TEXT, 0, 0;
    RETURN;
  END IF;
  
  IF order_record.status = 'CANCELLED' THEN
    RETURN QUERY SELECT FALSE, 'Order already cancelled'::TEXT, 0, 0;
    RETURN;
  END IF;
  
  points_to_refund := COALESCE(order_record.points_used, 0);
  penalty_points := COALESCE(order_record.points_earned, 0);
  
  IF order_record.final_amount > 200 THEN
    penalty_points := penalty_points + 50;
  ELSIF order_record.final_amount > 100 THEN
    penalty_points := penalty_points + 25;
  ELSE
    penalty_points := penalty_points + 10;
  END IF;
  
  points_to_deduct := penalty_points;
  
  IF points_to_refund > 0 THEN
    PERFORM add_loyalty_transaction(
      order_record.user_id, p_order_id, 'REFUNDED', points_to_refund,
      'Refund for cancelled order #' || order_record.order_number
    );
  END IF;
  
  IF points_to_deduct > 0 THEN
    PERFORM add_loyalty_transaction(
      order_record.user_id, p_order_id, 'DEDUCTED', points_to_deduct,
      'Penalty for cancelling order #' || order_record.order_number || ' (Value: ' || order_record.final_amount || ' EGP)'
    );
  END IF;
  
  UPDATE orders SET 
    previous_status = status,
    status = 'CANCELLED',
    updated_at = NOW()
  WHERE id = p_order_id;
  
  RETURN QUERY SELECT TRUE, 'Order cancelled successfully'::TEXT, points_to_deduct, points_to_refund;
END;
$$ LANGUAGE plpgsql;
```

### 7. المؤشرات الإضافية:
```sql
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
```

## ملاحظات مهمة:
- تأكد من تشغيل الأوامر بالترتيب المذكور
- إذا ظهر خطأ في أي أمر، تحقق من أن الجداول موجودة
- النظام سيمنع التلاعب في النقاط ويتتبع جميع المعاملات
- عند إلغاء الطلب سيتم خصم نقاط عقوبة حسب قيمة الطلب
