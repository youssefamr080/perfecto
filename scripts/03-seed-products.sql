-- Insert Luncheon Products
INSERT INTO products (name, price, unit_description, description, subcategory_id) VALUES 
('لانشون سادة', 65, 'للربع كيلو', 'تجربة اللانشون الكلاسيكية، شرائح طرية ونكهة غنية تناسب جميع الأذواق، مثالية لسندويتش أصيل.', (SELECT id FROM subcategories WHERE name = 'لانشون')),
('لانشون فلفل', 65, 'للربع كيلو', 'لمسة من الحرارة المدروسة، قطع الفلفل الأسود المجروش تمنح كل شريحة نكهة قوية ومنعشة.', (SELECT id FROM subcategories WHERE name = 'لانشون')),
('لانشون زيتون', 70, 'للربع كيلو', 'مزيج فاخر من اللحم الطري وقطع الزيتون الأخضر المقطعة، نكهة متوسطية أصيلة في كل قضمة.', (SELECT id FROM subcategories WHERE name = 'لانشون')),
('لانشون مشكل', 70, 'للربع كيلو', 'تشكيلة متنوعة من الخضروات والتوابل في قالب واحد، كل شريحة مفاجأة جديدة من النكهات.', (SELECT id FROM subcategories WHERE name = 'لانشون')),
('لانشون مدخن', 75, 'للربع كيلو', 'عملية التدخين الطبيعية تمنح اللحم عمقًا استثنائيًا في النكهة ورائحة لا تقاوم.', (SELECT id FROM subcategories WHERE name = 'لانشون')),
('لانشون بيف', 80, 'للربع كيلو', 'من أجود قطع لحم البقر، غني بالبروتين وبنكهة قوية تميز الخبراء الحقيقيين.', (SELECT id FROM subcategories WHERE name = 'لانشون')),
('لانشون ديك رومي', 85, 'للربع كيلو', 'البديل الصحي الأمثل، لحم الديك الرومي الطري قليل الدهون وغني بالطعم الطبيعي.', (SELECT id FROM subcategories WHERE name = 'لانشون')),
('لانشون دجاج', 60, 'للربع كيلو', 'خفيف ولذيذ، مصنوع من أجود قطع الدجاج الطازج بتتبيلة خاصة تناسب الأطفال والكبار.', (SELECT id FROM subcategories WHERE name = 'لانشون')),
('لانشون جبنة', 70, 'للربع كيلو', 'دمج مثالي بين كريمة الجبن ونعومة اللحم، تجربة فريدة تذوب في الفم.', (SELECT id FROM subcategories WHERE name = 'لانشون')),
('لانشون حار', 65, 'للربع كيلو', 'للذين يعشقون التحدي، مزيج من الفلفل الحار والتوابل النارية في كل شريحة.', (SELECT id FROM subcategories WHERE name = 'لانشون'));

-- Insert Pastrami Products
INSERT INTO products (name, price, unit_description, description, subcategory_id) VALUES 
('بسطرمة بلدي', 120, 'للربع كيلو', 'تحفة اللحوم المعتقة، مغطاة بطبقة غنية من الحلبة والتوابل الشرقية الأصيلة التي تذوب في الفم.', (SELECT id FROM subcategories WHERE name = 'بسطرمة'));

-- Insert Frozen Products
INSERT INTO products (name, price, unit_description, description, subcategory_id) VALUES 
('برجر لحمة', 90, 'لعبوة 400 جرام', 'قطعة برجر سميكة وغنية من اللحم الصافي المتبل بعناية، جاهزة للشواء لتمنحك تجربة المطاعم في منزلك.', (SELECT id FROM subcategories WHERE name = 'مجمدات')),
('برجر دجاج', 80, 'لعبوة 400 جرام', 'قطع الدجاج الطرية المفرومة والمتبلة بالأعشاب الطبيعية، خيار صحي ولذيذ لعشاق البرجر.', (SELECT id FROM subcategories WHERE name = 'مجمدات')),
('سجق بلدي', 110, 'للكيلو', 'وصفة تراثية أصيلة، لحم مفروم متبل بالكمون والكزبرة والفلفل الأحمر، نكهة البيت الأصيلة.', (SELECT id FROM subcategories WHERE name = 'مجمدات')),
('سجق حار', 110, 'للكيلو', 'نفس الوصفة التراثية مع إضافة الشطة الحارة، لمحبي النكهات القوية والمميزة.', (SELECT id FROM subcategories WHERE name = 'مجمدات')),
('كباب حلة', 130, 'للكيلو', 'قطع اللحم المتبلة والجاهزة للطبخ في الحلة، وجبة شرقية كاملة بنكهة البيت.', (SELECT id FROM subcategories WHERE name = 'مجمدات')),
('كفتة', 120, 'للكيلو', 'خليط متجانس من اللحم المفروم والبقدونس والبصل، مشكلة بعناية لتعطي أفضل طعم عند الشواء.', (SELECT id FROM subcategories WHERE name = 'مجمدات'));

