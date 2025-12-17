<?php
// C:\xampp\htdocs\HumAI\backend\get_diagnosis_count.php

// Includes db.php, which handles headers and database connection ($conn)
require_once 'db.php'; 

// Check if user ID is provided (required to count specific user diagnoses)
if (!isset($_GET['user_id'])) {
    echo json_encode(["success" => false, "message" => "User ID is required for personalized count."]);
    exit();
}

$user_id = (int)$_GET['user_id'];

// Query: Count the number of rows in the diagnosis table for the user
$sql = "SELECT COUNT(*) AS total_diagnoses FROM diagnosis WHERE user_id = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL Prepare Error: " . $conn->error]);
    exit();
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

// Since COUNT(*) always returns one row, we fetch it directly
$data = $result->fetch_assoc();
    
// Return the count, ensuring it's treated as an integer
echo json_encode([
    "success" => true, 
    "count" => (int)$data['total_diagnoses']
]);

$stmt->close();
$conn->close();
?>