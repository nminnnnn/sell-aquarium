-- ============================================
-- Create Sample Orders and Reviews
-- This script creates sample orders and reviews for all products
-- ============================================

USE `charan_aquarium`;

-- First, get some users (we'll use first few users)
SET @user1_id = (SELECT id FROM users LIMIT 1 OFFSET 0);
SET @user2_id = (SELECT id FROM users LIMIT 1 OFFSET 1);
SET @user3_id = (SELECT id FROM users LIMIT 1 OFFSET 2);
SET @user4_id = (SELECT id FROM users LIMIT 1 OFFSET 3);
SET @user5_id = (SELECT id FROM users LIMIT 1 OFFSET 4);

-- Get user names
SET @user1_name = (SELECT name FROM users WHERE id = @user1_id);
SET @user2_name = (SELECT name FROM users WHERE id = @user2_id);
SET @user3_name = (SELECT name FROM users WHERE id = @user3_id);
SET @user4_name = (SELECT name FROM users WHERE id = @user4_id);
SET @user5_name = (SELECT name FROM users WHERE id = @user5_id);

-- Create sample orders for products
-- Order 1: User 1 buys multiple products
INSERT INTO orders (user_id, user_name, user_phone, total_amount, status, created_at)
SELECT @user1_id, @user1_name, (SELECT phone FROM users WHERE id = @user1_id), 
       SUM(p.price * 2), 'delivered', DATE_SUB(NOW(), INTERVAL 25 DAY)
FROM products p
WHERE p.id IN (1, 2, 3)
LIMIT 1;

SET @order1_id = LAST_INSERT_ID();

-- Order items for order 1
INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
SELECT @order1_id, p.id, p.name, p.image, 2, p.price, p.price * 2
FROM products p
WHERE p.id IN (1, 2, 3);

-- Order 2: User 2 buys some products
INSERT INTO orders (user_id, user_name, user_phone, total_amount, status, created_at)
SELECT @user2_id, @user2_name, (SELECT phone FROM users WHERE id = @user2_id),
       SUM(p.price), 'paid', DATE_SUB(NOW(), INTERVAL 20 DAY)
FROM products p
WHERE p.id IN (4, 5, 6)
LIMIT 1;

SET @order2_id = LAST_INSERT_ID();

INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
SELECT @order2_id, p.id, p.name, p.image, 1, p.price, p.price
FROM products p
WHERE p.id IN (4, 5, 6);

-- Order 3: User 3 buys products
INSERT INTO orders (user_id, user_name, user_phone, total_amount, status, created_at)
SELECT @user3_id, @user3_name, (SELECT phone FROM users WHERE id = @user3_id),
       SUM(p.price), 'delivered', DATE_SUB(NOW(), INTERVAL 15 DAY)
FROM products p
WHERE p.id IN (7, 8, 9, 10)
LIMIT 1;

SET @order3_id = LAST_INSERT_ID();

INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
SELECT @order3_id, p.id, p.name, p.image, 1, p.price, p.price
FROM products p
WHERE p.id IN (7, 8, 9, 10);

-- Order 4: User 4 buys some products
INSERT INTO orders (user_id, user_name, user_phone, total_amount, status, created_at)
SELECT @user4_id, @user4_name, (SELECT phone FROM users WHERE id = @user4_id),
       SUM(p.price), 'delivered', DATE_SUB(NOW(), INTERVAL 10 DAY)
FROM products p
WHERE p.id IN (1, 4, 7)
LIMIT 1;

SET @order4_id = LAST_INSERT_ID();

INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
SELECT @order4_id, p.id, p.name, p.image, 1, p.price, p.price
FROM products p
WHERE p.id IN (1, 4, 7);

-- Order 5: User 5 buys remaining products
INSERT INTO orders (user_id, user_name, user_phone, total_amount, status, created_at)
SELECT @user5_id, @user5_name, (SELECT phone FROM users WHERE id = @user5_id),
       SUM(p.price), 'paid', DATE_SUB(NOW(), INTERVAL 5 DAY)
FROM products p
WHERE p.id IN (2, 5, 8, 9, 10)
LIMIT 1;

SET @order5_id = LAST_INSERT_ID();

INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
SELECT @order5_id, p.id, p.name, p.image, 1, p.price, p.price
FROM products p
WHERE p.id IN (2, 5, 8, 9, 10);

-- Temporarily disable triggers to avoid MySQL error
SET @OLD_SQL_MODE = @@SQL_MODE;
SET SQL_MODE = '';

-- Now generate reviews based on order_items
-- Reviews for Exotic products (Product ID 1, 3, 4)
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT DISTINCT
    oi.product_id,
    o.user_id,
    o.user_name,
    5,
    CASE 
        WHEN oi.product_id = 1 THEN 'Cá Arowana tuyệt đẹp! Giấy tờ đầy đủ, chất lượng hàng đầu. Màu đỏ rực rỡ như trong hình, cá khỏe mạnh và thích nghi tốt với bể nhà tôi. Đáng giá với giá tiền bỏ ra.'
        WHEN oi.product_id = 3 THEN 'Flowerhorn đẹp, đầu to như mong đợi. Màu sắc rực rỡ, cá khỏe mạnh. Giao hàng cẩn thận, tư vấn nhiệt tình. Sẽ quay lại mua thêm.'
        WHEN oi.product_id = 4 THEN 'Discus đẹp, màu xanh lam nổi bật. Cá khỏe, thích nghi tốt. Cần nước mềm và ấm như hướng dẫn. Rất hài lòng với sản phẩm.'
        ELSE CONCAT('Sản phẩm chất lượng tốt, cá đẹp và khỏe mạnh. ', 
            CASE WHEN RAND() < 0.5 THEN 'Giao hàng nhanh, đóng gói cẩn thận.' ELSE 'Tư vấn kỹ thuật chuyên nghiệp.' END)
    END,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 20) DAY)
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Exotic'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id AND pr.user_id = o.user_id
  );