-- Insert Shawarma Products
INSERT INTO products (name, price, unit_description, description, subcategory_id) VALUES 
('شاورما لحمة', 140, 'للكيلو', 'شرائح اللحم الطرية المتبلة بخلطة التوابل السرية، جاهزة للتحمير والتقديم مع الخبز والسلطة.', (SELECT id FROM subcategories WHERE name = 'شاورما')),
('شاورما دجاج', 120, 'للكيلو', 'قطع الدجاج المقطعة شرائح رفيعة ومتبلة بالزعتر والليمون، طعم أصيل ونكهة لا تقاوم.', (SELECT id FROM subcategories WHERE name = 'شاورما'));

-- Insert Cheese Products
INSERT INTO products (name, price, unit_description, description, subcategory_id) VALUES 
('جبنة رومي وسط', 60, 'للربع كيلو', 'كنز الألبان المصرية، معتقة لفترة متوسطة لتمنحك توازنًا مثاليًا بين القوام الطري والنكهة الحادة.', (SELECT id FROM subcategories WHERE name = 'أجبان')),
('جبنة رومي قديمة', 80, 'للربع كيلو', 'للخبراء فقط، معتقة لسنوات لتصل إلى قمة النضج، نكهة قوية وقوام صلب يذوب ببطء في الفم.', (SELECT id FROM subcategories WHERE name = 'أجبان')),
('جبنة تركي', 70, 'للربع كيلو', 'وصفة تركية أصيلة، جبنة بيضاء طرية بملوحة معتدلة، مثالية للفطار أو كمقبلات.', (SELECT id FROM subcategories WHERE name = 'أجبان')),
('جبنة فيتا', 65, 'للربع كيلو', 'جبنة يونانية كلاسيكية، قوام كريمي ونكهة منعشة، تضيف لمسة متوسطية لأي وجبة.', (SELECT id FROM subcategories WHERE name = 'أجبان')),
('جبنة موتزاريلا', 75, 'للربع كيلو', 'الجبنة الإيطالية الشهيرة، تذوب بسهولة وتمتد بشكل مثالي، أساسية لعشاق البيتزا والمعجنات.', (SELECT id FROM subcategories WHERE name = 'أجبان')),
('جبنة شيدر', 70, 'للربع كيلو', 'جبنة إنجليزية عريقة بلون ذهبي مميز ونكهة غنية، تضيف عمقًا لأي طبق.', (SELECT id FROM subcategories WHERE name = 'أجبان'));

-- Insert Halawa Products
INSERT INTO products (name, price, unit_description, description, subcategory_id) VALUES 
('حلاوة طحينية سادة', 45, 'للربع كيلو', 'الحلاوة التقليدية بأبسط صورها وأنقى مذاقها، مصنوعة من السمسم الصافي والسكر فقط.', (SELECT id FROM subcategories WHERE name = 'حلاوة')),
('حلاوة طحينية بالفستق', 60, 'للربع كيلو', 'لمسة من الفخامة، قطع الفستق الحلبي الأصلي تتوزع في الحلاوة لتمنحها قرمشة مميزة.', (SELECT id FROM subcategories WHERE name = 'حلاوة')),
('حلاوة طحينية بالشوكولاتة', 50, 'للربع كيلو', 'دمج عبقري بين تراث الحلاوة وحداثة الشوكولاتة، طعم يجمع بين الأصالة والعصرية.', (SELECT id FROM subcategories WHERE name = 'حلاوة'));

-- Insert Honey Products
INSERT INTO products (name, price, unit_description, description, subcategory_id) VALUES 
('عسل نحل طبيعي', 180, 'للكيلو', 'عسل صافي 100% من خلايا النحل المحلية، غني بالفيتامينات والمعادن، طعم الطبيعة الحقيقي.', (SELECT id FROM subcategories WHERE name = 'عسل')),
('عسل سدر جبلي', 250, 'للكيلو', 'من أشجار السدر البرية في المناطق الجبلية، عسل فاخر بخصائص علاجية ونكهة استثنائية.', (SELECT id FROM subcategories WHERE name = 'عسل'));

-- Insert Oil Products
INSERT INTO products (name, price, unit_description, description, subcategory_id) VALUES 
('زيت زيتون بكر ممتاز', 220, 'للتر', 'من أجود أشجار الزيتون، عصر على البارد للحفاظ على جميع الفوائد الغذائية والطعم الأصيل.', (SELECT id FROM subcategories WHERE name = 'زيوت')),
('زيت سمسم صافي', 160, 'للتر', 'زيت السمسم الطبيعي المعصور على البارد، نكهة مميزة وفوائد صحية لا تحصى.', (SELECT id FROM subcategories WHERE name = 'زيوت'));

-- Insert Tahini and Butter Products
INSERT INTO products (name, price, unit_description, description, subcategory_id) VALUES 
('طحينة سمسم صافي', 190, 'للكيلو', 'خلاصة أجود أنواع السمسم، طحينة نقية 100% بقوام كريمي ونكهة أصيلة لا تضاهى.', (SELECT id FROM subcategories WHERE name = 'طحينة وزبدة')),
('زبدة فول سوداني', 120, 'للكيلو', 'من الفول السوداني المحمص الطازج، زبدة كريمية غنية بالبروتين والطاقة الطبيعية.', (SELECT id FROM subcategories WHERE name = 'طحينة وزبدة'));
