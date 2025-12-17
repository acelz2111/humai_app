<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
error_reporting(0); 

require_once 'db.php'; 

if (!isset($_GET['user_id'])) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit();
}

$user_id = (int)$_GET['user_id'];

// Corrected Query for your schema
$sql = "SELECT d.confidence, d.date_diagnosed, ds.name AS disease_name, ds.type AS category, t.description 
        FROM diagnosis d 
        JOIN diseases ds ON d.disease_id = ds.id 
        LEFT JOIN treatment t ON ds.id = t.disease_id
        WHERE d.user_id = ? 
        ORDER BY d.date_diagnosed DESC 
        LIMIT 1";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "SQL Error: " . $conn->error]);
    exit();
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $data = $result->fetch_assoc();
    $data['date_diagnosed'] = date("M j, Y", strtotime($data['date_diagnosed']));
    echo json_encode(["success" => true, "data" => $data]);
} else {
    echo json_encode(["success" => false, "message" => "No history found"]);
}

$stmt->close();
$conn->close();
?>