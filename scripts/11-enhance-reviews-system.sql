-- إضافة حقول جديدة لجدول المراجعات لدعم الميزات المحسنة (بدون صور)

-- إضافة حقول التصويت المفيد/غير مفيد
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS helpful_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS not_helpful_count integer DEFAULT 0;

-- إضافة حقل رد المتجر
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS store_reply text,
ADD COLUMN IF NOT EXISTS store_reply_date timestamp with time zone;

-- إضافة حقول إضافية للتحسين
ALTER TABLE product_reviews 
ADD COLUMN IF NOT EXISTS is_verified_purchase boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS flagged_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- إنشاء جدول تصويت المراجعات
CREATE TABLE IF NOT EXISTS review_votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    review_id uuid REFERENCES product_reviews(id) ON DELETE CASCADE,
    is_helpful boolean NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, review_id)
);

-- إنشاء جدول الإبلاغ عن المراجعات
CREATE TABLE IF NOT EXISTS review_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    review_id uuid REFERENCES product_reviews(id) ON DELETE CASCADE,
    reason text NOT NULL,
    description text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by uuid REFERENCES users(id),
    UNIQUE(user_id, review_id)
);

-- تحديث الـ RLS policies

-- سياسة القراءة للتصويت
CREATE POLICY "Users can view review votes" ON review_votes FOR SELECT USING (true);

-- سياسة الإدراج للتصويت (المستخدمون المسجلون فقط)
CREATE POLICY "Authenticated users can vote on reviews" ON review_votes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- سياسة التحديث للتصويت (المستخدم صاحب التصويت فقط)
CREATE POLICY "Users can update their own votes" ON review_votes FOR UPDATE 
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- سياسة الحذف للتصويت (المستخدم صاحب التصويت فقط)
CREATE POLICY "Users can delete their own votes" ON review_votes FOR DELETE 
USING (auth.uid() = user_id);

-- سياسات الإبلاغ

-- سياسة القراءة للإبلاغات (الأدمن فقط)
CREATE POLICY "Only admins can view reports" ON review_reports FOR SELECT 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

-- سياسة الإدراج للإبلاغات (المستخدمون المسجلون فقط)
CREATE POLICY "Authenticated users can report reviews" ON review_reports FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- سياسة التحديث للإبلاغات (الأدمن فقط)
CREATE POLICY "Only admins can update reports" ON review_reports FOR UPDATE 
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true));

-- تفعيل RLS
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_review_id ON review_reports(review_id);
CREATE INDEX IF NOT EXISTS idx_review_reports_status ON review_reports(status);
CREATE INDEX IF NOT EXISTS idx_product_reviews_helpful_count ON product_reviews(helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_featured ON product_reviews(is_featured) WHERE is_featured = true;

-- إنشاء function لتحديث عداد التصويت
CREATE OR REPLACE FUNCTION update_review_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث عداد المراجعة المتأثرة
    IF TG_OP = 'INSERT' THEN
        IF NEW.is_helpful THEN
            UPDATE product_reviews 
            SET helpful_count = helpful_count + 1 
            WHERE id = NEW.review_id;
        ELSE
            UPDATE product_reviews 
            SET not_helpful_count = not_helpful_count + 1 
            WHERE id = NEW.review_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- إذا تغير التصويت
        IF OLD.is_helpful != NEW.is_helpful THEN
            IF NEW.is_helpful THEN
                UPDATE product_reviews 
                SET helpful_count = helpful_count + 1,
                    not_helpful_count = not_helpful_count - 1
                WHERE id = NEW.review_id;
            ELSE
                UPDATE product_reviews 
                SET helpful_count = helpful_count - 1,
                    not_helpful_count = not_helpful_count + 1
                WHERE id = NEW.review_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.is_helpful THEN
            UPDATE product_reviews 
            SET helpful_count = helpful_count - 1 
            WHERE id = OLD.review_id;
        ELSE
            UPDATE product_reviews 
            SET not_helpful_count = not_helpful_count - 1 
            WHERE id = OLD.review_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- إنشاء triggers لتحديث العدادات تلقائياً
CREATE TRIGGER review_vote_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON review_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_review_vote_counts();

-- إنشاء function لتحديث عداد الإبلاغات
CREATE OR REPLACE FUNCTION update_review_flag_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE product_reviews 
        SET flagged_count = flagged_count + 1 
        WHERE id = NEW.review_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE product_reviews 
        SET flagged_count = flagged_count - 1 
        WHERE id = OLD.review_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتحديث عداد الإبلاغات
CREATE TRIGGER review_flag_count_trigger
    AFTER INSERT OR DELETE ON review_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_review_flag_count();

-- تحديث المراجعات الموجودة لتمييز المشتريات الموثقة
-- نظراً لأن عمود order_id غير موجود، سنتركها false حالياً
-- يمكن إضافة order_id لاحقاً عند الحاجة
-- UPDATE product_reviews 
-- SET is_verified_purchase = true 
-- WHERE order_id IS NOT NULL;

COMMENT ON TABLE review_votes IS 'جدول تصويت المستخدمين على فائدة المراجعات';
COMMENT ON TABLE review_reports IS 'جدول الإبلاغ عن المراجعات غير المناسبة';
COMMENT ON COLUMN product_reviews.helpful_count IS 'عدد الأصوات المفيدة';
COMMENT ON COLUMN product_reviews.not_helpful_count IS 'عدد الأصوات غير المفيدة';
COMMENT ON COLUMN product_reviews.store_reply IS 'رد المتجر على المراجعة';
COMMENT ON COLUMN product_reviews.is_verified_purchase IS 'هل المراجعة من مشتري موثق';
COMMENT ON COLUMN product_reviews.flagged_count IS 'عدد مرات الإبلاغ عن هذه المراجعة';
COMMENT ON COLUMN product_reviews.is_featured IS 'هل المراجعة مميزة للعرض';
