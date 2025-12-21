-- Migration: Add sales_count field to products table for bestsellers feature
USE `charan_aquarium`;

-- Add sales_count column to products table
ALTER TABLE `products` 
ADD COLUMN `sales_count` INT(11) DEFAULT 0 AFTER `review_count`;

-- Create index for better query performance when sorting by sales_count
CREATE INDEX `idx_sales_count` ON `products`(`sales_count` DESC);

-- Optional: Update existing products to have sales_count based on historical orders
-- This will count all items from orders with status 'paid' or 'delivered'
UPDATE `products` p
SET `sales_count` = (
    SELECT COALESCE(SUM(oi.quantity), 0)
    FROM `order_items` oi
    INNER JOIN `orders` o ON oi.order_id = o.id
    WHERE oi.product_id = p.id
    AND o.status IN ('paid', 'delivered')
);

