<?php
/**
 * AI Chatbot Integration
 * Uses Google Gemini API (FREE tier) for AI responses
 * 
 * Setup:
 * 1. Get API key from: https://makersuite.google.com/app/apikey
 * 2. Add GEMINI_API_KEY to config.php
 */

require_once __DIR__ . '/../config.php';

/**
 * Call Google Gemini API to generate AI response
 * 
 * @param string $userMessage The user's message
 * @param array $conversationHistory Previous messages in the conversation
 * @return string AI-generated response
 */
function callAIChatbot($userMessage, $conversationHistory = []) {
    // Get API key from config (fallback to environment variable)
    $apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : (getenv('GEMINI_API_KEY') ?: '');
    
    if (empty($apiKey)) {
        error_log("GEMINI_API_KEY not configured");
        return "Xin lỗi, dịch vụ AI tạm thời không khả dụng. Vui lòng liên hệ admin để được hỗ trợ.";
    }
    
    // System prompt - Context about the store
    $systemPrompt = "Bạn là trợ lý AI chuyên nghiệp và thân thiện của cửa hàng cá cảnh Charan Aquarium. 
Bạn giúp khách hàng tư vấn chi tiết về:
- Các loại cá cảnh (Freshwater, Marine, Exotic)
- Phụ kiện hồ cá (Tanks, Accessories)
- Thức ăn cho cá (Food)
- Cách chăm sóc cá cảnh

Hãy trả lời NGẮN GỌN, SÚC TÍCH, và HỮU ÍCH bằng tiếng Việt. Trả lời từ 50-100 từ, tập trung vào thông tin quan trọng nhất. Tránh lặp lại, không dài dòng.
- Nếu khách hỏi về loại cá: Mô tả ngắn gọn đặc điểm nổi bật, cách nuôi cơ bản, thức ăn, lưu ý quan trọng.
- Nếu khách hỏi về phụ kiện: Giải thích ngắn gọn công dụng chính, cách sử dụng, lợi ích.
- Nếu khách hỏi về chăm sóc: Hướng dẫn ngắn gọn các bước cơ bản, lưu ý quan trọng.
- Luôn trả lời trực tiếp câu hỏi, không lan man. Nếu cần thông tin chi tiết hơn, đề xuất khách xem Shop hoặc liên hệ admin.

Nếu khách hàng hỏi về sản phẩm cụ thể, hãy đề xuất họ xem trong Shop hoặc liên hệ admin để được tư vấn chi tiết hơn về giá và đặt hàng.

QUAN TRỌNG: Nếu khách hàng không hài lòng, có vấn đề phức tạp, hoặc yêu cầu được nói chuyện với admin thực sự, hãy đề xuất họ gõ 'admin' hoặc 'người thật' để được chuyển sang admin thực sự. Luôn lịch sự và hữu ích.";

    // Prepare messages for Gemini API
    $messages = [];
    
    // Add system context as first user message (Gemini doesn't have system role)
    $messages[] = [
        'role' => 'user',
        'parts' => [['text' => $systemPrompt]]
    ];
    $messages[] = [
        'role' => 'model',
        'parts' => [['text' => 'Tôi hiểu. Tôi sẽ giúp khách hàng với thông tin về cá cảnh và sản phẩm của Charan Aquarium.']]
    ];
    
    // Add conversation history (last 5 messages to keep context manageable)
    $recentHistory = array_slice($conversationHistory, -5);
    foreach ($recentHistory as $msg) {
        $role = ($msg['senderRole'] === 'customer' || $msg['senderId'] != '0') ? 'user' : 'model';
        $messages[] = [
            'role' => $role,
            'parts' => [['text' => $msg['message']]]
        ];
    }
    
    // Add current user message
    $messages[] = [
        'role' => 'user',
        'parts' => [['text' => $userMessage]]
    ];
    
    // Call Gemini API - Use only 1-2 models to SAVE API QUOTA
    // IMPORTANT: Each model try = 1 API request!
    
    // Check if we have a cached working model (to avoid trying multiple models)
    $cacheFile = sys_get_temp_dir() . '/gemini_working_model.txt';
    $cachedModel = null;
    if (file_exists($cacheFile)) {
        $cachedModel = trim(file_get_contents($cacheFile));
    }
    
    // If we have a cached working model, ONLY use that (1 request only!)
    if (!empty($cachedModel)) {
        $modelsToTry = [$cachedModel];
    } else {
        // First time, try 2 models only (not 5!)
        $modelsToTry = [
            'v1beta/models/gemini-2.5-flash',      // Latest fast model (try this first)
            'v1beta/models/gemini-flash-latest'   // Fallback only if first fails
        ];
    }
    
    $lastError = null;
    $workingModel = null;
    foreach ($modelsToTry as $modelPath) {
        $url = "https://generativelanguage.googleapis.com/{$modelPath}:generateContent?key=" . $apiKey;
        
        $requestData = [
            'contents' => $messages,
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                'maxOutputTokens' => 1000, // Short, concise responses (200-300 words)
            ]
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10); // 10 second timeout
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($curlError) {
            $lastError = "cURL Error ($modelPath): " . $curlError;
            error_log("Gemini API - " . $lastError);
            continue; // Try next model
        }
        
        if ($httpCode === 200) {
            $result = json_decode($response, true);
            
            // Extract response text
            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                $aiResponse = trim($result['candidates'][0]['content']['parts'][0]['text']);
                
                // Check if response was cut off due to token limit (should be rare with 1000 tokens and short response requirement)
                $finishReason = $result['candidates'][0]['finishReason'] ?? 'UNKNOWN';
                if ($finishReason === 'MAX_TOKENS') {
                    error_log("Gemini API: Response truncated due to MAX_TOKENS limit");
                }
                
                // Clean up response (remove any unwanted prefixes)
                $aiResponse = preg_replace('/^(AI Assistant|Trợ lý AI):\s*/i', '', $aiResponse);
                
                // Log successful model and cache it
                error_log("Gemini API Success with model: $modelPath");
                $workingModel = $modelPath;
                
                // Cache working model to avoid trying others next time
                if ($workingModel) {
                    file_put_contents($cacheFile, $workingModel);
                }
                
                return $aiResponse;
            } else {
                $lastError = "Unexpected response structure ($modelPath)";
                error_log("Gemini API - " . $lastError);
                continue; // Try next model
            }
        } else {
            $errorData = json_decode($response, true);
            $lastError = "HTTP $httpCode ($modelPath)";
            if ($errorData && isset($errorData['error']['message'])) {
                $lastError .= ": " . $errorData['error']['message'];
            }
            error_log("Gemini API - " . $lastError);
            continue; // Try next model
        }
    }
    
    // All models failed
    error_log("Gemini API: All models failed. Last error: " . $lastError);
    return "Xin lỗi, dịch vụ AI tạm thời không khả dụng. Vui lòng liên hệ admin để được hỗ trợ.";
}

