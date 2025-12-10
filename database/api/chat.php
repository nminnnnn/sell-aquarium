<?php
require_once __DIR__ . '/../config.php';

$pdo = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? null;

function ensureConversation(PDO $pdo, $userId) {
    // Return existing conversation id or create a new one for this user
    $stmt = $pdo->prepare("SELECT id FROM chat_conversations WHERE user_id = ?");
    $stmt->execute([$userId]);
    $existing = $stmt->fetchColumn();
    if ($existing) return $existing;

    $stmt = $pdo->prepare("INSERT INTO chat_conversations (user_id) VALUES (?)");
    $stmt->execute([$userId]);
    return $pdo->lastInsertId();
}

if ($method === 'GET') {
    if ($action === 'conversations') {
        // List conversations for admin
        $sql = "
            SELECT 
                c.id AS conversationId,
                c.user_id AS userId,
                u.name AS userName,
                (
                    SELECT message FROM chat_messages m 
                    WHERE m.conversation_id = c.id 
                    ORDER BY m.created_at DESC 
                    LIMIT 1
                ) AS lastMessage,
                (
                    SELECT created_at FROM chat_messages m 
                    WHERE m.conversation_id = c.id 
                    ORDER BY m.created_at DESC 
                    LIMIT 1
                ) AS lastMessageAt
            FROM chat_conversations c
            LEFT JOIN users u ON u.id = c.user_id
            ORDER BY 
                (lastMessageAt IS NULL) ASC,  -- push NULLs to the end in MySQL
                lastMessageAt DESC,
                c.created_at DESC
        ";
        $rows = $pdo->query($sql)->fetchAll();
        sendJSON(['success' => true, 'data' => $rows]);
    }

    if ($action === 'messages') {
        $conversationId = $_GET['conversationId'] ?? null;
        $userId = $_GET['userId'] ?? null;
        if (!$conversationId && !$userId) {
            sendJSON(['success' => false, 'message' => 'conversationId or userId required'], 400);
        }

        if ($userId && !$conversationId) {
            $conversationId = ensureConversation($pdo, $userId);
        }

        $stmt = $pdo->prepare("
            SELECT id, conversation_id AS conversationId, sender_id AS senderId, sender_role AS senderRole,
                   sender_name AS senderName, message, created_at AS timestamp, `read`
            FROM chat_messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC
        ");
        $stmt->execute([$conversationId]);
        $messages = $stmt->fetchAll();
        sendJSON(['success' => true, 'data' => $messages, 'conversationId' => $conversationId]);
    }

    sendJSON(['success' => false, 'message' => 'Invalid action'], 400);
}

if ($method === 'POST') {
    $data = getRequestData();
    $userId = $data['userId'] ?? null; // conversation is tied to this user
    $senderId = $data['senderId'] ?? null;
    $senderName = $data['senderName'] ?? '';
    $senderRole = $data['senderRole'] ?? '';
    $message = trim($data['message'] ?? '');

    if (!$userId || !$senderId || !$senderRole || $message === '') {
        sendJSON(['success' => false, 'message' => 'userId, senderId, senderRole, message are required'], 400);
    }

    // Make sure conversation exists for this user
    $conversationId = ensureConversation($pdo, $userId);

    $stmt = $pdo->prepare("
        INSERT INTO chat_messages (conversation_id, sender_id, sender_role, sender_name, message)
        VALUES (:conversation_id, :sender_id, :sender_role, :sender_name, :message)
    ");
    $stmt->execute([
        ':conversation_id' => $conversationId,
        ':sender_id' => $senderId,
        ':sender_role' => $senderRole,
        ':sender_name' => $senderName,
        ':message' => $message
    ]);

    sendJSON([
        'success' => true,
        'data' => [
          'id' => $pdo->lastInsertId(),
          'conversationId' => $conversationId,
          'senderId' => $senderId,
          'senderRole' => $senderRole,
          'senderName' => $senderName,
          'message' => $message,
          'timestamp' => date('c'),
          'read' => false
        ]
    ]);
}

sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);

