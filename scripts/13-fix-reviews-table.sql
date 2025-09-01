-- Fix product_reviews table to allow reviews without order_id
-- إصلاح جدول المراجعات للسماح بالمراجعات بدون order_id

-- إزالة أي قيود فريدة قديمة قد تكون موجودة
ALTER TABLE product_reviews 
DROP CONSTRAINT IF EXISTS product_reviews_user_id_product_id_order_id_key;

-- إضافة قيد فريد جديد يسمح بمراجعة واحدة لكل مستخدم لكل منتج
ALTER TABLE product_reviews 
DROP CONSTRAINT IF EXISTS unique_user_product_review;

ALTER TABLE product_reviews 
ADD CONSTRAINT unique_user_product_review 
UNIQUE (user_id, product_id);

-- إضافة فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_product 
ON product_reviews(user_id, product_id);

-- إضافة بعض المراجعات التجريبية المعتمدة للاختبار
INSERT INTO product_reviews (user_id, product_id, rating, comment, is_approved, created_at)
VALUES 
  ((SELECT id FROM users LIMIT 1), '38cb7e72-87a3-44d3-9748-ad19dab4db9d', 5, 'منتج ممتاز، أنصح بشدة بشرائه!', true, NOW()),
  ((SELECT id FROM users LIMIT 1), '38cb7e72-87a3-44d3-9748-ad19dab4db9d', 4, 'جودة جيدة ووصل في الوقت المحدد', true, NOW() - INTERVAL '1 day'),
  ((SELECT id FROM users LIMIT 1), 'f68c0af8-6696-431b-a3b9-ee52917634f8', 5, 'منتج رائع والطعم لذيذ جداً', true, NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, product_id) DO NOTHING;
