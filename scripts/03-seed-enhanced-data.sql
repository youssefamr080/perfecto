-- Insert Categories with enhanced data
INSERT INTO categories (name, description, image_url, sort_order) VALUES 
('اللحوم والمصنعات', 'أجود أنواع اللحوم المصنعة والطازجة', '/images/categories/meat.jpg', 1),
('الألبان ومنتجاتها', 'منتجات الألبان الطازجة والأجبان الطبيعية', '/images/categories/dairy.jpg', 2),
('منتجات متنوعة', 'مجموعة متنوعة من المنتجات الطبيعية', '/images/categories/variety.jpg', 3);

-- Insert SubCategories with enhanced data
INSERT INTO subcategories (name, description, category_id, sort_order) VALUES 
('لانشون', 'أنواع مختلفة من اللانشون الطبيعي', (SELECT id FROM categories WHERE name = 'اللحوم والمصنعات'), 1),
('بسطرمة', 'بسطرمة بلدي أصلية', (SELECT id FROM categories WHERE name = 'اللحوم والمصنعات'), 2),
('مجمدات', 'منتجات مجمدة طازجة', (SELECT id FROM categories WHERE name = 'اللحوم والمصنعات'), 3),
('شاورما', 'شاورما جاهزة للطبخ', (SELECT id FROM categories WHERE name = 'اللحوم والمصنعات'), 4),
('أجبان', 'أجبان طبيعية متنوعة', (SELECT id FROM categories WHERE name = 'الألبان ومنتجاتها'), 1),
('حلاوة', 'حلاوة طحينية طبيعية', (SELECT id FROM categories WHERE name = 'منتجات متنوعة'), 1),
('عسل', 'عسل نحل طبيعي', (SELECT id FROM categories WHERE name = 'منتجات متنوعة'), 2),
('زيوت', 'زيوت طبيعية مختلفة', (SELECT id FROM categories WHERE name = 'منتجات متنوعة'), 3),
('طحينة وزبدة', 'طحينة وزبدة طبيعية', (SELECT id FROM categories WHERE name = 'منتجات متنوعة'), 4);

-- Insert enhanced Products with more details
-- Luncheon Products
INSERT INTO products (name, description, price, original_price, unit_description, weight, stock_quantity, is_featured, subcategory_id, tags) VALUES 
('لانشون سادة', 'تجربة اللانشون الكلاسيكية، شرائح طرية ونكهة غنية تناسب جميع الأذواق، مثالية لسندويتش أصيل.', 65, 70, 'للربع كيلو', 0.25, 50, true, (SELECT id FROM subcategories WHERE name = 'لانشون'), ARRAY['لانشون', 'سادة', 'كلاسيكي']),
('لانشون فلفل', 'لمسة من الحرارة المدروسة، قطع الفلفل الأسود المجروش تمنح كل شريحة نكهة قوية ومنعشة.', 65, 70, 'للربع كيلو', 0.25, 45, false, (SELECT id FROM subcategories WHERE name = 'لانشون'), ARRAY['لانشون', 'فلفل', 'حار']),
('لانشون زيتون', 'مزيج فاخر من اللحم الطري وقطع الزيتون الأخضر المقطعة، نكهة متوسطية أصيلة في كل قضمة.', 70, 75, 'للربع كيلو', 0.25, 30, true, (SELECT id FROM subcategories WHERE name = 'لانشون'), ARRAY['لانشون', 'زيتون', 'متوسطي']),
('لانشون مشكل', 'تشكيلة متنوعة من الخضروات والتوابل في قالب واحد، كل شريحة مفاجأة جديدة من النكهات.', 70, 75, 'للربع كيلو', 0.25, 35, false, (SELECT id FROM subcategories WHERE name = 'لانشون'), ARRAY['لانشون', 'مشكل', 'خضروات']),
('لانشون مدخن', 'عملية التدخين الطبيعية تمنح اللحم عمقًا استثنائيًا في النكهة ورائحة لا تقاوم.', 75, 80, 'للربع كيلو', 0.25, 25, true, (SELECT id FROM subcategories WHERE name = 'لانشون'), ARRAY['لانشون', 'مدخن', 'مميز']),
('لانشون بيف', 'من أجود قطع لحم البقر، غني بالبروتين وبنكهة قوية تميز الخبراء الحقيقيين.', 80, 85, 'للربع كيلو', 0.25, 20, true, (SELECT id FROM subcategories WHERE name = 'لانشون'), ARRAY['لانشون', 'بيف', 'بروتين']),
('لانشون ديك رومي', 'البديل الصحي الأمثل، لحم الديك الرومي الطري قليل الدهون وغني بالطعم الطبيعي.', 85, 90, 'للربع كيلو', 0.25, 15, false, (SELECT id FROM subcategories WHERE name = 'لانشون'), ARRAY['لانشون', 'ديك رومي', 'صحي']),
('لانشون دجاج', 'خفيف ولذيذ، مصنوع من أجود قطع الدجاج الطازج بتتبيلة خاصة تناسب الأطفال والكبار.', 60, 65, 'للربع كيلو', 0.25, 40, false, (SELECT id FROM subcategories WHERE name = 'لانشون'), ARRAY['لانشون', 'دجاج', 'أطفال']),
('لانشون جبنة', 'دمج مثالي بين كريمة الجبن ونعومة اللحم، تجربة فريدة تذوب في الفم.', 70, 75, 'للربع كيلو', 0.25, 30, false, (SELECT id FROM subcategories WHERE name = 'لانشون'), ARRAY['لانشون', 'جبنة', 'كريمي']),
('لانشون حار', 'للذين يعشقون التحدي، مزيج من الفلفل الحار والتوابل النارية في كل شريحة.', 65, 70, 'للربع كيلو', 0.25, 35, false, (SELECT id FROM subcategories WHERE name = 'لانشون'), ARRAY['لانشون', 'حار', 'تحدي']);

