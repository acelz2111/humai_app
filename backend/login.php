<?php
// backend/login.php
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
    echo json_encode(["success" => false, "message" => "Invalid request data"]);
    exit();
}

// Check required fields
if (!isset($data->email) || !isset($data->password)) {
    echo json_encode(["success" => false, "message" => "Missing email or password"]);
    exit();
}

// Sanitize inputs
$email = trim($data->email);
$password = $data->password;

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit();
}

// Fetch user from database
$sql = "SELECT id, name, email, password, role, created_at FROM users WHERE email=?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Database error occurred"]);
    error_log("Login prepare failed: " . $conn->error);
    exit();
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    // Verify password using password_verify()
    if (password_verify($password, $user['password'])) {
        // Remove password from response (SECURITY)
        unset($user['password']);
        
        echo json_encode([
            "success" => true, 
            "message" => "Login successful! Welcome back.",
            "user" => $user
        ]);
    } else {
        // Invalid password
        echo json_encode(["success" => false, "message" => "Invalid email or password"]);
    }
} else {
    // User not found
    echo json_encode(["success" => false, "message" => "Invalid email or password"]);
}

$stmt->close();
$conn->close();
?>