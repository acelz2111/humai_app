<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; 

if (!isset($_GET['user_id'])) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit();
}

$user_id = (int)$_GET['user_id'];

// Query to get top 5 most frequent diseases for this user
$sql = "SELECT ds.name, COUNT(d.id) as occurrences, ds.type as category
        FROM diagnosis d
        JOIN diseases ds ON d.disease_id = ds.id
        WHERE d.user_id = ?
        GROUP BY d.disease_id
        ORDER BY occurrences DESC
        LIMIT 5";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$top_diseases = [];
while ($row = $result->fetch_assoc()) {
    $top_diseases[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $top_diseases
]);

$stmt->close();
$conn->close();
?>