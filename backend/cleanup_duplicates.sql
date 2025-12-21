-- ============================================
-- Cleanup Duplicate Messages
-- Remove duplicate messages from chat_messages table
-- ============================================

USE `charan_aquarium`;

-- Find duplicate messages (same conversation_id, sender_id, message, created_at within 1 second)
SELECT 
    conversation_id,
    sender_id,
    message,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(id ORDER BY id) as message_ids
FROM chat_messages
GROUP BY conversation_id, sender_id, message, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s')
HAVING COUNT(*) > 1;

-- Delete duplicates, keeping only the first one (lowest id)
DELETE m1 FROM chat_messages m1
INNER JOIN chat_messages m2 
WHERE m1.id > m2.id 
AND m1.conversation_id = m2.conversation_id
AND m1.sender_id = m2.sender_id
AND m1.message = m2.message
AND ABS(TIMESTAMPDIFF(SECOND, m1.created_at, m2.created_at)) < 2;

-- Verify cleanup
SELECT COUNT(*) as total_messages FROM chat_messages;

