-- ============================================
-- Charan Aquarium Database Schema for Docker
-- ============================================
-- This file is automatically executed when MySQL container starts
-- Database is created automatically by Docker from environment variables
-- ============================================

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `role` ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
  `address` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: products
-- ============================================
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `scientific_name` VARCHAR(200),
  `category` ENUM('Freshwater', 'Marine', 'Exotic', 'Tanks', 'Food', 'Accessories') NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `offer_price` DECIMAL(10, 2),
  `stock` INT(11) NOT NULL DEFAULT 0,
  `origin` VARCHAR(100),
  `description` TEXT,
  `image` VARCHAR(500),
  `is_new` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_is_new` (`is_new`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: orders
-- ============================================
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `user_phone` VARCHAR(15) NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'paid', 'delivered') NOT NULL DEFAULT 'pending',
  `date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_date` (`date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: order_items
-- ============================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) NOT NULL,
  `product_id` INT(11) NOT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `product_image` VARCHAR(500),
  `quantity` INT(11) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_product_id` (`product_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: chat_messages
-- ============================================
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` VARCHAR(100) NOT NULL,
  `sender_id` VARCHAR(100) NOT NULL,
  `sender_name` VARCHAR(150) NOT NULL,
  `sender_role` ENUM('admin','customer') NOT NULL DEFAULT 'customer',
  `message` TEXT NOT NULL,
  `read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_conversation` (`conversation_id`),
  INDEX `idx_sender_role` (`sender_role`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Default Users (5 accounts: 1 admin, 4 customers)
-- ============================================
-- Note: Passwords are stored in plain text for demo purposes only
-- In production, always use password hashing (bcrypt, Argon2)
INSERT INTO `users` (`username`, `password`, `name`, `phone`, `role`, `address`) VALUES
('admin', 'admin123', 'Admin User', '6302382280', 'admin', 'Tata Nagar, Tirupati - 517501'),
('rajesh', 'rajesh123', 'Rajesh Kumar', '9876543210', 'customer', 'SV Nagar, Tirupati'),
('priya', 'priya123', 'Priya Sharma', '9876543211', 'customer', 'TP Area, Tirupati'),
('amit', 'amit123', 'Amit Patel', '9876543212', 'customer', 'Renigunta Road, Tirupati'),
('sneha', 'sneha123', 'Sneha Reddy', '9876543213', 'customer', 'Alipiri, Tirupati');

-- ⚠️ SECURITY WARNING: 
-- This is for DEMO only. In production:
-- 1. Use password hashing: UPDATE users SET password = PASSWORD('newpassword') WHERE username = 'username';
-- 2. Or use PHP password_hash(): password_hash('password', PASSWORD_BCRYPT)
-- 3. Verify with password_verify() in PHP

-- ============================================
-- Insert Sample Products
-- ============================================
INSERT INTO `products` (`name`, `scientific_name`, `category`, `price`, `offer_price`, `stock`, `origin`, `description`, `image`, `is_new`) VALUES
('Super Red Arowana', 'Scleropages formosus', 'Exotic', 45000.00, 38000.00, 2, 'Indonesia (Certificate Included)', 'Premium quality Super Red Arowana, 6 inches. Chip certified. The ultimate status symbol for your tank.', 'https://images.unsplash.com/photo-1629802497643-4dc392473456?q=80&w=800&auto=format&fit=crop', 1),
('Ocellaris Clownfish (Pair)', 'Amphiprion ocellaris', 'Marine', 1800.00, 1500.00, 12, 'Captive Bred', 'Hardy and vibrant Nemo clownfish pair. Perfect for beginner saltwater setups.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop', 0),
('Flowerhorn Magma', 'Hua Luo Han', 'Exotic', 8500.00, 6200.00, 5, 'Thailand Import', 'High quality Flowerhorn with massive kok (head hump) and vibrant pearl markings.', 'https://images.unsplash.com/photo-1534575180408-f7e7da6b51c4?q=80&w=800&auto=format&fit=crop', 0),
('Discus Turquoise Blue', 'Symphysodon', 'Exotic', 2500.00, NULL, 15, 'Malaysia', '3-inch size. Stunning electric blue patterns. Requires soft, warm water.', 'https://images.unsplash.com/photo-1525697426162-4b2a8a815777?q=80&w=800&auto=format&fit=crop', 0),
('Neon Tetra School (10 Pcs)', 'Paracheirodon innesi', 'Freshwater', 600.00, 450.00, 50, 'Local Breed', 'Classic peaceful community fish. Adds a neon glow to planted tanks.', 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=800&auto=format&fit=crop', 0),
('Blue Tang (Dory)', 'Paracanthurus hepatus', 'Marine', 3500.00, 3200.00, 6, 'Indo-Pacific', 'Vibrant blue surgeonfish. Requires a tank of at least 4 feet.', 'https://images.unsplash.com/photo-1585848888062-a50d4f3b8909?q=80&w=800&auto=format&fit=crop', 0),
('Opti-Clear Nature Tank', NULL, 'Tanks', 4500.00, 3999.00, 8, 'India', '60x30x30cm Crystal Clear Glass (Extra Clear). Invisible silicone seams.', 'https://images.unsplash.com/photo-1517316744-88aa34208226?q=80&w=800&auto=format&fit=crop', 1),
('Hikari Gold Pellets (250g)', NULL, 'Food', 850.00, NULL, 30, 'Japan', 'Daily diet for Cichlids and larger tropical fish to enhance color.', 'https://images.unsplash.com/photo-1627916606992-7f2e143b81eb?q=80&w=800&auto=format&fit=crop', 0),
('Full Spectrum LED Light', NULL, 'Accessories', 2200.00, 1800.00, 20, 'China', 'WRGB Light suitable for high-tech planted tanks. App controllable.', 'https://images.unsplash.com/photo-1629802498263-2284dc862083?q=80&w=800&auto=format&fit=crop', 0),
('Betta Halfmoon', 'Betta splendens', 'Freshwater', 450.00, NULL, 25, 'Thailand', 'Show quality Halfmoon Betta with 180-degree tail spread.', 'https://images.unsplash.com/photo-1520188746-88096f9277d6?q=80&w=800&auto=format&fit=crop', 0);

-- ============================================
-- End of Database Setup
-- ============================================


