<?php
// backend/db.php

// 1. Error reporting configuration
error_reporting(E_ALL);
ini_set('display_errors', 0); 
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// 2. Mandatory CORS headers for React Native
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// 3. Database connection settings
$servername = "localhost";
$username = "root";
$password = ""; // Standard XAMPP password is EMPTY. Change to "root123" only if you manually set one.
$dbname = "humai_db2"; // Matches your uploaded humai_db.sql

// 4. Attempt connection
try {
    // We remove the '@' to let the try-catch block handle the connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception("Connection Failed: " . $conn->connect_error);
    }
    
    // Set charset to prevent encoding issues with names/notes
    $conn->set_charset("utf8mb4");
    
} catch (Exception $e) {
    // If connection fails, send a JSON response so the app doesn't get a blank response
    http_response_code(500); 
    echo json_encode([
        "success" => false, 
        "message" => "Database connection error. Ensure MySQL is running in XAMPP."
    ]);
    
    // Log the actual error to your php_errors.log for your eyes only
    error_log("DB Connection Error: " . $e->getMessage());
    exit();
}
?>