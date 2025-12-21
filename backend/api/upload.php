<?php
/**
 * Image Upload API
 * Handles product image uploads
 */

// Load config for helper functions FIRST
require_once __DIR__ . '/../config.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
}

try {
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        sendJSON(['success' => false, 'message' => 'No file uploaded or upload error'], 400);
    }

    $file = $_FILES['image'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        sendJSON(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.'], 400);
    }

    // Validate file size (max 5MB)
    if ($file['size'] > 5 * 1024 * 1024) {
        sendJSON(['success' => false, 'message' => 'File size exceeds 5MB limit'], 400);
    }

    // Create upload directory if it doesn't exist
    $uploadDir = __DIR__ . '/../uploads/images/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'product_' . time() . '_' . uniqid() . '.' . $extension;
    $filepath = $uploadDir . $filename;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        sendJSON(['success' => false, 'message' => 'Failed to save uploaded file'], 500);
    }

    // Return URL relative to backend
    // Frontend can access via: http://localhost:8000/uploads/images/filename.jpg
    $imageUrl = '/uploads/images/' . $filename;

    sendJSON([
        'success' => true,
        'url' => $imageUrl,
        'imageUrl' => $imageUrl,
        'message' => 'Image uploaded successfully'
    ]);

} catch (Exception $e) {
    error_log("Image Upload Error: " . $e->getMessage());
    sendJSON(['success' => false, 'message' => 'Server error occurred'], 500);
}

?>

