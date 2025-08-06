-- سكريبت لتحديث الطلبات الموجودة وإضافة معاملات نقاط تاريخية

-- 1. إضافة معاملات تاريخية للطلبات الموجودة
INSERT INTO loyalty_transactions (
  user_id, 
  order_id, 
  transaction_type, 
  points_amount, 
  points_before, 
  points_after, 
  description,
  created_at
)
SELECT 
  o.user_id,
  o.id,
  'USED',
  o.points_used,
  u.loyalty_points + o.points_used - COALESCE(o.points_earned, 0) as points_before,
  u.loyalty_points,
  'Historical transaction: Points used for order #' || o.order_number,
  o.created_at
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.points_used > 0 
  AND o.status != 'CANCELLED'
  AND NOT EXISTS (
    SELECT 1 FROM loyalty_transactions lt 
    WHERE lt.order_id = o.id AND lt.transaction_type = 'USED'
  );

-- 2. إضافة معاملات تاريخية للنقاط المكتسبة
INSERT INTO loyalty_transactions (
  user_id, 
  order_id, 
  transaction_type, 
  points_amount, 
  points_before, 
  points_after, 
  description,
  created_at
)
SELECT 
  o.user_id,
  o.id,
  'EARNED',
  o.points_earned,
  u.loyalty_points - o.points_earned as points_before,
  u.loyalty_points,
  'Historical transaction: Points earned from order #' || o.order_number || ' (' || o.final_amount || ' EGP)',
  o.created_at + INTERVAL '1 minute' -- إضافة دقيقة للتأكد من الترتيب الصحيح
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.points_earned > 0 
  AND o.status != 'CANCELLED'
  AND NOT EXISTS (
    SELECT 1 FROM loyalty_transactions lt 
    WHERE lt.order_id = o.id AND lt.transaction_type = 'EARNED'
  );

-- 3. التحقق من صحة النقاط لجميع المستخدمين
SELECT 
  u.id,
  u.name,
  u.loyalty_points as current_points,
  COALESCE(
    (SELECT SUM(CASE 
      WHEN transaction_type = 'EARNED' THEN points_amount
      WHEN transaction_type = 'REFUNDED' THEN points_amount
      WHEN transaction_type = 'USED' THEN -points_amount
      WHEN transaction_type = 'DEDUCTED' THEN -points_amount
      ELSE 0
    END) FROM loyalty_transactions WHERE user_id = u.id), 0
  ) as calculated_points,
  u.loyalty_points - COALESCE(
    (SELECT SUM(CASE 
      WHEN transaction_type = 'EARNED' THEN points_amount
      WHEN transaction_type = 'REFUNDED' THEN points_amount
      WHEN transaction_type = 'USED' THEN -points_amount
      WHEN transaction_type = 'DEDUCTED' THEN -points_amount
      ELSE 0
    END) FROM loyalty_transactions WHERE user_id = u.id), 0
  ) as difference
FROM users u
WHERE u.loyalty_points > 0
ORDER BY ABS(u.loyalty_points - COALESCE(
  (SELECT SUM(CASE 
    WHEN transaction_type = 'EARNED' THEN points_amount
    WHEN transaction_type = 'REFUNDED' THEN points_amount
    WHEN transaction_type = 'USED' THEN -points_amount
    WHEN transaction_type = 'DEDUCTED' THEN -points_amount
    ELSE 0
  END) FROM loyalty_transactions WHERE user_id = u.id), 0
)) DESC;

-- 4. إصلاح النقاط المختلة (إن وجدت)
-- هذا الجزء اختياري - فقط إذا وجدت اختلافات في النقاط

-- تحديث النقاط لتطابق المحسوب من المعاملات
UPDATE users 
SET loyalty_points = (
  SELECT COALESCE(SUM(CASE 
    WHEN transaction_type = 'EARNED' THEN points_amount
    WHEN transaction_type = 'REFUNDED' THEN points_amount
    WHEN transaction_type = 'USED' THEN -points_amount
    WHEN transaction_type = 'DEDUCTED' THEN -points_amount
    ELSE 0
  END), 0)
  FROM loyalty_transactions 
  WHERE user_id = users.id
)
WHERE id IN (
  SELECT u.id FROM users u
  WHERE u.loyalty_points != COALESCE(
    (SELECT SUM(CASE 
      WHEN transaction_type = 'EARNED' THEN points_amount
      WHEN transaction_type = 'REFUNDED' THEN points_amount
      WHEN transaction_type = 'USED' THEN -points_amount
      WHEN transaction_type = 'DEDUCTED' THEN -points_amount
      ELSE 0
    END) FROM loyalty_transactions WHERE user_id = u.id), 0
  )
);

-- 5. إنشاء view لعرض إحصائيات نقاط الولاء
CREATE OR REPLACE VIEW loyalty_stats AS
SELECT 
  u.id,
  u.name,
  u.phone,
  u.loyalty_points,
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(SUM(o.final_amount), 0) as total_spent,
  COALESCE(SUM(o.points_used), 0) as total_points_used,
  COALESCE(SUM(o.points_earned), 0) as total_points_earned,
  (
    SELECT COUNT(*) FROM loyalty_transactions lt 
    WHERE lt.user_id = u.id AND lt.transaction_type = 'DEDUCTED'
  ) as penalty_count,
  (
    SELECT COALESCE(SUM(points_amount), 0) FROM loyalty_transactions lt 
    WHERE lt.user_id = u.id AND lt.transaction_type = 'DEDUCTED'
  ) as total_penalties
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'CANCELLED'
WHERE u.loyalty_points > 0
GROUP BY u.id, u.name, u.phone, u.loyalty_points
ORDER BY u.loyalty_points DESC;

-- 6. إنشاء view لمراقبة الطلبات الملغاة
CREATE OR REPLACE VIEW cancelled_orders_stats AS
SELECT 
  o.*,
  u.name as user_name,
  u.phone as user_phone,
  u.loyalty_points as current_user_points,
  (
    SELECT SUM(points_amount) FROM loyalty_transactions lt 
    WHERE lt.order_id = o.id AND lt.transaction_type = 'DEDUCTED'
  ) as penalty_applied,
  (
    SELECT SUM(points_amount) FROM loyalty_transactions lt 
    WHERE lt.order_id = o.id AND lt.transaction_type = 'REFUNDED'
  ) as points_refunded
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'CANCELLED'
ORDER BY o.created_at DESC;
