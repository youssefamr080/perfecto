-- Simplified store reply system setup
-- إعداد نظام ردود المتجر المبسط

-- إضافة الأعمدة المطلوبة
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS store_reply TEXT;

ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS store_reply_at TIMESTAMP;

ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS replied_by_admin BOOLEAN DEFAULT FALSE;

-- إضافة فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_product_reviews_store_reply 
ON product_reviews(store_reply_at DESC) 
WHERE store_reply IS NOT NULL;

-- إضافة رد تجريبي للمراجعة الموجودة
UPDATE product_reviews 
SET 
  store_reply = 'شكراً لك على هذا التقييم الرائع! نحن سعداء بأن المنتج أعجبك. نقدر ثقتك بنا ونتطلع لخدمتك مرة أخرى 🛒✨',
  store_reply_at = NOW(),
  replied_by_admin = TRUE
WHERE id = '245d5562-9652-4078-94fa-9999341d71f1';