/**
 * Get conversation history for context
 * 
 * @param PDO $pdo Database connection
 * @param int $conversationId Conversation ID
 * @return array Array of messages with senderRole and message
 */
function getConversationHistory(PDO $pdo, $conversationId) {
    $stmt = $pdo->prepare("
        SELECT sender_id, sender_role, sender_name, message
        FROM chat_messages
        WHERE conversation_id = ?
        ORDER BY created_at DESC
        LIMIT 10
    ");
    $stmt->execute([$conversationId]);
    $messages = $stmt->fetchAll();
    
    // Reverse to get chronological order
    return array_reverse($messages);
}

/**
 * Check if message should be handled by AI
 * User can request real admin by using specific keywords
 * Once user requests admin, ALL subsequent messages should go to admin (not AI)
 * 
 * @param string $message User message
 * @param string $senderRole Sender role (admin/customer)
 * @param PDO|null $pdo Database connection (optional, for checking conversation history)
 * @param int|null $conversationId Conversation ID (optional, for checking history)
 * @return bool True if should use AI
 */
function shouldUseAI($message, $senderRole, $pdo = null, $conversationId = null) {
    // Only use AI for customer messages
    if ($senderRole !== 'customer') {
        return false;
    }
    
    // Check if API key is configured
    $apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : (getenv('GEMINI_API_KEY') ?: '');
    if (empty($apiKey)) {
        return false;
    }
    
    // Keywords that indicate user wants to talk to real admin
    $adminRequestKeywords = [
        'admin', 'quản lý', 'manager', 'người thật', 'human', 'real person',
        'real admin', 'admin thật', 'nói chuyện với admin', 'liên hệ admin',
        'gặp admin', 'admin giúp', 'cần admin', 'muốn admin', 'yêu cầu admin',
        'chuyển admin', 'chuyển sang admin', 'không hài lòng', 'không thỏa mãn',
        'phàn nàn', 'khiếu nại', 'complaint', 'dissatisfied', 'unsatisfied'
    ];
    
    // Keywords that indicate user wants to go back to AI (override admin request)
    $aiRequestKeywords = [
        'ai', 'bot', 'tư vấn tự động', 'tư vấn ai', 'quay lại ai', 'dùng ai',
        'ai giúp', 'bot giúp', 'tự động', 'auto', 'chatbot', 'trợ lý ai',
        'ai tư vấn', 'bot tư vấn', 'tư vấn bot', 'quay lại bot'
    ];
    
    // Check if current message contains AI request keywords (override admin request)
    $messageLower = mb_strtolower($message, 'UTF-8');
    foreach ($aiRequestKeywords as $keyword) {
        if (stripos($messageLower, $keyword) !== false) {
            // User wants to go back to AI, use AI for this message
            // This overrides any previous admin request
            return true;
        }
    }
    
    // Check if current message contains admin request keywords
    foreach ($adminRequestKeywords as $keyword) {
        if (stripos($messageLower, $keyword) !== false) {
            // User wants real admin in this message, don't use AI
            return false;
        }
    }
    
    // IMPORTANT: Check conversation history to see if user has requested admin before
    // If user previously requested admin, ALL subsequent messages should go to admin (not AI)
    // UNLESS user explicitly requests AI again
    if ($pdo && $conversationId) {
        try {
            // Check last 20 messages in conversation
            $stmt = $pdo->prepare("
                SELECT message, created_at
                FROM chat_messages 
                WHERE conversation_id = ? 
                AND sender_role = 'customer'
                AND is_ai_response = 0
                ORDER BY created_at DESC 
                LIMIT 20
            ");
            $stmt->execute([$conversationId]);
            $previousMessages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Check for most recent AI request (to override admin request)
            $mostRecentAIRequest = null;
            $mostRecentAdminRequest = null;
            
            foreach ($previousMessages as $prevMsg) {
                $prevMsgLower = mb_strtolower($prevMsg['message'], 'UTF-8');
                
                // Check for AI request keywords
                foreach ($aiRequestKeywords as $keyword) {
                    if (stripos($prevMsgLower, $keyword) !== false) {
                        if (!$mostRecentAIRequest || $prevMsg['created_at'] > $mostRecentAIRequest) {
                            $mostRecentAIRequest = $prevMsg['created_at'];
                        }
                        break;
                    }
                }
                
                // Check for admin request keywords
                foreach ($adminRequestKeywords as $keyword) {
                    if (stripos($prevMsgLower, $keyword) !== false) {
                        if (!$mostRecentAdminRequest || $prevMsg['created_at'] > $mostRecentAdminRequest) {
                            $mostRecentAdminRequest = $prevMsg['created_at'];
                        }
                        break;
                    }
                }
            }
            
            // If user has requested AI more recently than admin request, use AI
            if ($mostRecentAIRequest && $mostRecentAdminRequest) {
                if ($mostRecentAIRequest > $mostRecentAdminRequest) {
                    // User requested AI after admin request, use AI
                    return true;
                }
            }
            
            // If user has requested admin before (and no recent AI request), don't use AI
            if ($mostRecentAdminRequest) {
                error_log("AI disabled: User previously requested admin in conversation $conversationId");
                return false;
            }
        } catch (Exception $e) {
            error_log("Error checking conversation history for admin request: " . $e->getMessage());
            // Continue with normal check if history check fails
        }
    }
    
    return true;
}

