<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db.php'; 

if (!isset($_GET['user_id'])) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit();
}

$user_id = (int)$_GET['user_id'];

// ✅ We select d.id to allow the app to fetch the specific captured image
$sql = "SELECT d.id, d.confidence, d.date_diagnosed, ds.name AS disease_name, 
               ds.type AS category, t.description, t.treatment, t.prevention
        FROM diagnosis d 
        JOIN diseases ds ON d.disease_id = ds.id 
        LEFT JOIN treatment t ON ds.id = t.disease_id
        WHERE d.user_id = ? 
        ORDER BY d.date_diagnosed DESC 
        LIMIT 1";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(["success" => true, "data" => $row]);
} else {
    echo json_encode(["success" => false, "message" => "No diagnosis found"]);
}

$stmt->close();
$conn->close();
?>