<?php
// backend/db.php

// Error reporting configuration
error_reporting(E_ALL);
ini_set('display_errors', 0); // Set to 0 in production
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Database connection settings
$servername = "localhost";
$username = "root";
$password = "root123"; // Try empty first, change to "root123" if needed
$dbname = "humai_db";

// Attempt connection
try {
    $conn = @new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception("Connection Failed: " . $conn->connect_error);
    }
    
    // Set charset to prevent encoding issues
    $conn->set_charset("utf8mb4");
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Database connection error. Please try again later."
    ]);
    error_log("DB Connection Error: " . $e->getMessage());
    exit();
}
?>