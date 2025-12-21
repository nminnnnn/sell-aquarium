<?php
// Disable error display to prevent HTML output
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Set CORS headers FIRST, before any output
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    require_once __DIR__ . '/../config.php';
    
    $pdo = getDBConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? $_POST['action'] ?? null;
} catch (Exception $e) {
    error_log("Chat API Init Error: " . $e->getMessage());
    sendJSON(['success' => false, 'message' => 'Server initialization error'], 500);
}

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

try {
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
                   sender_name AS senderName, message, created_at, `read`
            FROM chat_messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC
        ");
        $stmt->execute([$conversationId]);
        $rows = $stmt->fetchAll();
        
        // Convert timestamps to Vietnam timezone (Asia/Ho_Chi_Minh)
        $messages = array_map(function($row) {
            $dt = new DateTime($row['created_at'], new DateTimeZone('UTC'));
            $dt->setTimezone(new DateTimeZone('Asia/Ho_Chi_Minh'));
            $row['timestamp'] = $dt->format('c'); // ISO 8601 format
            return $row;
        }, $rows);
        
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

    // Check for duplicate message (same message within last 2 seconds to prevent double-submit)
    $duplicateCheck = $pdo->prepare("
        SELECT id FROM chat_messages 
        WHERE conversation_id = ? 
        AND sender_id = ? 
        AND message = ? 
        AND created_at > DATE_SUB(NOW(), INTERVAL 2 SECOND)
        LIMIT 1
    ");
    $duplicateCheck->execute([$conversationId, $senderId, $message]);
    $existingMessage = $duplicateCheck->fetchColumn();
    
    if ($existingMessage) {
        // Message already exists (likely double-submit), return existing message
        // IMPORTANT: Don't call AI again for duplicate message (save quota!)
        $stmt = $pdo->prepare("
            SELECT id, conversation_id AS conversationId, sender_id AS senderId, sender_role AS senderRole,
                   sender_name AS senderName, message, created_at, `read`
            FROM chat_messages
            WHERE id = ?
        ");
        $stmt->execute([$existingMessage]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            $dt = new DateTime($existing['created_at'], new DateTimeZone('UTC'));
            $dt->setTimezone(new DateTimeZone('Asia/Ho_Chi_Minh'));
            $existing['timestamp'] = $dt->format('c');
            
            sendJSON([
                'success' => true,
                'data' => [
                    'id' => $existing['id'],
                    'conversationId' => $existing['conversationId'],
                    'senderId' => $existing['senderId'],
                    'senderRole' => $existing['senderRole'],
                    'senderName' => $existing['senderName'],
                    'message' => $existing['message'],
                    'timestamp' => $existing['timestamp'],
                    'read' => false,
                    'isAI' => false
                ],
                'duplicate' => true
            ]);
            return; // Exit early - don't call AI for duplicate!
        }
    }

    // Save user's message first
    $stmt = $pdo->prepare("
        INSERT INTO chat_messages (conversation_id, sender_id, sender_role, sender_name, message, is_ai_response)
        VALUES (?, ?, ?, ?, ?, 0)
    ");
    $stmt->execute([
        $conversationId,
        $senderId,
        $senderRole,
        $senderName,
        $message
    ]);
    
    $userMessageId = $pdo->lastInsertId();

    // Check if we should use AI to respond (only for customer messages)
    $useAI = false;
    try {
        require_once __DIR__ . '/ai_chat.php';
        // Pass conversationId and pdo to check if user has requested admin before
        $useAI = shouldUseAI($message, $senderRole, $pdo, $conversationId);
    } catch (Exception $e) {
        error_log("AI Chatbot require error: " . $e->getMessage());
        // Continue without AI if there's an error
    }
    
    $responseData = [
        'id' => $userMessageId,
        'conversationId' => $conversationId,
        'senderId' => $senderId,
        'senderRole' => $senderRole,
        'senderName' => $senderName,
        'message' => $message,
        'timestamp' => date('c'),
        'read' => false,
        'isAI' => false
    ];

    // If AI is enabled and this is a customer message, get AI response
    if ($useAI) {
        try {
            // Get conversation history for context
            $history = getConversationHistory($pdo, $conversationId);
            
            // Call AI chatbot
            $aiResponse = callAIChatbot($message, $history);
            
            // Save AI response as a message from "AI Assistant"
            $aiStmt = $pdo->prepare("
                INSERT INTO chat_messages (conversation_id, sender_id, sender_role, sender_name, message, is_ai_response, ai_model)
                VALUES (?, 0, 'admin', 'AI Assistant', ?, 1, 'gemini-1.5-flash')
            ");
            $aiStmt->execute([
                $conversationId,
                $aiResponse
            ]);
            
            $aiMessageId = $pdo->lastInsertId();
            
            // Add AI response to response data
            $responseData['aiResponse'] = [
                'id' => $aiMessageId,
                'conversationId' => $conversationId,
                'senderId' => '0',
                'senderRole' => 'admin',
                'senderName' => 'AI Assistant',
                'message' => $aiResponse,
                'timestamp' => date('c'),
                'read' => false,
                'isAI' => true
            ];
        } catch (Exception $e) {
            // Log error but don't fail the request
            error_log("AI Chatbot Error: " . $e->getMessage());
            // Continue without AI response - admin will handle it manually
        }
    }

    sendJSON([
        'success' => true,
        'data' => $responseData
    ]);
} else {
    sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
}

} catch (Exception $e) {
    error_log("Chat API Error: " . $e->getMessage());
    sendJSON(['success' => false, 'message' => 'Server error occurred'], 500);
}

