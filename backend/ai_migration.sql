-- ============================================
-- AI Chatbot Migration
-- Add columns to support AI responses
-- ============================================

USE `charan_aquarium`;

-- Add columns to chat_messages table
ALTER TABLE `chat_messages` 
ADD COLUMN `is_ai_response` TINYINT(1) DEFAULT 0 AFTER `read`,
ADD COLUMN `ai_model` VARCHAR(50) NULL AFTER `is_ai_response`;

-- Add index for faster queries
CREATE INDEX `idx_is_ai_response` ON `chat_messages`(`is_ai_response`);

-- ============================================
-- Migration Complete
-- ============================================

