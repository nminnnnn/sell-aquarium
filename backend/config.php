<?php
/**
 * Database Configuration for Docker
 * Update port to match Docker mapping (3307)
 */

// Docker MySQL configuration
define('DB_HOST', '127.0.0.1'); // SỬA: Dùng IP này an toàn hơn localhost khi chạy port lạ
define('DB_USER', 'charan_user'); // Đảm bảo user này ĐÚNG với lúc bạn tạo Docker
define('DB_PASS', 'charan_password'); // Đảm bảo pass này ĐÚNG với lúc bạn tạo Docker
define('DB_NAME', 'charan_aquarium');
define('DB_CHARSET', 'utf8mb4');
define('DB_PORT', 3307); // <--- QUAN TRỌNG: Sửa thành 3307 (theo docker ps của bạn)

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
        // Log error
        error_log("Database Connection Error: " . $e->getMessage());
        
        // Trả về JSON lỗi để Frontend hiển thị (giúp bạn debug dễ hơn)
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Lỗi kết nối Database: ' . $e->getMessage()
        ]);
        exit;
    }
}

// ... (Giữ nguyên các hàm bên dưới) ...
// Helper function to send JSON response
function sendJSON($data, $statusCode = 200) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getRequestData() {
    $data = json_decode(file_get_contents('php://input'), true);
    return $data ?: [];
}

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>