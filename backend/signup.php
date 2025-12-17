<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

require 'db.php';

$input = file_get_contents("php://input");
$data = json_decode($input);

if (!$data || !isset($data->name) || !isset($data->email) || !isset($data->password)) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit();
}

// Split name for your first_name/last_name columns
$parts = explode(" ", trim($data->name), 2);
$first_name = $parts[0];
$last_name = isset($parts[1]) ? $parts[1] : '';
$email = trim($data->email);
$password = password_hash($data->password, PASSWORD_DEFAULT);

// INSERT using your actual column names: first_name, last_name, type_id, registered_date
$sql = "INSERT INTO user (first_name, last_name, email, password, type_id, registered_date) VALUES (?, ?, ?, ?, 2, NOW())";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL Error: " . $conn->error]);
    exit();
}

$stmt->bind_param("ssss", $first_name, $last_name, $email, $password);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Signup successful!"]);
} else {
    echo json_encode(["success" => false, "message" => "Registration failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>