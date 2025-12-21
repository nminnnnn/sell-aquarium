-- ============================================
-- Shipping Address and Cost Migration
-- Adds shipping address and cost to orders table
-- ============================================

USE `charan_aquarium`;

-- Add shipping columns to orders table
ALTER TABLE `orders` 
ADD COLUMN `shipping_address` TEXT NULL AFTER `user_phone`,
ADD COLUMN `shipping_cost` DECIMAL(10, 2) DEFAULT 0.00 AFTER `shipping_address`,
ADD INDEX `idx_shipping_address` (`shipping_address`(255));

