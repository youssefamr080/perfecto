-- Remove coupon-related tables and functionality
DROP TABLE IF EXISTS coupon_usage CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;

-- Remove coupon-related policies (they will be automatically dropped with the tables)
