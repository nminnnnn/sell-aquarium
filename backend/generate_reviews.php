<?php
/**
 * Generate Sample Reviews for Products
 * Creates sample orders and reviews for all products
 */

require_once __DIR__ . '/config.php';

try {
    $pdo = getDBConnection();
    $pdo->beginTransaction();
    
    // Get users
    $users = $pdo->query("SELECT id, name, phone FROM users LIMIT 5")->fetchAll();
    if (count($users) < 2) {
        echo "❌ Need at least 2 users. Please check database.\n";
        exit(1);
    }
    
    // Get all products
    $products = $pdo->query("SELECT id, name, category, price FROM products ORDER BY id")->fetchAll();
    
    if (count($products) == 0) {
        echo "❌ No products found.\n";
        exit(1);
    }
    
    echo "Found " . count($products) . " products and " . count($users) . " users\n";
    
    // Create sample orders for products
    $ordersCreated = 0;
    $orderItemsCreated = 0;
    
    // Order 1: User 1 buys first 3 products
    $total = 0;
    $items = [];
    for ($i = 0; $i < min(3, count($products)); $i++) {
        $items[] = $products[$i];
        $total += $products[$i]['price'] * 2;
    }
    
    if (count($items) > 0) {
        $stmt = $pdo->prepare("
            INSERT INTO orders (user_id, user_name, user_phone, total_amount, status, created_at)
            VALUES (?, ?, ?, ?, 'delivered', DATE_SUB(NOW(), INTERVAL 25 DAY))
        ");
        $stmt->execute([$users[0]['id'], $users[0]['name'], $users[0]['phone'], $total]);
        $orderId = $pdo->lastInsertId();
        $ordersCreated++;
        
        foreach ($items as $item) {
            $itemStmt = $pdo->prepare("
                INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
                VALUES (?, ?, ?, '', 2, ?, ?)
            ");
            $subtotal = $item['price'] * 2;
            $itemStmt->execute([$orderId, $item['id'], $item['name'], $item['price'], $subtotal]);
            $orderItemsCreated++;
        }
    }
    
    // Order 2: User 2 buys next 3 products
    $total = 0;
    $items = [];
    for ($i = 3; $i < min(6, count($products)); $i++) {
        $items[] = $products[$i];
        $total += $products[$i]['price'];
    }
    
    if (count($items) > 0 && isset($users[1])) {
        $stmt = $pdo->prepare("
            INSERT INTO orders (user_id, user_name, user_phone, total_amount, status, created_at)
            VALUES (?, ?, ?, ?, 'paid', DATE_SUB(NOW(), INTERVAL 20 DAY))
        ");
        $stmt->execute([$users[1]['id'], $users[1]['name'], $users[1]['phone'], $total]);
        $orderId = $pdo->lastInsertId();
        $ordersCreated++;
        
        foreach ($items as $item) {
            $itemStmt = $pdo->prepare("
                INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
                VALUES (?, ?, ?, '', 1, ?, ?)
            ");
            $itemStmt->execute([$orderId, $item['id'], $item['name'], $item['price'], $item['price']]);
            $orderItemsCreated++;
        }
    }
    
    // Order 3: User 3 buys remaining products
    $total = 0;
    $items = [];
    for ($i = 6; $i < count($products); $i++) {
        $items[] = $products[$i];
        $total += $products[$i]['price'];
    }
    
    if (count($items) > 0 && isset($users[2])) {
        $stmt = $pdo->prepare("
            INSERT INTO orders (user_id, user_name, user_phone, total_amount, status, created_at)
            VALUES (?, ?, ?, ?, 'delivered', DATE_SUB(NOW(), INTERVAL 15 DAY))
        ");
        $stmt->execute([$users[2]['id'], $users[2]['name'], $users[2]['phone'], $total]);
        $orderId = $pdo->lastInsertId();
        $ordersCreated++;
        
        foreach ($items as $item) {
            $itemStmt = $pdo->prepare("
                INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price, subtotal)
                VALUES (?, ?, ?, '', 1, ?, ?)
            ");
            $itemStmt->execute([$orderId, $item['id'], $item['name'], $item['price'], $item['price']]);
            $orderItemsCreated++;
        }
    }
    
    echo "Created $ordersCreated orders with $orderItemsCreated order items\n";
    
    // Generate reviews based on order_items
    // Map product names to review comments (since product IDs may vary)
    $reviewTemplates = [
        // Exotic
        'Super Red Arowana' => [
            'Cá Arowana tuyệt đẹp! Giấy tờ đầy đủ, chất lượng hàng đầu. Màu đỏ rực rỡ như trong hình, cá khỏe mạnh và thích nghi tốt với bể nhà tôi. Đáng giá với giá tiền bỏ ra.',
            'Arowana đẹp, màu sắc rực rỡ. Cá lớn và khỏe, phù hợp với bể lớn. Dịch vụ chuyên nghiệp, giao hàng cẩn thận.'
        ],
        'Flowerhorn Magma' => [
            'Flowerhorn đẹp, đầu to như mong đợi. Màu sắc rực rỡ, cá khỏe mạnh. Giao hàng cẩn thận, tư vấn nhiệt tình. Sẽ quay lại mua thêm.',
            'Flowerhorn chất lượng tốt, đầu to đẹp. Cá thích nghi tốt với bể nhà tôi. Giá cả hợp lý so với chất lượng.'
        ],
        'Discus Turquoise Blue' => [
            'Discus đẹp, màu xanh lam nổi bật. Cá khỏe, thích nghi tốt. Cần nước mềm và ấm như hướng dẫn. Rất hài lòng với sản phẩm.'
        ],
        // Marine
        'Ocellaris Clownfish (Pair)' => [
            'Cá Clownfish đẹp, màu cam rực rỡ. Cặp cá khỏe mạnh, phù hợp với bể nước mặn. Perfect cho người mới bắt đầu nuôi cá biển. Rất hài lòng!',
            'Nemo đẹp quá! Cặp cá sống khỏe, thích nghi tốt. Giao hàng nhanh, đóng gói cẩn thận.'
        ],
        'Blue Tang (Dory)' => [
            'Blue Tang đẹp tuyệt! Màu xanh dương rực rỡ. Cá lớn và khỏe, thích hợp với bể lớn. Giá cả hợp lý. Đáng mua!'
        ],
        // Freshwater
        'Neon Tetra School (10 Pcs)' => [
            'Neon Tetra đẹp, màu xanh neon rực rỡ. Bầy 10 con sống khỏe, thích hợp với bể cây thủy sinh. Giá cả phải chăng, chất lượng tốt.'
        ],
        'Betta Halfmoon' => [
            'Betta Halfmoon tuyệt đẹp! Đuôi xòe 180 độ như mô tả. Màu sắc rực rỡ, cá khỏe mạnh. Đóng gói cẩn thận. Rất hài lòng!'
        ],
        // Tanks
        'Opti-Clear Nature Tank' => [
            'Bể cá chất lượng tốt, kính trong suốt, không bị mờ. Kích thước 60x30x30cm đúng như mô tả. Thiết kế đẹp, phù hợp không gian. Lắp đặt dễ dàng. Giá cả hợp lý.'
        ],
        // Food
        'Hikari Gold Pellets (250g)' => [
            'Hikari Gold Pellets chất lượng tốt, cá rất thích ăn. Hạt đều, không bị vỡ. Cá phát triển tốt, màu sắc đẹp hơn sau khi dùng. Giá cả hợp lý, đóng gói kỹ càng. Sẽ mua lại.'
        ],
        // Accessories
        'Full Spectrum LED Light' => [
            'Đèn LED Full Spectrum tốt, màu sắc đẹp, điều khiển qua app tiện lợi. Phù hợp với bể cây thủy sinh, cây phát triển tốt. Thiết kế gọn gàng, dễ lắp đặt. Giá cả hợp lý.'
        ],
    ];
    
    $oldReviews = [
        // Exotic
        ['product_id' => 1, 'comments' => [
            'Cá Arowana tuyệt đẹp! Giấy tờ đầy đủ, chất lượng hàng đầu. Màu đỏ rực rỡ như trong hình, cá khỏe mạnh và thích nghi tốt với bể nhà tôi. Đáng giá với giá tiền bỏ ra.',
            'Arowana đẹp, màu sắc rực rỡ. Cá lớn và khỏe, phù hợp với bể lớn. Dịch vụ chuyên nghiệp, giao hàng cẩn thận.'
        ]],
        ['product_id' => 3, 'comments' => [
            'Flowerhorn đẹp, đầu to như mong đợi. Màu sắc rực rỡ, cá khỏe mạnh. Giao hàng cẩn thận, tư vấn nhiệt tình. Sẽ quay lại mua thêm.',
            'Flowerhorn chất lượng tốt, đầu to đẹp. Cá thích nghi tốt với bể nhà tôi. Giá cả hợp lý so với chất lượng.'
        ]],
        ['product_id' => 4, 'comments' => [
            'Discus đẹp, màu xanh lam nổi bật. Cá khỏe, thích nghi tốt. Cần nước mềm và ấm như hướng dẫn. Rất hài lòng với sản phẩm.'
        ]],
        // Marine
        ['product_id' => 2, 'comments' => [
            'Cá Clownfish đẹp, màu cam rực rỡ. Cặp cá khỏe mạnh, phù hợp với bể nước mặn. Perfect cho người mới bắt đầu nuôi cá biển. Rất hài lòng!',
            'Nemo đẹp quá! Cặp cá sống khỏe, thích nghi tốt. Giao hàng nhanh, đóng gói cẩn thận.'
        ]],
        ['product_id' => 6, 'comments' => [
            'Blue Tang đẹp tuyệt! Màu xanh dương rực rỡ. Cá lớn và khỏe, thích hợp với bể lớn. Giá cả hợp lý. Đáng mua!'
        ]],
        // Freshwater
        ['product_id' => 5, 'comments' => [
            'Neon Tetra đẹp, màu xanh neon rực rỡ. Bầy 10 con sống khỏe, thích hợp với bể cây thủy sinh. Giá cả phải chăng, chất lượng tốt.'
        ]],
        ['product_id' => 10, 'comments' => [
            'Betta Halfmoon tuyệt đẹp! Đuôi xòe 180 độ như mô tả. Màu sắc rực rỡ, cá khỏe mạnh. Đóng gói cẩn thận. Rất hài lòng!'
        ]],
        // Tanks
        ['product_id' => 7, 'comments' => [
            'Bể cá chất lượng tốt, kính trong suốt, không bị mờ. Kích thước 60x30x30cm đúng như mô tả. Thiết kế đẹp, phù hợp không gian. Lắp đặt dễ dàng. Giá cả hợp lý.'
        ]],
        // Food
        ['product_id' => 8, 'comments' => [
            'Hikari Gold Pellets chất lượng tốt, cá rất thích ăn. Hạt đều, không bị vỡ. Cá phát triển tốt, màu sắc đẹp hơn sau khi dùng. Giá cả hợp lý, đóng gói kỹ càng. Sẽ mua lại.'
        ]],
        // Accessories
        ['product_id' => 9, 'comments' => [
            'Đèn LED Full Spectrum tốt, màu sắc đẹp, điều khiển qua app tiện lợi. Phù hợp với bể cây thủy sinh, cây phát triển tốt. Thiết kế gọn gàng, dễ lắp đặt. Giá cả hợp lý.'
        ]],
    ];
    
    $reviewsCreated = 0;
    
    // Get all order_items for products
    $stmt = $pdo->prepare("
        SELECT DISTINCT oi.product_id, o.user_id, o.user_name
        FROM order_items oi
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('paid', 'delivered')
        AND oi.product_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM product_reviews pr 
            WHERE pr.product_id = oi.product_id AND pr.user_id = o.user_id
        )
        ORDER BY oi.product_id
    ");
    $stmt->execute();
    $orderItems = $stmt->fetchAll();
    
    foreach ($orderItems as $item) {
        if (empty($item['product_id']) || empty($item['user_id'])) {
            continue; // Skip invalid items
        }
        
        $productId = (int)$item['product_id'];
        
        // Get product name to find matching review template
        $productStmt = $pdo->prepare("SELECT name FROM products WHERE id = ?");
        $productStmt->execute([$productId]);
        $productName = $productStmt->fetchColumn();
        
        $comment = 'Sản phẩm chất lượng tốt, rất hài lòng!';
        if ($productName && isset($reviewTemplates[$productName]) && !empty($reviewTemplates[$productName])) {
            $templates = $reviewTemplates[$productName];
            $comment = is_array($templates) ? $templates[array_rand($templates)] : $templates;
        }
        
        $rating = rand(4, 5); // 4-5 stars
        $daysAgo = rand(1, 30);
        
        $reviewStmt = $pdo->prepare("
            INSERT INTO product_reviews (product_id, user_id, user_name, rating, comment, created_at)
            VALUES (?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
        ");
        $reviewStmt->execute([$productId, $item['user_id'], $item['user_name'], $rating, $comment, $daysAgo]);
        $reviewsCreated++;
    }
    
    // Update average ratings manually
    $updateStmt = $pdo->prepare("
        UPDATE products p
        SET 
            p.average_rating = COALESCE((
                SELECT AVG(pr.rating)
                FROM product_reviews pr
                WHERE pr.product_id = p.id
            ), 0),
            p.review_count = COALESCE((
                SELECT COUNT(*)
                FROM product_reviews pr
                WHERE pr.product_id = p.id
            ), 0)
    ");
    $updateStmt->execute();
    
    $pdo->commit();
    
    echo "✅ Created $reviewsCreated reviews\n\n";
    
    // Show summary
    $summary = $pdo->query("
        SELECT 
            p.name as product_name,
            p.category,
            COUNT(pr.id) as review_count,
            ROUND(AVG(pr.rating), 2) as avg_rating
        FROM products p
        LEFT JOIN product_reviews pr ON p.id = pr.product_id
        GROUP BY p.id, p.name, p.category
        ORDER BY review_count DESC, p.category
    ")->fetchAll();
    
    echo "Review Summary:\n";
    echo str_repeat('-', 70) . "\n";
    printf("%-30s %-12s %-8s %-10s\n", "Product", "Category", "Reviews", "Avg Rating");
    echo str_repeat('-', 70) . "\n";
    foreach ($summary as $row) {
        printf("%-30s %-12s %-8d %-10s\n", 
            substr($row['product_name'], 0, 28),
            $row['category'],
            (int)$row['review_count'],
            $row['avg_rating'] ? number_format($row['avg_rating'], 1) : 'N/A'
        );
    }
    
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

