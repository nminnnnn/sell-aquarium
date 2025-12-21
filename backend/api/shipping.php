<?php
/**
 * Shipping Cost Calculator API
 * Calculates shipping cost based on distance using Google Distance Matrix API
 */

require_once __DIR__ . '/../config.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Admin store address
define('STORE_ADDRESS', '470 Trần Đại Nghĩa, Hoà Hải, Ngũ Hành Sơn, Đà Nẵng 550000, Việt Nam');
// Store coordinates for distance calculation (Đà Nẵng, Ngũ Hành Sơn)
define('STORE_LAT', 16.0544);
define('STORE_LNG', 108.2474);

// Google Maps API key - check if already defined in config.php
if (!defined('GOOGLE_MAPS_API_KEY')) {
    define('GOOGLE_MAPS_API_KEY', getenv('GOOGLE_MAPS_API_KEY') ?: '');
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'POST') {
        $data = getRequestData();
        $deliveryAddress = trim($data['address'] ?? '');
        
        if (empty($deliveryAddress)) {
            sendJSON(['success' => false, 'message' => 'Địa chỉ giao hàng là bắt buộc'], 400);
        }
        
        // Try to calculate distance using available methods
        $distance = null;
        $duration = null;
        
        // Method 1: Try Google Maps API (if available)
        if (!empty(GOOGLE_MAPS_API_KEY)) {
            $result = calculateDistanceWithGoogle($deliveryAddress);
            if ($result['success']) {
                $distance = $result['distance'];
                $duration = $result['duration'];
            }
        }
        
        // Method 2: If Google failed or not available, use OpenStreetMap (FREE, no API key needed)
        if ($distance === null) {
            $result = calculateDistanceWithOpenStreetMap($deliveryAddress);
            if ($result['success']) {
                $distance = $result['distance'];
                $duration = $result['duration'];
            }
        }
        
        // Calculate shipping cost based on distance
        if ($distance !== null) {
            $shippingCost = calculateShippingCost($distance);
            $calculationMethod = 'distance_based';
            error_log("Shipping calculated: distance={$distance}km, cost={$shippingCost}VND, address={$deliveryAddress}");
        } else {
            // Last resort: Fallback calculation based on address keywords
            $shippingCost = calculateShippingFallback($deliveryAddress);
            $calculationMethod = 'fallback';
            error_log("Shipping fallback used: cost={$shippingCost}VND, address={$deliveryAddress}");
        }
        
        sendJSON([
            'success' => true,
            'shippingCost' => $shippingCost,
            'distance' => $distance,
            'duration' => $duration,
            'storeAddress' => STORE_ADDRESS,
            'deliveryAddress' => $deliveryAddress,
            'calculationMethod' => $calculationMethod
        ]);
    } else {
        sendJSON(['success' => false, 'message' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Shipping API Error: " . $e->getMessage());
    sendJSON(['success' => false, 'message' => 'Server error occurred'], 500);
}

/**
 * Calculate distance using Google Distance Matrix API
 */
function calculateDistanceWithGoogle($destination) {
    if (empty(GOOGLE_MAPS_API_KEY)) {
        return ['success' => false];
    }
    
    $origin = urlencode(STORE_ADDRESS);
    $dest = urlencode($destination);
    
    $url = "https://maps.googleapis.com/maps/api/distancematrix/json?" .
           "origins={$origin}&" .
           "destinations={$dest}&" .
           "language=vi&" .
           "units=metric&" .
           "key=" . GOOGLE_MAPS_API_KEY;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200 || !$response) {
        error_log("Google Distance Matrix API error: HTTP $httpCode");
        return ['success' => false];
    }
    
    $data = json_decode($response, true);
    
    if ($data['status'] !== 'OK' || empty($data['rows'][0]['elements'][0])) {
        error_log("Google Distance Matrix API error: " . ($data['status'] ?? 'Unknown'));
        return ['success' => false];
    }
    
    $element = $data['rows'][0]['elements'][0];
    
    if ($element['status'] !== 'OK') {
        error_log("Google Distance Matrix element error: " . $element['status']);
        return ['success' => false];
    }
    
    // Distance in meters, convert to km
    $distanceMeters = $element['distance']['value'];
    $distanceKm = round($distanceMeters / 1000, 2);
    
    // Duration in seconds, convert to minutes
    $durationSeconds = $element['duration']['value'];
    $durationMinutes = round($durationSeconds / 60);
    
    return [
        'success' => true,
        'distance' => $distanceKm,
        'duration' => $durationMinutes
    ];
}

/**
 * Calculate distance using OpenStreetMap Nominatim API (FREE, no API key needed)
 * Uses geocoding to get coordinates, then calculates distance using Haversine formula
 */
function calculateDistanceWithOpenStreetMap($destination) {
    // Store coordinates (from config)
    $storeLat = STORE_LAT;
    $storeLng = STORE_LNG;
    
    try {
        // Geocode destination address
        $destEncoded = urlencode($destination);
        $url = "https://nominatim.openstreetmap.org/search?q={$destEncoded}&format=json&limit=1&countrycodes=vn";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Charan Aquarium Shipping Calculator'); // Required by Nominatim
        curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Increased timeout
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json'
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        if ($httpCode !== 200 || !$response) {
            error_log("OpenStreetMap API HTTP error: $httpCode, CURL error: $curlError");
            return ['success' => false];
        }
        
        $results = json_decode($response, true);
        
        if (empty($results) || !is_array($results) || !isset($results[0])) {
            error_log("OpenStreetMap API: No results found for address: $destination");
            return ['success' => false];
        }
        
        if (!isset($results[0]['lat']) || !isset($results[0]['lon'])) {
            error_log("OpenStreetMap API: Missing coordinates in result");
            return ['success' => false];
        }
        
        $destLat = floatval($results[0]['lat']);
        $destLng = floatval($results[0]['lon']);
        
        // Calculate distance using Haversine formula
        $distance = calculateHaversineDistance($storeLat, $storeLng, $destLat, $destLng);
        
        // Estimate duration (assuming average speed of 30 km/h in city)
        $duration = round(($distance / 30) * 60); // minutes
        
        return [
            'success' => true,
            'distance' => round($distance, 2),
            'duration' => $duration
        ];
    } catch (Exception $e) {
        error_log("OpenStreetMap API exception: " . $e->getMessage());
        return ['success' => false];
    }
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
function calculateHaversineDistance($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371; // Earth's radius in kilometers
    
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    
    $a = sin($dLat / 2) * sin($dLat / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon / 2) * sin($dLon / 2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    $distance = $earthRadius * $c;
    
    return $distance;
}

/**
 * Fallback shipping cost calculation when all APIs fail
 * Estimates based on address keywords (Đà Nẵng area)
 */
function calculateShippingFallback($address) {
    $addressLower = mb_strtolower($address, 'UTF-8');
    
    // Check if address is in Đà Nẵng
    $isInDaNang = (
        strpos($addressLower, 'đà nẵng') !== false ||
        strpos($addressLower, 'da nang') !== false ||
        strpos($addressLower, 'danang') !== false ||
        strpos($addressLower, 'ngũ hành sơn') !== false ||
        strpos($addressLower, 'hoà hải') !== false ||
        strpos($addressLower, 'thanh khê') !== false ||
        strpos($addressLower, 'hải châu') !== false ||
        strpos($addressLower, 'liên chiểu') !== false ||
        strpos($addressLower, 'sơn trà') !== false ||
        strpos($addressLower, 'cẩm lệ') !== false
    );
    
    if ($isInDaNang) {
        // Within Đà Nẵng: 20,000 - 50,000 VND
        return rand(20000, 50000);
    } else {
        // Outside Đà Nẵng: 50,000 - 150,000 VND
        return rand(50000, 150000);
    }
}

/**
 * Calculate shipping cost based on distance (in km)
 * Pricing structure:
 * - 0-5 km: 20,000 VND
 * - 5-10 km: 30,000 VND
 * - 10-20 km: 50,000 VND
 * - 20-30 km: 80,000 VND
 * - 30+ km: 100,000 VND + 5,000/km for each km above 30
 */
function calculateShippingCost($distanceKm) {
    if ($distanceKm === null) {
        return calculateShippingFallback('');
    }
    
    if ($distanceKm <= 5) {
        return 20000;
    } elseif ($distanceKm <= 10) {
        return 30000;
    } elseif ($distanceKm <= 20) {
        return 50000;
    } elseif ($distanceKm <= 30) {
        return 80000;
    } else {
        $extraKm = ceil($distanceKm - 30);
        return 100000 + ($extraKm * 5000);
    }
}

?>