-- Pastrami
INSERT INTO products (name, description, price, original_price, unit_description, weight, stock_quantity, is_featured, subcategory_id, tags) VALUES 
('بسطرمة بلدي', 'تحفة اللحوم المعتقة، مغطاة بطبقة غنية من الحلبة والتوابل الشرقية الأصيلة التي تذوب في الفم.', 120, 130, 'للربع كيلو', 0.25, 20, true, (SELECT id FROM subcategories WHERE name = 'بسطرمة'), ARRAY['بسطرمة', 'بلدي', 'حلبة']);

-- Frozen Products
INSERT INTO products (name, description, price, original_price, unit_description, weight, stock_quantity, is_featured, subcategory_id, tags) VALUES 
('برجر لحمة', 'قطعة برجر سميكة وغنية من اللحم الصافي المتبل بعناية، جاهزة للشواء لتمنحك تجربة المطاعم في منزلك.', 90, 95, 'لعبوة 400 جرام', 0.4, 30, true, (SELECT id FROM subcategories WHERE name = 'مجمدات'), ARRAY['برجر', 'لحمة', 'شواء']),
('برجر دجاج', 'قطع الدجاج الطرية المفرومة والمتبلة بالأعشاب الطبيعية، خيار صحي ولذيذ لعشاق البرجر.', 80, 85, 'لعبوة 400 جرام', 0.4, 35, false, (SELECT id FROM subcategories WHERE name = 'مجمدات'), ARRAY['برجر', 'دجاج', 'صحي']),
('سجق بلدي', 'وصفة تراثية أصيلة، لحم مفروم متبل بالكمون والكزبرة والفلفل الأحمر، نكهة البيت الأصيلة.', 110, 115, 'للكيلو', 1.0, 25, true, (SELECT id FROM subcategories WHERE name = 'مجمدات'), ARRAY['سجق', 'بلدي', 'تراثي']),
('سجق حار', 'نفس الوصفة التراثية مع إضافة الشطة الحارة، لمحبي النكهات القوية والمميزة.', 110, 115, 'للكيلو', 1.0, 20, false, (SELECT id FROM subcategories WHERE name = 'مجمدات'), ARRAY['سجق', 'حار', 'شطة']),
('كباب حلة', 'قطع اللحم المتبلة والجاهزة للطبخ في الحلة، وجبة شرقية كاملة بنكهة البيت.', 130, 135, 'للكيلو', 1.0, 15, true, (SELECT id FROM subcategories WHERE name = 'مجمدات'), ARRAY['كباب', 'حلة', 'شرقي']),
('كفتة', 'خليط متجانس من اللحم المفروم والبقدونس والبصل، مشكلة بعناية لتعطي أفضل طعم عند الشواء.', 120, 125, 'للكيلو', 1.0, 25, false, (SELECT id FROM subcategories WHERE name = 'مجمدات'), ARRAY['كفتة', 'مفروم', 'بقدونس']);

