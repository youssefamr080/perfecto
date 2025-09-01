-- إضافة الحقول المفقودة مع تجنب أخطاء التكرار
-- Add missing fields while avoiding duplication errors

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

ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS flagged_count INTEGER DEFAULT 0;

-- 4. إنشاء جدول التصويتات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS review_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, review_id)
);

-- 5. إنشاء جدول التقارير إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS review_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, review_id)
);

-- 6. تمكين Row Level Security إذا لم يكن مفعلاً
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'review_votes' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'review_reports' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 7. حذف السياسات الموجودة وإعادة إنشاؤها
DROP POLICY IF EXISTS "Users can view all votes" ON review_votes;
DROP POLICY IF EXISTS "Users can vote on reviews" ON review_votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON review_votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON review_votes;

DROP POLICY IF EXISTS "Admins can view all reports" ON review_reports;
DROP POLICY IF EXISTS "Users can create reports" ON review_reports;

-- 8. إنشاء السياسات الجديدة
CREATE POLICY "Users can view all votes" ON review_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can vote on reviews" ON review_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON review_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON review_votes
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports" ON review_reports
    FOR SELECT USING (true);

CREATE POLICY "Users can create reports" ON review_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. إنشاء الفهارس للأداء
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_helpful_count ON product_reviews(helpful_count);
CREATE INDEX IF NOT EXISTS idx_product_reviews_store_reply ON product_reviews(store_reply_at) WHERE store_reply IS NOT NULL;

-- 10. تحديث البيانات الموجودة
UPDATE product_reviews 
SET helpful_count = FLOOR(RANDOM() * 10 + 1)::INTEGER,
    not_helpful_count = FLOOR(RANDOM() * 3)::INTEGER,
    is_verified_purchase = (RANDOM() > 0.3)
WHERE helpful_count = 0 OR helpful_count IS NULL;

-- 11. إضافة ردود متجر للمراجعات الموجودة
UPDATE product_reviews 
SET 
    store_reply = CASE 
        WHEN rating >= 4 THEN 'شكراً لك على التقييم الإيجابي! نحن سعداء بإعجابك بمنتجاتنا 🙏'
        WHEN rating = 3 THEN 'نشكرك على ملاحظاتك، ونعمل دائماً على تحسين جودة منتجاتنا'
        ELSE 'نعتذر عن عدم رضاك. سنتواصل معك لحل أي مشكلة'
    END,
    store_reply_at = created_at + INTERVAL '1 day'
WHERE store_reply IS NULL 
  AND RANDOM() > 0.6
  AND is_approved = true;

-- 12. إضافة مراجعة تجريبية مع رد متجر
DO $$
DECLARE
    sample_product_id UUID;
    sample_user_id UUID;
BEGIN
    -- البحث عن منتج ومستخدم موجودين
    SELECT id INTO sample_product_id FROM products LIMIT 1;
    SELECT id INTO sample_user_id FROM users LIMIT 1;
    
    IF sample_product_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
        INSERT INTO product_reviews (
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
        ) VALUES (
            sample_product_id,
            sample_user_id,
            5,
            'منتج ممتاز جداً، جودة عالية وطعم رائع! أنصح به بشدة لجميع أفراد العائلة.',
            true,
            12,
            2,
            'شكراً لك على المراجعة الرائعة! نحن سعداء أن المنتج أعجبك. نتطلع لخدمتك مرة أخرى قريباً 🌟',
            NOW() + INTERVAL '1 hour',
            true,
            NOW() - INTERVAL '2 days'
        )
        ON CONFLICT (user_id, product_id) DO NOTHING;
    END IF;
END $$;

COMMIT;
