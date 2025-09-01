-- إضافة الحقول المفقودة تدريجياً للتأكد من عدم حدوث أخطاء
-- Add missing fields gradually to ensure no errors occur

-- 1. إضافة حقول التصويت المفيد/غير مفيد
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS not_helpful_count INTEGER DEFAULT 0;

-- 2. إضافة حقول ردود المتجر
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS store_reply TEXT;

ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS store_reply_at TIMESTAMP WITH TIME ZONE;

-- 3. إضافة حقول إضافية
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT FALSE;

ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- 4. إضافة بعض البيانات التجريبية للمراجعات الموجودة
UPDATE product_reviews 
SET helpful_count = FLOOR(RANDOM() * 10 + 1)::INTEGER,
    not_helpful_count = FLOOR(RANDOM() * 3)::INTEGER,
    is_verified_purchase = (RANDOM() > 0.3)
WHERE helpful_count IS NULL OR helpful_count = 0;

-- 5. إضافة مراجعة تجريبية مع رد متجر إذا لم تكن موجودة
INSERT INTO product_reviews (
    id,
    product_id, 
    user_id, 
    rating, 
    comment, 
    is_approved, 
    helpful_count, 
    not_helpful_count,
    store_reply,
    store_reply_at,
    is_verified_purchase,
    created_at
) 
SELECT 
    gen_random_uuid(),
    p.id,
    u.id,
    5,
    'منتج ممتاز جداً، جودة عالية وطعم رائع! أنصح به بشدة لجميع أفراد العائلة.',
    true,
    8,
    1,
    'شكراً لك على المراجعة الرائعة! نحن سعداء أن المنتج أعجبك. نتطلع لخدمتك مرة أخرى قريباً 🌟',
    NOW() + INTERVAL '1 hour',
    true,
    NOW() - INTERVAL '2 days'
FROM products p, users u 
WHERE p.name ILIKE '%لحم%' OR p.name ILIKE '%دجاج%'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = p.id 
    AND pr.store_reply IS NOT NULL
  )
LIMIT 1;

-- تحديث المراجعات الموجودة لتشمل ردود متجر عشوائية
UPDATE product_reviews 
SET 
    store_reply = CASE 
        WHEN rating >= 4 THEN 'شكراً لك على التقييم الإيجابي! نحن سعداء بإعجابك بمنتجاتنا 🙏'
        WHEN rating = 3 THEN 'نشكرك على ملاحظاتك، ونعمل دائماً على تحسين جودة منتجاتنا'
        ELSE 'نعتذر عن عدم رضاك. سنتواصل معك لحل أي مشكلة'
    END,
    store_reply_at = created_at + INTERVAL '1 day'
WHERE store_reply IS NULL 
  AND RANDOM() > 0.7  -- إضافة ردود للـ 30% فقط
  AND is_approved = true;

COMMIT;
