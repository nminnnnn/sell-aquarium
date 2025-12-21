-- ============================================
-- Generate Sample Reviews for Products
-- This script creates realistic reviews for each product
-- ============================================

USE `charan_aquarium`;

-- First, ensure we have users with orders containing products
-- We'll need to check existing orders or create some test data

-- Vietnamese review templates for different product categories
-- Reviews will be generated for products that have been purchased

-- Get all products
SET @product_count = (SELECT COUNT(*) FROM products);

-- Generate reviews only for products that exist in order_items
-- This ensures reviews are only for purchased products

-- Sample reviews for Freshwater Fish
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT 
    oi.product_id,
    o.user_id,
    o.user_name,
    CASE (RAND() * 5) 
        WHEN 0 THEN 5
        WHEN 1 THEN 4
        WHEN 2 THEN 5
        WHEN 3 THEN 4
        ELSE 5
    END as rating,
    CASE 
        WHEN RAND() < 0.3 THEN CONCAT('Cá rất đẹp và khỏe mạnh. Đóng gói cẩn thận, giao hàng nhanh. ', 
            CASE WHEN RAND() < 0.5 THEN 'Màu sắc rực rỡ như trong hình.' ELSE 'Cá thích nghi tốt với bể nhà tôi.' END)
        WHEN RAND() < 0.6 THEN CONCAT('Sản phẩm chất lượng tốt. ', 
            CASE WHEN RAND() < 0.5 THEN 'Cá sống khỏe sau 1 tuần.' ELSE 'Giá cả hợp lý so với chất lượng.' END)
        WHEN RAND() < 0.8 THEN CONCAT('Hài lòng với sản phẩm. ', 
            CASE WHEN RAND() < 0.5 THEN 'Nhân viên tư vấn nhiệt tình.' ELSE 'Sẽ quay lại mua thêm.' END)
        ELSE CONCAT('Tuyệt vời! ', 
            CASE WHEN RAND() < 0.5 THEN 'Cá đẹp hơn mong đợi.' ELSE 'Dịch vụ chuyên nghiệp.' END)
    END as comment,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) as created_at
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Freshwater'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id 
    AND pr.user_id = o.user_id
  )
LIMIT 15;

-- Sample reviews for Marine Fish
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT 
    oi.product_id,
    o.user_id,
    o.user_name,
    CASE (RAND() * 5) 
        WHEN 0 THEN 5
        WHEN 1 THEN 5
        WHEN 2 THEN 4
        WHEN 3 THEN 4
        ELSE 5
    END as rating,
    CASE 
        WHEN RAND() < 0.3 THEN CONCAT('Cá biển đẹp và sống động. ', 
            CASE WHEN RAND() < 0.5 THEN 'Phù hợp với bể nước mặn.' ELSE 'Màu sắc tự nhiên.' END)
        WHEN RAND() < 0.6 THEN CONCAT('Chất lượng tốt, cá khỏe mạnh. ', 
            CASE WHEN RAND() < 0.5 THEN 'Giao hàng đúng hẹn.' ELSE 'Tư vấn kỹ thuật tốt.' END)
        WHEN RAND() < 0.8 THEN CONCAT('Hài lòng với sản phẩm. ', 
            CASE WHEN RAND() < 0.5 THEN 'Cá thích nghi tốt.' ELSE 'Giá cả phải chăng.' END)
        ELSE CONCAT('Xuất sắc! ', 
            CASE WHEN RAND() < 0.5 THEN 'Cá đẹp như hình.' ELSE 'Dịch vụ tuyệt vời.' END)
    END as comment,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) as created_at
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Marine'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id 
    AND pr.user_id = o.user_id
  )
LIMIT 15;

-- Sample reviews for Exotic Fish
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT 
    oi.product_id,
    o.user_id,
    o.user_name,
    CASE (RAND() * 5) 
        WHEN 0 THEN 5
        WHEN 1 THEN 5
        WHEN 2 THEN 5
        WHEN 3 THEN 4
        ELSE 5
    END as rating,
    CASE 
        WHEN RAND() < 0.3 THEN CONCAT('Cá độc đáo và quý hiếm. ', 
            CASE WHEN RAND() < 0.5 THEN 'Giấy tờ đầy đủ, đáng tin cậy.' ELSE 'Chất lượng hàng đầu.' END)
        WHEN RAND() < 0.6 THEN CONCAT('Rất hài lòng với sản phẩm cao cấp này. ', 
            CASE WHEN RAND() < 0.5 THEN 'Cá đẹp và khỏe mạnh.' ELSE 'Dịch vụ chuyên nghiệp.' END)
        WHEN RAND() < 0.8 THEN CONCAT('Sản phẩm xứng đáng với giá tiền. ', 
            CASE WHEN RAND() < 0.5 THEN 'Tư vấn kỹ thuật tốt.' ELSE 'Giao hàng cẩn thận.' END)
        ELSE CONCAT('Tuyệt vời! ', 
            CASE WHEN RAND() < 0.5 THEN 'Cá vượt quá mong đợi.' ELSE 'Đáng mua cho người sưu tầm.' END)
    END as comment,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) as created_at
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Exotic'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id 
    AND pr.user_id = o.user_id
  )
