-- إعادة تحديث مخطط الجدول لتجديد cache في Supabase
-- Refresh table schema to update Supabase cache

-- إعادة إنشاء جدول review_votes لتجديد schema cache
DROP TABLE IF EXISTS review_votes CASCADE;

CREATE TABLE review_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, review_id)
);

-- تفعيل RLS
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

-- إعادة إنشاء السياسات
CREATE POLICY "Users can view all votes" ON review_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can vote on reviews" ON review_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON review_votes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON review_votes
    FOR DELETE USING (auth.uid() = user_id);

-- إعادة إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);

-- إعادة إنشاء مشغل التحديث
DROP TRIGGER IF EXISTS review_vote_count_trigger ON review_votes;

CREATE TRIGGER review_vote_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW EXECUTE FUNCTION update_review_vote_counts_v2();

-- إجبار Supabase على إعادة قراءة المخطط
NOTIFY pgrst, 'reload schema';

-- إنشاء دالة RPC لإدراج التصويتات (تجاوز مشاكل schema cache)
CREATE OR REPLACE FUNCTION insert_review_vote(
    p_user_id UUID,
    p_review_id UUID,
    p_vote_type TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO review_votes (user_id, review_id, vote_type)
    VALUES (p_user_id, p_review_id, p_vote_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء دالة RPC لتحديث التصويتات
CREATE OR REPLACE FUNCTION update_review_vote(
    p_vote_id UUID,
    p_vote_type TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE review_votes 
    SET vote_type = p_vote_type
    WHERE id = p_vote_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء دالة RPC لحذف التصويتات
CREATE OR REPLACE FUNCTION delete_review_vote(p_vote_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM review_votes WHERE id = p_vote_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- التحقق من بنية الجدول
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'review_votes' 
ORDER BY ordinal_position;
