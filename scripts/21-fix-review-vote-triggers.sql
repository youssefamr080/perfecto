-- إصلاح مشغلات عدادات التصويت لتتوافق مع العمود vote_type بدلاً من is_helpful
-- Idempotent: يسقط المشغّل القديم ويعيد إنشاء Function/Trigger وفق المخطط الحالي

-- Function: تحديث عدادات التصويت على المراجعات
CREATE OR REPLACE FUNCTION update_review_vote_counts_v2()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'helpful' THEN
      UPDATE product_reviews
      SET helpful_count = COALESCE(helpful_count, 0) + 1
      WHERE id = NEW.review_id;
    ELSE
      UPDATE product_reviews
      SET not_helpful_count = COALESCE(not_helpful_count, 0) + 1
      WHERE id = NEW.review_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.vote_type <> OLD.vote_type THEN
      IF NEW.vote_type = 'helpful' THEN
        UPDATE product_reviews
        SET helpful_count = COALESCE(helpful_count, 0) + 1,
            not_helpful_count = GREATEST(COALESCE(not_helpful_count, 0) - 1, 0)
        WHERE id = NEW.review_id;
      ELSE
        UPDATE product_reviews
        SET helpful_count = GREATEST(COALESCE(helpful_count, 0) - 1, 0),
            not_helpful_count = COALESCE(not_helpful_count, 0) + 1
        WHERE id = NEW.review_id;
      END IF;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'helpful' THEN
      UPDATE product_reviews
      SET helpful_count = GREATEST(COALESCE(helpful_count, 0) - 1, 0)
      WHERE id = OLD.review_id;
    ELSE
      UPDATE product_reviews
      SET not_helpful_count = GREATEST(COALESCE(not_helpful_count, 0) - 1, 0)
      WHERE id = OLD.review_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger if existed and (re)create new one pointing to v2
DROP TRIGGER IF EXISTS review_vote_count_trigger ON review_votes;
CREATE TRIGGER review_vote_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_vote_counts_v2();
