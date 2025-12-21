<?php
/**
 * Reviews API
 * Handles product reviews and ratings
 */

require_once __DIR__ . '/../config.php';

// Set CORS headers
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
    $pdo = getDBConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get reviews for a product
            $productId = $_GET['productId'] ?? null;
            $userId = $_GET['userId'] ?? null; // Optional: check if user can review
            
            if (!$productId) {
                sendJSON(['success' => false, 'message' => 'productId is required'], 400);
            }
            
            try {
                $stmt = $pdo->prepare("
                    SELECT id, product_id AS productId, user_id AS userId, user_name AS userName, 
                           rating, comment, created_at AS createdAt
                    FROM product_reviews
                    WHERE product_id = ?
                    ORDER BY created_at DESC
                ");
                $stmt->execute([$productId]);
                $reviews = $stmt->fetchAll();
                
                // Convert timestamps to Vietnam timezone
                foreach ($reviews as &$review) {
                    $dt = new DateTime($review['createdAt'], new DateTimeZone('UTC'));
                    $dt->setTimezone(new DateTimeZone('Asia/Ho_Chi_Minh'));
                    $review['createdAt'] = $dt->format('c');
                    $review['rating'] = (int)$review['rating'];
                }
                
                // Check if user can review (has purchased the product)
                $canReview = false;
                if ($userId) {
                    $purchaseCheck = $pdo->prepare("
                        SELECT COUNT(*) 
                        FROM order_items oi
                        INNER JOIN orders o ON oi.order_id = o.id
                        WHERE o.user_id = ? AND oi.product_id = ?
                        AND o.status IN ('paid', 'delivered')
                    ");
                    $purchaseCheck->execute([$userId, $productId]);
                    $canReview = $purchaseCheck->fetchColumn() > 0;
                }
                
                sendJSON([
                    'success' => true, 
                    'reviews' => $reviews,
                    'canReview' => $canReview
                ]);
            } catch (PDOException $e) {
                error_log("Get Reviews Error: " . $e->getMessage());
                sendJSON(['success' => false, 'message' => 'Failed to get reviews'], 500);
            }
            break;
            
        case 'POST':
            // Create or update a review
            $data = getRequestData();
            
            $productId = $data['productId'] ?? null;
            $userId = $data['userId'] ?? null;
            $userName = $data['userName'] ?? '';
            $rating = $data['rating'] ?? null;
            $comment = trim($data['comment'] ?? '');
            
            // Validation
            if (!$productId || !$userId || !$userName || !$rating) {
                sendJSON(['success' => false, 'message' => 'productId, userId, userName, and rating are required'], 400);
            }
            
            if (!is_numeric($rating) || $rating < 1 || $rating > 5) {
                sendJSON(['success' => false, 'message' => 'rating must be between 1 and 5'], 400);
            }
            
            $rating = (int)$rating;
            
            try {
                // Check if user has purchased this product
                $purchaseCheck = $pdo->prepare("
                    SELECT COUNT(*) 
                    FROM order_items oi
                    INNER JOIN orders o ON oi.order_id = o.id
                    WHERE o.user_id = ? AND oi.product_id = ?
                    AND o.status IN ('paid', 'delivered')
                ");
                $purchaseCheck->execute([$userId, $productId]);
                $hasPurchased = $purchaseCheck->fetchColumn() > 0;
                
                if (!$hasPurchased) {
                    sendJSON(['success' => false, 'message' => 'Bạn phải mua sản phẩm này trước khi đánh giá'], 403);
                }
                
                // Check if review already exists (user can only review once per product)
                $checkStmt = $pdo->prepare("
                    SELECT id FROM product_reviews 
                    WHERE user_id = ? AND product_id = ?
                ");
                $checkStmt->execute([$userId, $productId]);
                $existingReview = $checkStmt->fetchColumn();
                
                if ($existingReview) {
                    // Update existing review
                    $updateStmt = $pdo->prepare("
                        UPDATE product_reviews 
                        SET rating = ?, comment = ?, updated_at = NOW()
                        WHERE id = ?
                    ");
                    $updateStmt->execute([$rating, $comment, $existingReview]);
                    $reviewId = $existingReview;
                } else {
                    // Create new review
                    $insertStmt = $pdo->prepare("
                        INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment)
                        VALUES (?, ?, ?, ?, ?)
                    ");
                    $insertStmt->execute([$productId, $userId, $userName, $rating, $comment]);
                    $reviewId = $pdo->lastInsertId();
                }
                
                // Get the review with Vietnam timezone
                $getStmt = $pdo->prepare("
                    SELECT id, product_id AS productId, user_id AS userId, user_name AS userName, 
                           rating, comment, created_at AS createdAt
                    FROM product_reviews
                    WHERE id = ?
                ");
                $getStmt->execute([$reviewId]);
                $review = $getStmt->fetch();
                
                $dt = new DateTime($review['createdAt'], new DateTimeZone('UTC'));
                $dt->setTimezone(new DateTimeZone('Asia/Ho_Chi_Minh'));
                $review['createdAt'] = $dt->format('c');
                $review['rating'] = (int)$review['rating'];
                
                sendJSON(['success' => true, 'review' => $review]);
            } catch (PDOException $e) {
                error_log("Create Review Error: " . $e->getMessage());
                sendJSON(['success' => false, 'message' => 'Failed to create review'], 500);
            }
            break;
            
        default:
            sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Reviews API Error: " . $e->getMessage());
    sendJSON(['success' => false, 'message' => 'Server error occurred'], 500);
}

