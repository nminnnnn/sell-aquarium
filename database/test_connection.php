<?php
/**
 * Test Database Connection
 * Use this file to verify your database setup is working correctly
 */

require_once 'config.php';

echo "<h1>Charan Aquarium - Database Connection Test</h1>";
echo "<hr>";

try {
    $pdo = getDBConnection();
    echo "<p style='color: green;'>✅ Database connection successful!</p>";
    
    // Test: Get users count
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "<p><strong>Users in database:</strong> " . $result['count'] . "</p>";
    
    // Test: Get products count
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM products");
    $result = $stmt->fetch();
    echo "<p><strong>Products in database:</strong> " . $result['count'] . "</p>";
    
    // Test: List all users
    echo "<h2>Users List:</h2>";
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
    echo "<tr><th>ID</th><th>Username</th><th>Name</th><th>Role</th><th>Phone</th></tr>";
    
    $stmt = $pdo->query("SELECT id, username, name, role, phone FROM users");
    while ($user = $stmt->fetch()) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($user['id']) . "</td>";
        echo "<td>" . htmlspecialchars($user['username']) . "</td>";
        echo "<td>" . htmlspecialchars($user['name']) . "</td>";
        echo "<td>" . htmlspecialchars($user['role']) . "</td>";
        echo "<td>" . htmlspecialchars($user['phone']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Test: List sample products
    echo "<h2>Sample Products (First 5):</h2>";
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
    echo "<tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr>";
    
    $stmt = $pdo->query("SELECT id, name, category, price, stock FROM products LIMIT 5");
    while ($product = $stmt->fetch()) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($product['id']) . "</td>";
        echo "<td>" . htmlspecialchars($product['name']) . "</td>";
        echo "<td>" . htmlspecialchars($product['category']) . "</td>";
        echo "<td>₹" . number_format($product['price'], 2) . "</td>";
        echo "<td>" . htmlspecialchars($product['stock']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<hr>";
    echo "<p style='color: green;'><strong>✅ All tests passed! Database is ready to use.</strong></p>";
    echo "<p><a href='api/auth.php'>Test Auth API</a> | <a href='api/products.php'>Test Products API</a></p>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ Database connection failed!</p>";
    echo "<p><strong>Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<h3>Troubleshooting:</h3>";
    echo "<ul>";
    echo "<li>Check if MySQL service is running in XAMPP</li>";
    echo "<li>Verify database 'charan_aquarium' exists</li>";
    echo "<li>Check username and password in config.php</li>";
    echo "<li>Make sure you've imported charan_aquarium.sql</li>";
    echo "</ul>";
}

?>


