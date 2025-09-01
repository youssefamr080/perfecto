-- استعادة جميع ميزات المراجعات المحسنة
-- Restore all enhanced review features

-- إضافة الأعمدة المفقودة إلى جدول المراجعات
-- Add missing columns to product_reviews table

-- إضافة حقول التصويت المفيد/غير مفيد
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS not_helpful_count INTEGER DEFAULT 0;

-- إضافة حقول ردود المتجر
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS store_reply TEXT,
ADD COLUMN IF NOT EXISTS store_reply_at TIMESTAMP WITH TIME ZONE;

-- إضافة حقول التحقق والميزات الإضافية
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS is_verified_purchase BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flagged_count INTEGER DEFAULT 0;

-- إنشاء جدول تصويت المراجعات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS review_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, review_id)
);

-- إنشاء جدول تقارير المراجعات إذا لم يكن موجوداً  
CREATE TABLE IF NOT EXISTS review_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, review_id)
);

-- إنشاء دوال تحديث الإحصائيات
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث عدد التصويتات المفيدة
    UPDATE product_reviews 
    SET helpful_count = (
        SELECT COUNT(*) 
        FROM review_votes 
        WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
        AND vote_type = 'helpful'
    ),
    not_helpful_count = (
        SELECT COUNT(*) 
        FROM review_votes 
        WHERE review_id = COALESCE(NEW.review_id, OLD.review_id) 
        AND vote_type = 'not_helpful'
    )
    WHERE id = COALESCE(NEW.review_id, OLD.review_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- إنشاء دالة تحديث عدد التقارير
CREATE OR REPLACE FUNCTION update_review_flagged_count()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث عدد التقارير
    UPDATE product_reviews 
    SET flagged_count = (
        SELECT COUNT(*) 
        FROM review_reports 
        WHERE review_id = COALESCE(NEW.review_id, OLD.review_id)
    )
    WHERE id = COALESCE(NEW.review_id, OLD.review_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- إنشاء المشغلات (Triggers)
DROP TRIGGER IF EXISTS trigger_update_review_helpful_count ON review_votes;
CREATE TRIGGER trigger_update_review_helpful_count
    AFTER INSERT OR UPDATE OR DELETE ON review_votes
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

DROP TRIGGER IF EXISTS trigger_update_review_flagged_count ON review_reports;
CREATE TRIGGER trigger_update_review_flagged_count
    AFTER INSERT OR UPDATE OR DELETE ON review_reports
    FOR EACH ROW EXECUTE FUNCTION update_review_flagged_count();

-- تحديث الصلاحيات
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول التصويتات
CREATE POLICY "Users can view all votes" ON review_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can vote on reviews" ON review_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON review_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON review_votes
    FOR DELETE USING (auth.uid() = user_id);

-- سياسات الأمان لجدول التقارير
CREATE POLICY "Admins can view all reports" ON review_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create reports" ON review_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_helpful_count ON product_reviews(helpful_count);
CREATE INDEX IF NOT EXISTS idx_product_reviews_store_reply ON product_reviews(store_reply_at) WHERE store_reply IS NOT NULL;

-- إدراج بيانات تجريبية للتصويتات (اختياري)
-- INSERT INTO review_votes (user_id, review_id, vote_type)
-- SELECT 
--     (SELECT id FROM users LIMIT 1),
--     id,
--     'helpful'
-- FROM product_reviews 
-- WHERE random() > 0.7
-- ON CONFLICT (user_id, review_id) DO NOTHING;

COMMIT;
