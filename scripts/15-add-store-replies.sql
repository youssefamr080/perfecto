-- Add store reply system to reviews
-- إضافة نظام ردود المتجر على المراجعات

-- إضافة عمود رد المتجر إلى جدول المراجعات
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS store_reply TEXT,
ADD COLUMN IF NOT EXISTS store_reply_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS replied_by_admin BOOLEAN DEFAULT FALSE;

-- إضافة فهرس للبحث في الردود
CREATE INDEX IF NOT EXISTS idx_product_reviews_store_reply 
ON product_reviews(store_reply_at DESC) 
WHERE store_reply IS NOT NULL;

-- إضافة بعض البيانات التجريبية
UPDATE product_reviews 
SET 
  store_reply = 'شكراً لك على هذا التقييم الإيجابي! نحن سعداء بأن المنتج أعجبك ونتطلع لخدمتك مرة أخرى 🛒',
  store_reply_at = NOW(),
  replied_by_admin = TRUE
WHERE rating >= 4 AND is_approved = TRUE AND store_reply IS NULL
  AND id IN (
    SELECT id FROM product_reviews 
    WHERE rating >= 4 AND is_approved = TRUE AND store_reply IS NULL
    ORDER BY created_at DESC
    LIMIT 2
  );
