<?php
/**
 * Orders API
 * Handles order creation and retrieval
 */

require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDBConnection();

switch ($method) {
    case 'GET':
        // Get orders - all orders for admin, user orders for customer
        $userId = $_GET['user_id'] ?? null;
        $all = $_GET['all'] ?? false; // For admin to get all orders
        
        try {
            if ($all && $userId) {
                // Admin: get all orders
                $stmt = $pdo->query("
                    SELECT o.*, 
                           GROUP_CONCAT(
                               JSON_OBJECT(
                                   'id', oi.id,
                                   'product_id', oi.product_id,
                                   'product_name', oi.product_name,
                                   'quantity', oi.quantity,
                                   'price', oi.price,
                                   'subtotal', oi.subtotal
                               )
                           ) as items_json
                    FROM orders o
                    LEFT JOIN order_items oi ON o.id = oi.order_id
                    GROUP BY o.id
                    ORDER BY o.date DESC
                ");
            } elseif ($userId) {
                // Customer: get their orders
                $stmt = $pdo->prepare("
                    SELECT o.*, 
                           GROUP_CONCAT(
                               JSON_OBJECT(
                                   'id', oi.id,
                                   'product_id', oi.product_id,
                                   'product_name', oi.product_name,
                                   'quantity', oi.quantity,
                                   'price', oi.price,
                                   'subtotal', oi.subtotal
                               )
                           ) as items_json
                    FROM orders o
                    LEFT JOIN order_items oi ON o.id = oi.order_id
                    WHERE o.user_id = ?
                    GROUP BY o.id
                    ORDER BY o.date DESC
                ");
                $stmt->execute([$userId]);
            } else {
                sendJSON(['success' => false, 'message' => 'User ID required'], 400);
                return;
            }
            
            $orders = $stmt->fetchAll();
            
            // Parse items JSON and format response
            foreach ($orders as &$order) {
                $order['id'] = (int)$order['id'];
                $order['user_id'] = (int)$order['user_id'];
                $order['total_amount'] = (float)$order['total_amount'];
                
                // Parse items JSON
                if ($order['items_json']) {
                    $items = [];
                    $itemRows = json_decode('[' . $order['items_json'] . ']', true);
                    foreach ($itemRows as $item) {
                        $items[] = [
                            'id' => (int)$item['id'],
                            'product_id' => (int)$item['product_id'],
                            'product_name' => $item['product_name'],
                            'quantity' => (int)$item['quantity'],
                            'price' => (float)$item['price'],
                            'subtotal' => (float)$item['subtotal']
                        ];
                    }
                    $order['items'] = $items;
                } else {
                    $order['items'] = [];
                }
                unset($order['items_json']);
            }
            
            sendJSON(['success' => true, 'orders' => $orders]);
        } catch (PDOException $e) {
            error_log("Get Orders Error: " . $e->getMessage());
            sendJSON(['success' => false, 'message' => 'Failed to get orders'], 500);
        }
        break;
        
    case 'POST':
        // Create new order
        $data = getRequestData();
        
        $required = ['user_id', 'user_name', 'user_phone', 'items', 'total_amount'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                sendJSON(['success' => false, 'message' => "Field '$field' is required"], 400);
            }
        }

        $status = $data['status'] ?? 'pending';
        if (!in_array($status, ['pending', 'paid', 'delivered'])) {
            $status = 'pending';
        }
        
        try {
            $pdo->beginTransaction();
            
            // Create order
            $stmt = $pdo->prepare("
                INSERT INTO orders (user_id, user_name, user_phone, total_amount, status)
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['user_id'],
                $data['user_name'],
                $data['user_phone'],
                $data['total_amount'],
                $status
            ]);
            
            $orderId = $pdo->lastInsertId();
            
            // Create order items
            $itemStmt = $pdo->prepare("
                INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            // Pre-check product existence to avoid FK failures
            $productCheck = $pdo->prepare("SELECT id FROM products WHERE id = ? LIMIT 1");
            
            foreach ($data['items'] as $item) {
                $productId = null;
                if (isset($item['id']) && is_numeric($item['id'])) {
                    $pid = (int)$item['id'];
                    $productCheck->execute([$pid]);
                    if ($productCheck->fetchColumn()) {
                        $productId = $pid;
                    }
                }

                $price = $item['offerPrice'] ?? $item['price'];
                $subtotal = $price * $item['quantity'];

                // Limit image length to avoid truncation
                $img = $item['image'] ?? null;
                if ($img && strlen($img) > 500) {
                    // Likely a data URI/base64, store null to avoid 1406 errors
                    $img = null;
                }

                $itemStmt->execute([
                    $orderId,
                    $productId, // can be null if not found to prevent FK error
                    $item['name'],
                    $img,
                    $item['quantity'],
                    $price,
                    $subtotal
                ]);
            }
            
            $pdo->commit();
            
            sendJSON([
                'success' => true,
                'message' => 'Order created successfully',
                'order_id' => $orderId
            ], 201);
        } catch (PDOException $e) {
            $pdo->rollBack();
            error_log("Create Order Error: " . $e->getMessage());
            sendJSON(['success' => false, 'message' => 'Failed to create order'], 500);
        }
        break;
        
    case 'PUT':
        // Update order status (Admin only)
        $data = getRequestData();
        $orderId = $data['order_id'] ?? null;
        $status = $data['status'] ?? null;
        
        if (!$orderId || !$status) {
            sendJSON(['success' => false, 'message' => 'Order ID and status are required'], 400);
        }
        
        if (!in_array($status, ['pending', 'paid', 'delivered'])) {
            sendJSON(['success' => false, 'message' => 'Invalid status'], 400);
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->execute([$status, $orderId]);
            
            if ($stmt->rowCount() > 0) {
                sendJSON(['success' => true, 'message' => 'Order status updated']);
            } else {
                sendJSON(['success' => false, 'message' => 'Order not found'], 404);
            }
        } catch (PDOException $e) {
            error_log("Update Order Error: " . $e->getMessage());
            sendJSON(['success' => false, 'message' => 'Failed to update order'], 500);
        }
        break;
        
    default:
        sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
        break;
}

?>


