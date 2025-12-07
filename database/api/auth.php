<?php
/**
 * Authentication API
 * Handles user login and authentication
 */

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

switch ($method) {
    case 'POST':
        $data = getRequestData();
        $action = $data['action'] ?? '';
        
        if ($action === 'login') {
            // Login with username and password
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';
            
            if (empty($username) || empty($password)) {
                sendJSON(['success' => false, 'message' => 'Username and password are required'], 400);
            }
            
            try {
                $stmt = $pdo->prepare("SELECT id, username, name, phone, role, address FROM users WHERE username = ? AND password = ?");
                // For demo: simple password check (in production, use password_verify with hashed passwords)
                // Since we're using plain text passwords in demo, we'll check directly
                $stmt->execute([$username, $password]);
                $user = $stmt->fetch();
                
                if ($user) {
                    // Remove password from response
                    sendJSON([
                        'success' => true,
                        'user' => $user,
                        'message' => 'Login successful'
                    ]);
                } else {
                    sendJSON(['success' => false, 'message' => 'Invalid username or password'], 401);
                }
            } catch (PDOException $e) {
                error_log("Login Error: " . $e->getMessage());
                sendJSON(['success' => false, 'message' => 'Login failed'], 500);
            }
        } else {
            sendJSON(['success' => false, 'message' => 'Invalid action'], 400);
        }
        break;
        
    case 'GET':
        // Get current user (if session/token provided)
        $userId = $_GET['user_id'] ?? null;
        
        if ($userId) {
            try {
                $stmt = $pdo->prepare("SELECT id, username, name, phone, role, address FROM users WHERE id = ?");
                $stmt->execute([$userId]);
                $user = $stmt->fetch();
                
                if ($user) {
                    sendJSON(['success' => true, 'user' => $user]);
                } else {
                    sendJSON(['success' => false, 'message' => 'User not found'], 404);
                }
            } catch (PDOException $e) {
                error_log("Get User Error: " . $e->getMessage());
                sendJSON(['success' => false, 'message' => 'Failed to get user'], 500);
            }
        } else {
            sendJSON(['success' => false, 'message' => 'User ID required'], 400);
        }
        break;
        
    default:
        sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
        break;
}

?>