LIMIT 15;

-- Sample reviews for Tanks
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT 
    oi.product_id,
    o.user_id,
    o.user_name,
    CASE (RAND() * 5) 
        WHEN 0 THEN 5
        WHEN 1 THEN 4
        WHEN 2 THEN 5
        WHEN 3 THEN 4
        ELSE 4
    END as rating,
    CASE 
        WHEN RAND() < 0.3 THEN CONCAT('Bể cá chất lượng tốt, kính trong suốt. ', 
            CASE WHEN RAND() < 0.5 THEN 'Thiết kế đẹp, phù hợp không gian.' ELSE 'Lắp đặt dễ dàng.' END)
        WHEN RAND() < 0.6 THEN CONCAT('Hài lòng với bể cá này. ', 
            CASE WHEN RAND() < 0.5 THEN 'Kích thước đúng như mô tả.' ELSE 'Giá cả hợp lý.' END)
        WHEN RAND() < 0.8 THEN CONCAT('Bể bền và đẹp. ', 
            CASE WHEN RAND() < 0.5 THEN 'Phù hợp cho người mới bắt đầu.' ELSE 'Chất lượng ổn định.' END)
        ELSE CONCAT('Tốt! ', 
            CASE WHEN RAND() < 0.5 THEN 'Đóng gói cẩn thận.' ELSE 'Giao hàng nhanh.' END)
    END as comment,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) as created_at
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Tanks'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id 
    AND pr.user_id = o.user_id
  )
LIMIT 10;

-- Sample reviews for Food
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT 
    oi.product_id,
    o.user_id,
    o.user_name,
    CASE (RAND() * 5) 
        WHEN 0 THEN 5
        WHEN 1 THEN 4
        WHEN 2 THEN 5
        WHEN 3 THEN 4
        ELSE 4
    END as rating,
    CASE 
        WHEN RAND() < 0.3 THEN CONCAT('Thức ăn chất lượng tốt, cá rất thích. ', 
            CASE WHEN RAND() < 0.5 THEN 'Giá cả hợp lý, sử dụng lâu.' ELSE 'Đóng gói kỹ càng.' END)
        WHEN RAND() < 0.6 THEN CONCAT('Cá ăn ngon miệng, phát triển tốt. ', 
            CASE WHEN RAND() < 0.5 THEN 'Hạt đều, không bị vỡ.' ELSE 'Mùi thơm tự nhiên.' END)
        WHEN RAND() < 0.8 THEN CONCAT('Sản phẩm tốt, sẽ mua lại. ', 
            CASE WHEN RAND() < 0.5 THEN 'Cá khỏe mạnh sau khi dùng.' ELSE 'Giá ổn định.' END)
        ELSE CONCAT('Hài lòng! ', 
            CASE WHEN RAND() < 0.5 THEN 'Đúng như mô tả.' ELSE 'Giao hàng nhanh.' END)
    END as comment,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) as created_at
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Food'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id 
    AND pr.user_id = o.user_id
  )
LIMIT 10;

-- Sample reviews for Accessories
INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
SELECT 
    oi.product_id,
    o.user_id,
    o.user_name,
    CASE (RAND() * 5) 
        WHEN 0 THEN 5
        WHEN 1 THEN 4
        WHEN 2 THEN 4
        WHEN 3 THEN 5
        ELSE 4
    END as rating,
    CASE 
        WHEN RAND() < 0.3 THEN CONCAT('Phụ kiện chất lượng tốt, hoạt động ổn định. ', 
            CASE WHEN RAND() < 0.5 THEN 'Thiết kế gọn gàng, dễ sử dụng.' ELSE 'Bền và đáng tin cậy.' END)
        WHEN RAND() < 0.6 THEN CONCAT('Sản phẩm hữu ích, giá cả hợp lý. ', 
            CASE WHEN RAND() < 0.5 THEN 'Lắp đặt đơn giản.' ELSE 'Chất lượng ổn định.' END)
        WHEN RAND() < 0.8 THEN CONCAT('Hài lòng với sản phẩm. ', 
            CASE WHEN RAND() < 0.5 THEN 'Đúng như mô tả.' ELSE 'Giao hàng nhanh.' END)
        ELSE CONCAT('Tốt! ', 
            CASE WHEN RAND() < 0.5 THEN 'Đáng mua.' ELSE 'Phù hợp nhu cầu.' END)
    END as comment,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY) as created_at
FROM order_items oi
INNER JOIN orders o ON oi.order_id = o.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status IN ('paid', 'delivered')
  AND p.category = 'Accessories'
  AND NOT EXISTS (
    SELECT 1 FROM product_reviews pr 
    WHERE pr.product_id = oi.product_id 
    AND pr.user_id = o.user_id
  )
LIMIT 10;

-- Verify generated reviews
SELECT 
    p.name as product_name,
    p.category,
    COUNT(pr.id) as review_count,
    AVG(pr.rating) as avg_rating
FROM products p
LEFT JOIN product_reviews pr ON p.id = pr.product_id
GROUP BY p.id, p.name, p.category
ORDER BY review_count DESC;

