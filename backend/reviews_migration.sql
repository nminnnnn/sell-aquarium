-- ============================================
-- Product Reviews Migration
-- Adds product reviews and ratings functionality
-- ============================================

USE `charan_aquarium`;

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `product_id` INT(11) NOT NULL,
  `user_id` INT(11) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `rating` TINYINT(1) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_rating` (`rating`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_product_review` (`user_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add average_rating column to products table (optional, for faster queries)
ALTER TABLE `products` 
ADD COLUMN `average_rating` DECIMAL(3,2) DEFAULT 0.00 AFTER `is_new`,
ADD COLUMN `review_count` INT(11) DEFAULT 0 AFTER `average_rating`;

-- Create trigger to update average_rating when review is added/updated/deleted
DELIMITER //

CREATE TRIGGER `update_product_rating_after_insert` 
AFTER INSERT ON `product_reviews`
FOR EACH ROW
BEGIN
    UPDATE `products`
    SET 
        `average_rating` = (
            SELECT AVG(`rating`) 
            FROM `product_reviews` 
            WHERE `product_id` = NEW.`product_id`
        ),
        `review_count` = (
            SELECT COUNT(*) 
            FROM `product_reviews` 
            WHERE `product_id` = NEW.`product_id`
        )
    WHERE `id` = NEW.`product_id`;
END//

CREATE TRIGGER `update_product_rating_after_update` 
AFTER UPDATE ON `product_reviews`
FOR EACH ROW
BEGIN
    UPDATE `products`
    SET 
        `average_rating` = (
            SELECT AVG(`rating`) 
            FROM `product_reviews` 
            WHERE `product_id` = NEW.`product_id`
        )
    WHERE `id` = NEW.`product_id`;
END//

CREATE TRIGGER `update_product_rating_after_delete` 
AFTER DELETE ON `product_reviews`
FOR EACH ROW
BEGIN
    UPDATE `products`
    SET 
        `average_rating` = COALESCE((
            SELECT AVG(`rating`) 
            FROM `product_reviews` 
            WHERE `product_id` = OLD.`product_id`
        ), 0.00),
        `review_count` = COALESCE((
            SELECT COUNT(*) 
            FROM `product_reviews` 
            WHERE `product_id` = OLD.`product_id`
        ), 0)
    WHERE `id` = OLD.`product_id`;
END//

DELIMITER ;

