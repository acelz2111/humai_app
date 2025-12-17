<?php
// C:\xampp\htdocs\HumAI\backend\get_disease.php

// 1. Include your centralized DB connection
// This handles Headers, CORS, and the $conn variable automatically
require_once 'db.php'; 

// 2. Validate Input
if (!isset($_GET['name'])) {
    echo json_encode(["success" => false, "message" => "Disease name required"]);
    exit();
}

$name = $_GET['name'];

// 3. Query: Join diseases and treatment tables
// We search by name (e.g., "Rice Blast") to get the description
$sql = "SELECT t.description, t.prevention 
        FROM diseases d
        JOIN treatment t ON d.id = t.disease_id
        WHERE d.name = ? 
        OR (d.name = 'Leaf Blast' AND ? = 'Rice Blast') 
        OR (d.name = 'Bacterial Leaf Blight' AND ? = 'Bacterial Blight')";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL Error: " . $conn->error]);
    exit();
}

// Bind parameter 3 times to handle the OR conditions for mismatched names
$stmt->bind_param("sss", $name, $name, $name);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $data = $result->fetch_assoc();
    echo json_encode(["success" => true, "data" => $data]);
} else {
    // Fallback: If no DB description, return the name so the app doesn't show blank
    echo json_encode([
        "success" => false, 
        "message" => "Details not found in database.",
        "data" => [
            "description" => "No detailed description available in database for " . $name,
            "prevention" => "Contact local agriculture office."
        ]
    ]);
}

$stmt->close();
$conn->close();
?>