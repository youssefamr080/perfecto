-- إضافة مراجعات تجريبية معتمدة
INSERT INTO product_reviews (user_id, product_id, rating, comment, is_approved, created_at)
VALUES 
  ((SELECT id FROM users LIMIT 1), 'f68c0af8-6696-431b-a3b9-ee52917634f8', 5, 'منتج ممتاز جداً والجودة عالية!', true, NOW()),
  ((SELECT id FROM users LIMIT 1), 'f68c0af8-6696-431b-a3b9-ee52917634f8', 4, 'منتج جيد والسعر مناسب', true, NOW() - INTERVAL '1 day'),
  ((SELECT id FROM users LIMIT 1), '38cb7e72-87a3-44d3-9748-ad19dab4db9d', 5, 'أنصح بشرائه بشدة!', true, NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, product_id) DO NOTHING;