-- Shawarma Products
INSERT INTO products (name, description, price, original_price, unit_description, weight, stock_quantity, is_featured, subcategory_id, tags) VALUES 
('شاورما لحمة', 'شرائح اللحم الطرية المتبلة بخلطة التوابل السرية، جاهزة للتحمير والتقديم مع الخبز والسلطة.', 140, 145, 'للكيلو', 1.0, 20, true, (SELECT id FROM subcategories WHERE name = 'شاورما'), ARRAY['شاورما', 'لحمة', 'توابل']),
('شاورما دجاج', 'قطع الدجاج المقطعة شرائح رفيعة ومتبلة بالزعتر والليمون، طعم أصيل ونكهة لا تقاوم.', 120, 125, 'للكيلو', 1.0, 25, false, (SELECT id FROM subcategories WHERE name = 'شاورما'), ARRAY['شاورما', 'دجاج', 'زعتر']);

-- Cheese Products
INSERT INTO products (name, description, price, original_price, unit_description, weight, stock_quantity, is_featured, subcategory_id, tags) VALUES 
('جبنة رومي وسط', 'كنز الألبان المصرية، معتقة لفترة متوسطة لتمنحك توازنًا مثاليًا بين القوام الطري والنكهة الحادة.', 60, 65, 'للربع كيلو', 0.25, 40, true, (SELECT id FROM subcategories WHERE name = 'أجبان'), ARRAY['جبنة', 'رومي', 'وسط']),
('جبنة رومي قديمة', 'للخبراء فقط، معتقة لسنوات لتصل إلى قمة النضج، نكهة قوية وقوام صلب يذوب ببطء في الفم.', 80, 85, 'للربع كيلو', 0.25, 20, true, (SELECT id FROM subcategories WHERE name = 'أجبان'), ARRAY['جبنة', 'رومي', 'قديمة']),
('جبنة تركي', 'وصفة تركية أصيلة، جبنة بيضاء طرية بملوحة معتدلة، مثالية للفطار أو كمقبلات.', 70, 75, 'للربع كيلو', 0.25, 30, false, (SELECT id FROM subcategories WHERE name = 'أجبان'), ARRAY['جبنة', 'تركي', 'بيضاء']),
('جبنة فيتا', 'جبنة يونانية كلاسيكية، قوام كريمي ونكهة منعشة، تضيف لمسة متوسطية لأي وجبة.', 65, 70, 'للربع كيلو', 0.25, 35, false, (SELECT id FROM subcategories WHERE name = 'أجبان'), ARRAY['جبنة', 'فيتا', 'يوناني']),
('جبنة موتزاريلا', 'الجبنة الإيطالية الشهيرة، تذوب بسهولة وتمتد بشكل مثالي، أساسية لعشاق البيتزا والمعجنات.', 75, 80, 'للربع كيلو', 0.25, 25, true, (SELECT id FROM subcategories WHERE name = 'أجبان'), ARRAY['جبنة', 'موتزاريلا', 'إيطالي']),
('جبنة شيدر', 'جبنة إنجليزية عريقة بلون ذهبي مميز ونكهة غنية، تضيف عمقًا لأي طبق.', 70, 75, 'للربع كيلو', 0.25, 30, false, (SELECT id FROM subcategories WHERE name = 'أجبان'), ARRAY['جبنة', 'شيدر', 'إنجليزي']);

