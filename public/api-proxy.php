<?php
/**
 * API Proxy for Web Closet
 * This script proxies requests to the backend API to avoid CORS issues
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the query parameter
$query = isset($_GET['query']) ? $_GET['query'] : '';

if (empty($query)) {
    http_response_code(400);
    echo json_encode(['error' => 'Query parameter is required']);
    exit();
}

// Backend API URL
$apiUrl = 'https://api-production-d9dd.up.railway.app/nlp/search/?query=' . urlencode($query);

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'User-Agent: Web-Closet-Proxy/1.0'
]);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

// Handle errors
if ($error) {
    http_response_code(500);
    echo json_encode(['error' => 'Proxy error: ' . $error]);
    exit();
}

// Set HTTP status code
http_response_code($httpCode);

// Return the response
echo $response;
?>
