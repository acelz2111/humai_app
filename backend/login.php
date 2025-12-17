<?php
// C:\xampp\htdocs\HumAI\backend\login.php

// 1. SET HEADERS
ob_clean();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 2. ENABLE ERROR DISPLAY (Temporarily, so we can see the crash in the App Log)
error_reporting(E_ALL);
ini_set('display_errors', 1); 

// 3. DB CONNECTION
$servername = "localhost";
$username = "root";
$password = "root123"; // You confirmed this works
$dbname = "humai_db";    

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB Connection Failed: " . $conn->connect_error]);
    exit();
}

// 4. GET INPUT
$data = json_decode(file_get_contents("php://input"));
if ($data === null) {
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit();
}

$email = $data->email;
$pass  = $data->password;

// 5. QUERY DEBUGGING (The Critical Fix)
$sql = "SELECT * FROM user WHERE email=? AND password=?";
$stmt = $conn->prepare($sql);

// CHECK IF PREPARE FAILED (This catches the "Table not found" crash)
if (!$stmt) {
    echo json_encode([
        "success" => false, 
        "message" => "SQL Error: " . $conn->error 
    ]);
    exit();
}

$stmt->bind_param("ss", $email, $pass);
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