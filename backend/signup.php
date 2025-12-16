<?php
// backend/signup.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle pre-flight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if db.php exists
if (!file_exists('db.php')) {
    echo json_encode(["success" => false, "message" => "Server Error: Database configuration not found"]);
    exit();
}

require 'db.php';

// Verify database connection
if (!isset($conn) || $conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection not established"]);
    exit();
}

// Get and decode input
$input = file_get_contents("php://input");
$data = json_decode($input);

// Validate JSON input
if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit();
}

// Check required fields
if (!isset($data->name) || !isset($data->email) || !isset($data->password)) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit();
}

// Sanitize inputs
$name = trim($data->name);
$email = trim($data->email);
$password = $data->password;

// Validate name
if (empty($name) || strlen($name) < 2) {
    echo json_encode(["success" => false, "message" => "Name must be at least 2 characters"]);
    exit();
}

if (strlen($name) > 100) {
    echo json_encode(["success" => false, "message" => "Name is too long (max 100 characters)"]);
    exit();
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit();
}

if (strlen($email) > 255) {
    echo json_encode(["success" => false, "message" => "Email is too long"]);
    exit();
}

// Validate password strength
if (strlen($password) < 8) {
    echo json_encode(["success" => false, "message" => "Password must be at least 8 characters"]);
    exit();
}

if (strlen($password) > 128) {
    echo json_encode(["success" => false, "message" => "Password is too long (max 128 characters)"]);
    exit();
}

// Optional: Enhanced password validation (uncomment if you want stricter rules)
/*
if (!preg_match('/[A-Z]/', $password)) {
    echo json_encode(["success" => false, "message" => "Password must contain at least one uppercase letter"]);
    exit();
}

if (!preg_match('/[a-z]/', $password)) {
    echo json_encode(["success" => false, "message" => "Password must contain at least one lowercase letter"]);
    exit();
}

if (!preg_match('/[0-9]/', $password)) {
    echo json_encode(["success" => false, "message" => "Password must contain at least one number"]);
    exit();
}
*/

// Check if email already exists
$checkSql = "SELECT id FROM users WHERE email=?";
$checkStmt = $conn->prepare($checkSql);

if (!$checkStmt) {
    echo json_encode(["success" => false, "message" => "Database error occurred"]);
    error_log("Prepare failed: " . $conn->error);
    exit();
}

$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email already registered"]);
    $checkStmt->close();
    $conn->close();
    exit();
}
$checkStmt->close();

// Hash password securely
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert new user
$sql = "INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, 'student', NOW())";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Database error occurred"]);
    error_log("Insert prepare failed: " . $conn->error);
    exit();
}

$stmt->bind_param("sss", $name, $email, $hashedPassword);

if ($stmt->execute()) {
    $userId = $conn->insert_id;
    
    echo json_encode([
        "success" => true, 
        "message" => "Signup successful! Welcome to HumAI.",
        "user" => [
            "id" => $userId,
            "name" => $name,
            "email" => $email,
            "role" => "student"
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Registration failed. Please try again."]);
    error_log("Insert execution failed: " . $stmt->error);
}

$stmt->close();
$conn->close();
?>