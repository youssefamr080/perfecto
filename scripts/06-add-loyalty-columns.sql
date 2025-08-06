-- تحقق من وجود الجدول أولاً
SELECT table_name FROM information_schema.tables WHERE table_name = 'orders';

-- إضافة أعمدة نظام الولاء إلى جدول orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS points_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS points_discount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- تحديث البيانات الموجودة
UPDATE public.orders 
SET 
  points_used = COALESCE(points_used, 0),
  points_discount = COALESCE(points_discount, 0.00),
  points_earned = COALESCE(points_earned, 0)
WHERE points_used IS NULL OR points_discount IS NULL OR points_earned IS NULL;

-- إضافة فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_orders_points_used ON public.orders(points_used);
CREATE INDEX IF NOT EXISTS idx_orders_points_earned ON public.orders(points_earned);

-- التحقق من الأعمدة المضافة
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('points_used', 'points_discount', 'points_earned')
ORDER BY column_name;
