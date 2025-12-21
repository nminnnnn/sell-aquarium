<?php
/**
 * Test AI Chatbot Connection
 * Run this file to test if Gemini API is working
 * URL: http://localhost:8000/test_ai.php
 */

header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/config.php';

echo "<h1>AI Chatbot Test</h1>";
echo "<hr>";

// Check API Key
$apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : (getenv('GEMINI_API_KEY') ?: '');

echo "<h2>1. API Key Check</h2>";
if (empty($apiKey)) {
    echo "<p style='color: red;'>❌ API Key chưa được cấu hình!</p>";
    echo "<p>Vui lòng thêm API key vào <code>backend/config.php</code>:</p>";
    echo "<pre>define('GEMINI_API_KEY', 'AIzaSy...');</pre>";
    exit;
} else {
    echo "<p style='color: green;'>✅ API Key đã được cấu hình</p>";
    echo "<p>API Key: <code>" . substr($apiKey, 0, 10) . "...</code></p>";
}

// Test Gemini API - List available models first
echo "<h2>2. Listing Available Models</h2>";

$listUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" . $apiKey;
$ch = curl_init($listUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$listResponse = curl_exec($ch);
$listHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($listHttpCode === 200) {
    $models = json_decode($listResponse, true);
    echo "<p style='color: green;'>✅ Successfully retrieved models list</p>";
    echo "<h3>Available Models:</h3>";
    echo "<ul>";
    if (isset($models['models'])) {
        foreach ($models['models'] as $model) {
            if (isset($model['name']) && strpos($model['name'], 'gemini') !== false) {
                $modelName = str_replace('models/', '', $model['name']);
                $supportedMethods = isset($model['supportedGenerationMethods']) ? implode(', ', $model['supportedGenerationMethods']) : 'N/A';
                echo "<li><strong>" . htmlspecialchars($modelName) . "</strong> - Methods: " . htmlspecialchars($supportedMethods) . "</li>";
            }
        }
    }
    echo "</ul>";
} else {
    echo "<p style='color: orange;'>⚠️ Could not list models (HTTP $listHttpCode)</p>";
}

// Test Gemini API
echo "<h2>3. Testing Gemini API</h2>";

// Try different model names - Use latest available models
$modelsToTry = [
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-pro-latest'
];

$success = false;
foreach ($modelsToTry as $modelName) {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$modelName}:generateContent?key=" . $apiKey;

    $requestData = [
        'contents' => [[
            'role' => 'user',
            'parts' => [['text' => 'Xin chào, bạn có thể giới thiệu về cửa hàng cá cảnh không?']]
        ]],
        'generationConfig' => [
            'temperature' => 0.7,
            'maxOutputTokens' => 200,
        ]
    ];

    echo "<h3>Trying model: <code>$modelName</code></h3>";
    $ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        echo "<p style='color: orange;'>⚠️ cURL Error: " . htmlspecialchars($curlError) . "</p>";
        continue;
    }

    if ($httpCode === 200) {
        $result = json_decode($response, true);
        
        if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            $aiResponse = trim($result['candidates'][0]['content']['parts'][0]['text']);
            echo "<h2 style='color: green;'>✅ SUCCESS với model: <code>$modelName</code>!</h2>";
            echo "<h3>AI Response:</h3>";
            echo "<div style='background: #e8f5e9; padding: 15px; border-radius: 5px; border-left: 4px solid #4caf50;'>";
            echo "<p>" . nl2br(htmlspecialchars($aiResponse)) . "</p>";
            echo "</div>";
            echo "<p><strong>✅ Model này hoạt động! Hãy cập nhật code để dùng model: <code>$modelName</code></strong></p>";
            $success = true;
            break;
        } else {
            echo "<p style='color: orange;'>⚠️ HTTP 200 nhưng response structure không đúng</p>";
            echo "<pre>" . htmlspecialchars(substr($response, 0, 500)) . "...</pre>";
        }
    } else {
        echo "<p style='color: orange;'>⚠️ HTTP Error: $httpCode</p>";
        $errorData = json_decode($response, true);
        if ($errorData && isset($errorData['error']['message'])) {
            echo "<p>" . htmlspecialchars($errorData['error']['message']) . "</p>";
        }
    }
    echo "<hr>";
}

if (!$success) {
    echo "<h2 style='color: red;'>❌ Tất cả models đều không hoạt động!</h2>";
    echo "<p>Vui lòng kiểm tra:</p>";
    echo "<ul>";
    echo "<li>API key có đúng không?</li>";
    echo "<li>API key có được enable Gemini API không?</li>";
    echo "<li>Thử tạo API key mới từ: <a href='https://makersuite.google.com/app/apikey' target='_blank'>https://makersuite.google.com/app/apikey</a></li>";
    echo "</ul>";
}

?>

