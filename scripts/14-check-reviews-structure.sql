-- Check current table structure
-- فحص بنية الجدول الحالية

-- عرض بنية جدول المراجعات (أعمدة الجدول)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'product_reviews'
ORDER BY ordinal_position;

-- عرض جميع القيود على الجدول
SELECT constraint_name, constraint_type, table_name 
FROM information_schema.table_constraints 
WHERE table_name = 'product_reviews';

-- عرض عدد المراجعات الحالية
SELECT 
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE is_approved = true) as approved_reviews,
    COUNT(*) FILTER (WHERE is_approved = false) as pending_reviews
FROM product_reviews;

-- عرض آخر 5 مراجعات
SELECT id, user_id, product_id, rating, comment, is_approved, created_at 
FROM product_reviews 
ORDER BY created_at DESC 
LIMIT 5;
