-- إزالة عمود الصور من جدول المراجعات وإصلاح أخطاء قاعدة البيانات
-- Remove images column from product_reviews table and fix database errors

-- إضافة عمود is_admin للمستخدمين إذا لم يكن موجود
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- إزالة عمود الصور إذا كان موجود
ALTER TABLE product_reviews 
DROP COLUMN IF EXISTS images;

-- تحديث جميع المراجعات الموجودة لضمان توافق النظام الجديد
UPDATE product_reviews 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- إعادة إنشاء فهرس الأداء للمراجعات المعتمدة
DROP INDEX IF EXISTS idx_product_reviews_product_id_approved;
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id_approved 
ON product_reviews(product_id, is_approved);

-- إضافة فهرس جديد للبحث السريع بالتقييم
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating_created 
ON product_reviews(rating, created_at DESC);

-- تحديث إحصائيات الجدول
ANALYZE product_reviews;