-- Halawa Products
INSERT INTO products (name, description, price, original_price, unit_description, weight, stock_quantity, is_featured, subcategory_id, tags) VALUES 
('حلاوة طحينية سادة', 'الحلاوة التقليدية بأبسط صورها وأنقى مذاقها، مصنوعة من السمسم الصافي والسكر فقط.', 45, 50, 'للربع كيلو', 0.25, 50, true, (SELECT id FROM subcategories WHERE name = 'حلاوة'), ARRAY['حلاوة', 'طحينية', 'سادة']),
('حلاوة طحينية بالفستق', 'لمسة من الفخامة، قطع الفستق الحلبي الأصلي تتوزع في الحلاوة لتمنحها قرمشة مميزة.', 60, 65, 'للربع كيلو', 0.25, 30, true, (SELECT id FROM subcategories WHERE name = 'حلاوة'), ARRAY['حلاوة', 'فستق', 'حلبي']),
('حلاوة طحينية بالشوكولاتة', 'دمج عبقري بين تراث الحلاوة وحداثة الشوكولاتة، طعم يجمع بين الأصالة والعصرية.', 50, 55, 'للربع كيلو', 0.25, 40, false, (SELECT id FROM subcategories WHERE name = 'حلاوة'), ARRAY['حلاوة', 'شوكولاتة', 'عصري']);

-- Honey Products
INSERT INTO products (name, description, price, original_price, unit_description, weight, stock_quantity, is_featured, subcategory_id, tags) VALUES 
('عسل نحل طبيعي', 'عسل صافي 100% من خلايا النحل المحلية، غني بالفيتامينات والمعادن، طعم الطبيعة الحقيقي.', 180, 190, 'للكيلو', 1.0, 15, true, (SELECT id FROM subcategories WHERE name = 'عسل'), ARRAY['عسل', 'طبيعي', 'فيتامينات']),
('عسل سدر جبلي', 'من أشجار السدر البرية في المناطق الجبلية، عسل فاخر بخصائص علاجية ونكهة استثنائية.', 250, 260, 'للكيلو', 1.0, 10, true, (SELECT id FROM subcategories WHERE name = 'عسل'), ARRAY['عسل', 'سدر', 'جبلي']);

-- Oil Products
INSERT INTO products (name, description, price, original_price, unit_description, weight, stock_quantity, is_featured, subcategory_id, tags) VALUES 
('زيت زيتون بكر ممتاز', 'من أجود أشجار الزيتون، عصر على البارد للحفاظ على جميع الفوائد الغذائية والطعم الأصيل.', 220, 230, 'للتر', 1.0, 20, true, (SELECT id FROM subcategories WHERE name = 'زيوت'), ARRAY['زيت زيتون', 'بكر', 'عصر بارد']),
('زيت سمسم صافي', 'زيت السمسم الطبيعي المعصور على البارد، نكهة مميزة وفوائد صحية لا تحصى.', 160, 170, 'للتر', 1.0, 25, false, (SELECT id FROM subcategories WHERE name = 'زيوت'), ARRAY['زيت سمسم', 'صافي', 'طبيعي']);

-- Tahini and Butter Products
INSERT INTO products (name, description, price, original_price, unit_description, weight, stock_quantity, is_featured, subcategory_id, tags) VALUES 
('طحينة سمسم صافي', 'خلاصة أجود أنواع السمسم، طحينة نقية 100% بقوام كريمي ونكهة أصيلة لا تضاهى.', 190, 200, 'للكيلو', 1.0, 20, true, (SELECT id FROM subcategories WHERE name = 'طحينة وزبدة'), ARRAY['طحينة', 'سمسم', 'صافي']),
('زبدة فول سوداني', 'من الفول السوداني المحمص الطازج، زبدة كريمية غنية بالبروتين والطاقة الطبيعية.', 120, 130, 'للكيلو', 1.0, 30, false, (SELECT id FROM subcategories WHERE name = 'طحينة وزبدة'), ARRAY['زبدة', 'فول سوداني', 'بروتين']);

-- Add sample coupons
INSERT INTO coupons (code, title, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_until) VALUES 
('WELCOME10', 'خصم الترحيب', 'خصم 10% للعملاء الجدد', 'PERCENTAGE', 10, 100, 50, 100, NOW() + INTERVAL '30 days'),
('SAVE50', 'وفر 50 جنيه', 'خصم 50 جنيه على الطلبات أكثر من 300 جنيه', 'FIXED_AMOUNT', 50, 300, NULL, 50, NOW() + INTERVAL '15 days'),
('LOYALTY20', 'خصم الولاء', 'خصم 20% للعملاء المميزين', 'PERCENTAGE', 20, 200, 100, 200, NOW() + INTERVAL '60 days'),
('FREESHIP', 'توصيل مجاني', 'توصيل مجاني على جميع الطلبات', 'FIXED_AMOUNT', 15, 0, 15, 1000, NOW() + INTERVAL '7 days');
