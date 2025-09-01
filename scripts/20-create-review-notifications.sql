-- Create review notifications table and triggers
-- Requires pgcrypto or uuid-ossp extension for uuid generation

-- Enable required extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: review_notifications
CREATE TABLE IF NOT EXISTS review_notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id uuid NOT NULL REFERENCES product_reviews(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('new_review','review_approved','review_reported')),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_review_notifications_created ON review_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_notifications_type ON review_notifications(type);

-- Function and trigger: on new review
CREATE OR REPLACE FUNCTION notify_on_new_review()
RETURNS trigger AS $$
BEGIN
  INSERT INTO review_notifications (review_id, type)
  VALUES (NEW.id, 'new_review');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_new_review_notification ON product_reviews;
CREATE TRIGGER trg_new_review_notification
AFTER INSERT ON product_reviews
FOR EACH ROW EXECUTE FUNCTION notify_on_new_review();

-- Function and trigger: when review gets approved
CREATE OR REPLACE FUNCTION notify_on_review_approved()
RETURNS trigger AS $$
BEGIN
  IF (OLD.is_approved IS DISTINCT FROM NEW.is_approved) AND NEW.is_approved = TRUE THEN
    INSERT INTO review_notifications (review_id, type)
    VALUES (NEW.id, 'review_approved');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_approved_notification ON product_reviews;
CREATE TRIGGER trg_review_approved_notification
AFTER UPDATE ON product_reviews
FOR EACH ROW EXECUTE FUNCTION notify_on_review_approved();

-- Function and trigger: on review reported
CREATE OR REPLACE FUNCTION notify_on_review_reported()
RETURNS trigger AS $$
BEGIN
  INSERT INTO review_notifications (review_id, type)
  VALUES (NEW.review_id, 'review_reported');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_review_reported_notification ON review_reports;
CREATE TRIGGER trg_review_reported_notification
AFTER INSERT ON review_reports
FOR EACH ROW EXECUTE FUNCTION notify_on_review_reported();

-- RLS: only admins can read/update notifications
ALTER TABLE review_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read notifications" ON review_notifications;
CREATE POLICY "Admins can read notifications" ON review_notifications
FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)
);

DROP POLICY IF EXISTS "Admins can update notifications" ON review_notifications;
CREATE POLICY "Admins can update notifications" ON review_notifications
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)
);