-- Reviews for Marine products (Product ID 2, 6)
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT DISTINCT
    oi.product_id,
    o.user_id,
    o.user_name,
    5,
    CASE 
        WHEN oi.product_id = 2 THEN 'Cá Clownfish đẹp, màu cam rực rỡ. Cặp cá khỏe mạnh, phù hợp với bể nước mặn. Perfect cho người mới bắt đầu nuôi cá biển. Rất hài lòng!'
        WHEN oi.product_id = 6 THEN 'Blue Tang đẹp tuyệt! Màu xanh dương rực rỡ. Cá lớn và khỏe, thích hợp với bể lớn. Giá cả hợp lý. Đáng mua!'
        ELSE CONCAT('Cá biển đẹp, sống động. ', 
            CASE WHEN RAND() < 0.5 THEN 'Chất lượng tốt, giao hàng nhanh.' ELSE 'Phù hợp với bể nước mặn.' END)
    END,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 15) DAY)
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Marine'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id AND pr.user_id = o.user_id
  );

-- Reviews for Freshwater products (Product ID 5, 10)
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT DISTINCT
    oi.product_id,
    o.user_id,
    o.user_name,
    5,
    CASE 
        WHEN oi.product_id = 5 THEN 'Neon Tetra đẹp, màu xanh neon rực rỡ. Bầy 10 con sống khỏe, thích hợp với bể cây thủy sinh. Giá cả phải chăng, chất lượng tốt.'
        WHEN oi.product_id = 10 THEN 'Betta Halfmoon tuyệt đẹp! Đuôi xòe 180 độ như mô tả. Màu sắc rực rỡ, cá khỏe mạnh. Đóng gói cẩn thận. Rất hài lòng!'
        ELSE CONCAT('Cá nước ngọt đẹp, khỏe mạnh. ', 
            CASE WHEN RAND() < 0.5 THEN 'Phù hợp với bể cộng đồng.' ELSE 'Giá cả hợp lý.' END)
    END,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 12) DAY)
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Freshwater'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id AND pr.user_id = o.user_id
  );

-- Reviews for Tanks (Product ID 7)
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT DISTINCT
    oi.product_id,
    o.user_id,
    o.user_name,
    5,
    CASE 
        WHEN oi.product_id = 7 THEN 'Bể cá chất lượng tốt, kính trong suốt, không bị mờ. Kích thước 60x30x30cm đúng như mô tả. Thiết kế đẹp, phù hợp không gian. Lắp đặt dễ dàng. Giá cả hợp lý.'
        ELSE CONCAT('Bể cá đẹp, chất lượng tốt. ', 
            CASE WHEN RAND() < 0.5 THEN 'Kính trong, bền.' ELSE 'Thiết kế gọn gàng.' END)
    END,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 10) DAY)
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Tanks'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id AND pr.user_id = o.user_id
  );

-- Reviews for Food (Product ID 8)
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT DISTINCT
    oi.product_id,
    o.user_id,
    o.user_name,
    5,
    CASE 
        WHEN oi.product_id = 8 THEN 'Hikari Gold Pellets chất lượng tốt, cá rất thích ăn. Hạt đều, không bị vỡ. Cá phát triển tốt, màu sắc đẹp hơn sau khi dùng. Giá cả hợp lý, đóng gói kỹ càng. Sẽ mua lại.'
        ELSE CONCAT('Thức ăn tốt, cá thích ăn. ', 
            CASE WHEN RAND() < 0.5 THEN 'Chất lượng ổn định.' ELSE 'Giá cả phải chăng.' END)
    END,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 8) DAY)
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Food'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id AND pr.user_id = o.user_id
  );

-- Reviews for Accessories (Product ID 9)
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT DISTINCT
    oi.product_id,
    o.user_id,
    o.user_name,
    5,
    CASE 
        WHEN oi.product_id = 9 THEN 'Đèn LED Full Spectrum tốt, màu sắc đẹp, điều khiển qua app tiện lợi. Phù hợp với bể cây thủy sinh, cây phát triển tốt. Thiết kế gọn gàng, dễ lắp đặt. Giá cả hợp lý.'
        ELSE CONCAT('Phụ kiện chất lượng tốt, hoạt động ổn định. ', 
            CASE WHEN RAND() < 0.5 THEN 'Dễ sử dụng.' ELSE 'Bền và đáng tin cậy.' END)
    END,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 5) DAY)
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Accessories'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id AND pr.user_id = o.user_id
  );

-- Restore SQL mode
SET SQL_MODE = @OLD_SQL_MODE;

-- Manually update average ratings (since triggers might have issues)
UPDATE products p
SET 
    p.average_rating = (
        SELECT COALESCE(AVG(pr.rating), 0)
        FROM product_reviews pr
        WHERE pr.product_id = p.id
    ),
    p.review_count = (
        SELECT COUNT(*)
        FROM product_reviews pr
        WHERE pr.product_id = p.id
    );

-- Show summary
SELECT 
    p.name as 'Product',
    p.category as 'Category',
    COUNT(pr.id) as 'Reviews',
    ROUND(AVG(pr.rating), 2) as 'Avg Rating'
FROM products p
LEFT JOIN product_reviews pr ON p.id = pr.product_id
GROUP BY p.id, p.name, p.category
ORDER BY COUNT(pr.id) DESC, p.category;

