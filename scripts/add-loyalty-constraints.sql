-- إضافة constraints لضمان تماسك البيانات في قاعدة البيانات
-- scripts/add-loyalty-constraints.sql

-- التأكد من أن النقاط لا تكون سالبة
ALTER TABLE users ADD CONSTRAINT loyalty_points_non_negative CHECK (loyalty_points >= 0);

-- التأكد من أن المبلغ المدفوع في الطلبات لا يكون سالباً
ALTER TABLE orders ADD CONSTRAINT final_amount_non_negative CHECK (final_amount >= 0);

-- التأكد من أن النقاط المستخدمة في الطلبات لا تكون سالبة
ALTER TABLE orders ADD CONSTRAINT points_used_non_negative CHECK (points_used >= 0);

-- التأكد من أن النقاط المكتسبة في الطلبات لا تكون سالبة
ALTER TABLE orders ADD CONSTRAINT points_earned_non_negative CHECK (points_earned >= 0);

-- إضافة index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_loyalty_points_history_user_id_created_at 
ON loyalty_points_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_loyalty_points 
ON users(loyalty_points) WHERE loyalty_points > 0;

-- إضافة trigger لضمان صحة تحديث النقاط
CREATE OR REPLACE FUNCTION validate_loyalty_points_update()
RETURNS TRIGGER AS $$
BEGIN
    -- التحقق من أن النقاط الجديدة لا تقل عن الصفر
    IF NEW.loyalty_points < 0 THEN
        RAISE EXCEPTION 'نقاط الولاء لا يمكن أن تكون سالبة';
    END IF;
    
    -- التحقق من أن التغيير في النقاط منطقي
    IF ABS(NEW.loyalty_points - OLD.loyalty_points) > 100000 THEN
        RAISE EXCEPTION 'التغيير في نقاط الولاء كبير جداً ويحتاج مراجعة';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER loyalty_points_validation
    BEFORE UPDATE ON users
    FOR EACH ROW
    WHEN (OLD.loyalty_points IS DISTINCT FROM NEW.loyalty_points)
    EXECUTE FUNCTION validate_loyalty_points_update();
