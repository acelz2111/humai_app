<?php
// C:\xampp\htdocs\HumAI\backend\login.php

// 1. SUPPRESS HTML ERRORS (Stops the "JSON Error: <" issue)
error_reporting(E_ALL);
ini_set('display_errors', 0); 

// 2. SET HEADERS (Allows app access)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 3. DATABASE CONNECTION (Self-Contained - Eliminates file path errors)
$servername = "localhost";
$username = "root";
// 🚨 CHECK THIS: Use "" if XAMPP default, or your actual MySQL root password.
$password = "root123";          
$dbname = "humai_db";    

$conn = new mysqli($servername, $username, $password, $dbname);

// 4. CHECK CONNECTION AND EXIT WITH JSON ERROR
if ($conn->connect_error) {
    // This sends a clear JSON error to the app instead of crashing
    echo json_encode(["success" => false, "message" => "DB Connection Failed: Check password or XAMPP."]);
    exit();
}

// 5. GET INPUT (Login Logic)
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->email) || !isset($data->password)) {
    echo json_encode(["success" => false, "message" => "Missing email or password"]);
    exit();
}
$email = $data->email;
$password = $data->password;

$stmt = $conn->prepare("SELECT * FROM users WHERE email=? AND password=?");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL Prepare Failed: " . $conn->error]);
    exit();
}
$stmt->bind_param("ss", $email, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    unset($user['password']); 
    echo json_encode(["success" => true, "user" => $user]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid credentials"]);
}

$stmt->close();
$conn->close();
?>