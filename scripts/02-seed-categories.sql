-- Insert Categories
INSERT INTO categories (name) VALUES 
('اللحوم والمصنعات'),
('الألبان ومنتجاتها'),
('منتجات متنوعة')
ON CONFLICT (name) DO NOTHING;

-- Insert SubCategories
INSERT INTO subcategories (name, category_id) VALUES 
('لانشون', (SELECT id FROM categories WHERE name = 'اللحوم والمصنعات')),
('بسطرمة', (SELECT id FROM categories WHERE name = 'اللحوم والمصنعات')),
('مجمدات', (SELECT id FROM categories WHERE name = 'اللحوم والمصنعات')),
('شاورما', (SELECT id FROM categories WHERE name = 'اللحوم والمصنعات')),
('أجبان', (SELECT id FROM categories WHERE name = 'الألبان ومنتجاتها')),
('حلاوة', (SELECT id FROM categories WHERE name = 'منتجات متنوعة')),
('عسل', (SELECT id FROM categories WHERE name = 'منتجات متنوعة')),
('زيوت', (SELECT id FROM categories WHERE name = 'منتجات متنوعة')),
('طحينة وزبدة', (SELECT id FROM categories WHERE name = 'منتجات متنوعة'));
