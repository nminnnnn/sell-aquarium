<?php
/**
 * Products API
 * Handles product CRUD operations
 */

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

switch ($method) {
    case 'GET':
        // Get all products or filter by category
        $category = $_GET['category'] ?? null;
        
        try {
            if ($category) {
                $stmt = $pdo->prepare("SELECT * FROM products WHERE category = ? ORDER BY created_at DESC");
                $stmt->execute([$category]);
            } else {
                $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
            }
            
            $products = $stmt->fetchAll();
            
            // Convert numeric strings to proper types
            foreach ($products as &$product) {
                $product['id'] = (int)$product['id'];
                $product['price'] = (float)$product['price'];
                $product['offer_price'] = $product['offer_price'] ? (float)$product['offer_price'] : null;
                $product['stock'] = (int)$product['stock'];
                $product['is_new'] = (bool)$product['is_new'];
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

?>


