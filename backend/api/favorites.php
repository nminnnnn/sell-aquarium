<?php
/**
 * Favorites API
 * Handles user favorites/wishlist functionality
 */

require_once __DIR__ . '/../config.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $pdo = getDBConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get user's favorites
            $userId = $_GET['userId'] ?? null;
            
            if (!$userId) {
                sendJSON(['success' => false, 'message' => 'userId is required'], 400);
            }
            
            try {
                $stmt = $pdo->prepare("
                    SELECT uf.product_id, uf.created_at
                    FROM user_favorites uf
                    WHERE uf.user_id = ?
                    ORDER BY uf.created_at DESC
                ");
                $stmt->execute([$userId]);
                $favorites = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Extract product IDs
                $productIds = array_map(function($fav) {
                    return (int)$fav['product_id'];
                }, $favorites);
                
                sendJSON([
                    'success' => true,
                    'favorites' => $productIds
                ]);
            } catch (PDOException $e) {
                error_log("Get Favorites Error: " . $e->getMessage());
                sendJSON(['success' => false, 'message' => 'Failed to get favorites'], 500);
            }
            break;
            
        case 'POST':
            // Add product to favorites
            $data = getRequestData();
            $userId = $data['userId'] ?? null;
            $productId = $data['productId'] ?? null;
            
            if (!$userId || !$productId) {
                sendJSON(['success' => false, 'message' => 'userId and productId are required'], 400);
            }
            
            try {
                // Check if already favorited
                $checkStmt = $pdo->prepare("
                    SELECT id FROM user_favorites 
                    WHERE user_id = ? AND product_id = ?
                ");
                $checkStmt->execute([$userId, $productId]);
                if ($checkStmt->fetchColumn()) {
                    sendJSON(['success' => true, 'message' => 'Already in favorites']);
                    break;
                }
                
                // Add to favorites
                $insertStmt = $pdo->prepare("
                    INSERT INTO user_favorites (user_id, product_id)
                    VALUES (?, ?)
                ");
                $insertStmt->execute([$userId, $productId]);
                
                sendJSON([
                    'success' => true,
                    'message' => 'Added to favorites'
                ]);
            } catch (PDOException $e) {
                error_log("Add Favorite Error: " . $e->getMessage());
                sendJSON(['success' => false, 'message' => 'Failed to add to favorites'], 500);
            }
            break;
            
        case 'DELETE':
            // Remove product from favorites
            $data = getRequestData();
            $userId = $data['userId'] ?? null;
            $productId = $data['productId'] ?? null;
            
            if (!$userId || !$productId) {
                sendJSON(['success' => false, 'message' => 'userId and productId are required'], 400);
            }
            
            try {
                $stmt = $pdo->prepare("
                    DELETE FROM user_favorites 
                    WHERE user_id = ? AND product_id = ?
                ");
                $stmt->execute([$userId, $productId]);
                
                if ($stmt->rowCount() > 0) {
                    sendJSON([
                        'success' => true,
                        'message' => 'Removed from favorites'
                    ]);
                } else {
                    sendJSON([
                        'success' => false,
                        'message' => 'Favorite not found'
                    ], 404);
                }
            } catch (PDOException $e) {
                error_log("Remove Favorite Error: " . $e->getMessage());
                sendJSON(['success' => false, 'message' => 'Failed to remove from favorites'], 500);
            }
            break;
            
        default:
            sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Favorites API Error: " . $e->getMessage());
    sendJSON(['success' => false, 'message' => 'Server error occurred'], 500);
}

?>

