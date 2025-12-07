<?php
/**
 * Database Configuration for Docker
 * Use this config when running with Docker
 */

// Docker MySQL configuration
define('DB_HOST', 'localhost'); // Use 'mysql' if PHP is also in Docker
define('DB_USER', 'charan_user');
define('DB_PASS', 'charan_password');
define('DB_NAME', 'charan_aquarium');
define('DB_CHARSET', 'utf8mb4');
define('DB_PORT', 3306);

// Alternative: If PHP is running inside Docker network, use:
// define('DB_HOST', 'mysql'); // Container name

// Create database connection
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo;
    } catch (PDOException $e) {
        // Log error (in production, log to file instead of displaying)
        error_log("Database Connection Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $e->getMessage()
        ]);
        exit;
    }
}

// Helper function to send JSON response
function sendJSON($data, $statusCode = 200) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Helper function to get request data
function getRequestData() {
    $data = json_decode(file_get_contents('php://input'), true);
    return $data ?: [];
}

// CORS headers (for development)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

?>


