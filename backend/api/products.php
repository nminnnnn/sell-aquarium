<?php
/**
 * Products API
 * Handles product CRUD operations
 */

// Set CORS headers FIRST
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDBConnection();
    
    switch ($method) {
    case 'GET':
        // Get all products, filter by category, or get bestsellers
        $category = $_GET['category'] ?? null;
        $bestsellers = isset($_GET['bestsellers']) && $_GET['bestsellers'] === '1';
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
        
        try {
            if ($bestsellers) {
                // Get bestsellers (products with highest sales_count)
                $limitClause = $limit ? "LIMIT " . (int)$limit : "LIMIT 10";
                $stmt = $pdo->prepare("SELECT * FROM products WHERE sales_count > 0 ORDER BY sales_count DESC, created_at DESC $limitClause");
                $stmt->execute();
            } elseif ($category) {
                $stmt = $pdo->prepare("SELECT * FROM products WHERE category = ? ORDER BY created_at DESC");
                $stmt->execute([$category]);
            } else {
                $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
            }
            
            $products = $stmt->fetchAll();
            
            // Convert numeric strings to proper types and transform to camelCase for frontend
            foreach ($products as &$product) {
                // Transform to camelCase format that frontend expects
                $transformed = [
                    'id' => (string)$product['id'],
                    'name' => $product['name'],
                    'scientificName' => $product['scientific_name'] ?? null,
                    'category' => $product['category'],
                    'price' => (float)$product['price'],
                    'offerPrice' => $product['offer_price'] ? (float)$product['offer_price'] : null,
                    'stock' => (int)$product['stock'],
                    'origin' => $product['origin'] ?? '',
                    'description' => $product['description'] ?? '',
                    'image' => $product['image'] ?? '',
                    'isNew' => (bool)$product['is_new'],
                    'averageRating' => isset($product['average_rating']) && $product['average_rating'] !== null 
                        ? (float)$product['average_rating'] 
                        : null,
                    'reviewCount' => isset($product['review_count']) && $product['review_count'] !== null
                        ? (int)$product['review_count']
                        : 0,
                    'salesCount' => isset($product['sales_count']) && $product['sales_count'] !== null
                        ? (int)$product['sales_count']
                        : 0
                ];
                $product = $transformed;
            }
            
            sendJSON(['success' => true, 'products' => $products]);
        } catch (PDOException $e) {
            error_log("Get Products Error: " . $e->getMessage());
            sendJSON(['success' => false, 'message' => 'Failed to get products'], 500);
        }
        break;
        
    case 'POST':
        // Create new product (Admin only)
        $data = getRequestData();
        
        $required = ['name', 'category', 'price', 'stock'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                sendJSON(['success' => false, 'message' => "Field '$field' is required"], 400);
            }
        }
        
        try {
            $stmt = $pdo->prepare("
                INSERT INTO products (name, scientific_name, category, price, offer_price, stock, origin, description, image, is_new)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['name'],
                $data['scientific_name'] ?? null,
                $data['category'],
                $data['price'],
                $data['offer_price'] ?? null,
                $data['stock'],
                $data['origin'] ?? null,
                $data['description'] ?? null,
                $data['image'] ?? null,
                $data['is_new'] ?? 0
            ]);
            
            $productId = $pdo->lastInsertId();
            sendJSON(['success' => true, 'message' => 'Product created', 'id' => $productId], 201);
        } catch (PDOException $e) {
            error_log("Create Product Error: " . $e->getMessage());
            sendJSON(['success' => false, 'message' => 'Failed to create product'], 500);
        }
        break;
        
    case 'PUT':
        // Update product (Admin only)
        $data = getRequestData();
        $productId = $data['id'] ?? $_GET['id'] ?? null;
        
        if (!$productId) {
            sendJSON(['success' => false, 'message' => 'Product ID is required'], 400);
        }
        
        try {
            // Build dynamic UPDATE query based on provided fields
            $updateFields = [];
            $params = [];
            
            $allowedFields = ['name', 'scientific_name', 'category', 'price', 'offer_price', 'stock', 'origin', 'description', 'image', 'is_new'];
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "`$field` = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (empty($updateFields)) {
                sendJSON(['success' => false, 'message' => 'No fields to update'], 400);
            }
            
            $params[] = $productId;
            $sql = "UPDATE products SET " . implode(', ', $updateFields) . " WHERE id = ?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            if ($stmt->rowCount() > 0) {
                sendJSON(['success' => true, 'message' => 'Product updated']);
            } else {
                sendJSON(['success' => false, 'message' => 'Product not found'], 404);
            }
        } catch (PDOException $e) {
            error_log("Update Product Error: " . $e->getMessage());
            sendJSON(['success' => false, 'message' => 'Failed to update product'], 500);
        }
        break;
        
    case 'DELETE':
        // Delete product (Admin only)
        $productId = $_GET['id'] ?? null;
        
        if (!$productId) {
            sendJSON(['success' => false, 'message' => 'Product ID required'], 400);
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$productId]);
            
            if ($stmt->rowCount() > 0) {
                sendJSON(['success' => true, 'message' => 'Product deleted']);
            } else {
                sendJSON(['success' => false, 'message' => 'Product not found'], 404);
            }
        } catch (PDOException $e) {
            error_log("Delete Product Error: " . $e->getMessage());
            sendJSON(['success' => false, 'message' => 'Failed to delete product'], 500);
        }
        break;
        
    default:
        sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
        break;
    }
} catch (PDOException $e) {
    error_log("Products API Database Error: " . $e->getMessage());
    sendJSON(['success' => false, 'message' => 'Database error occurred'], 500);
} catch (Exception $e) {
    error_log("Products API Error: " . $e->getMessage());
    sendJSON(['success' => false, 'message' => 'Server error occurred'], 500);
}

?>


