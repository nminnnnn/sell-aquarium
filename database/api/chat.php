<?php
/**
 * Chat API (minimal) for cross-browser messaging
 * Endpoints:
 *  GET  /api/chat.php?conversationId=123        -> messages for conversation
 *  GET  /api/chat.php?all=1                     -> all messages (admin view)
 *  POST /api/chat.php                           -> create message
 *     { conversationId, senderId, senderName, senderRole, message }
 */
require_once __DIR__ . '/../config.php';

$pdo = getDBConnection();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (isset($_GET['conversationId'])) {
            $conversationId = $_GET['conversationId'];
            $stmt = $pdo->prepare("SELECT id, conversation_id AS conversationId, sender_id AS senderId, sender_name AS senderName, sender_role AS senderRole, message, created_at AS timestamp, `read`
                                    FROM chat_messages
                                    WHERE conversation_id = ?
                                    ORDER BY created_at ASC");
            $stmt->execute([$conversationId]);
            $messages = $stmt->fetchAll();
            sendJSON(['success' => true, 'messages' => $messages]);
        } elseif (isset($_GET['all'])) {
            $stmt = $pdo->query("SELECT id, conversation_id AS conversationId, sender_id AS senderId, sender_name AS senderName, sender_role AS senderRole, message, created_at AS timestamp, `read`
                                 FROM chat_messages
                                 ORDER BY created_at ASC");
            $messages = $stmt->fetchAll();
            sendJSON(['success' => true, 'messages' => $messages]);
        } else {
            sendJSON(['success' => false, 'message' => 'Missing conversationId'], 400);
        }
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = getRequestData();
        $required = ['conversationId', 'senderId', 'senderName', 'senderRole', 'message'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                sendJSON(['success' => false, 'message' => "Field $field is required"], 400);
            }
        }

        $conversationId = $data['conversationId'];
        $senderId = $data['senderId'];
        $senderName = $data['senderName'];
        $senderRole = $data['senderRole'] === 'admin' ? 'admin' : 'customer';
        $message = $data['message'];
        $read = $senderRole === 'admin' ? 1 : 0; // admin messages mark as read for admin side

        $stmt = $pdo->prepare("INSERT INTO chat_messages (conversation_id, sender_id, sender_name, sender_role, message, `read`)
                               VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$conversationId, $senderId, $senderName, $senderRole, $message, $read]);

        $id = $pdo->lastInsertId();
        $stmt = $pdo->prepare("SELECT id, conversation_id AS conversationId, sender_id AS senderId, sender_name AS senderName, sender_role AS senderRole, message, created_at AS timestamp, `read`
                               FROM chat_messages WHERE id = ?");
        $stmt->execute([$id]);
        $newMessage = $stmt->fetch();

        sendJSON(['success' => true, 'message' => $newMessage]);
    }

    sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Chat API error: ' . $e->getMessage());
    sendJSON(['success' => false, 'message' => 'Server error'], 500);
}

