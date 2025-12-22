<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

if (!isset($_GET['user_id'])) {
    echo json_encode(["success" => false, "message" => "User ID required"]);
    exit;
}

$user_id = intval($_GET['user_id']);
// Fixed column name to phone_number per your SQL schema
$sql = "SELECT first_name, last_name, email, phone_number FROM user WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode(["success" => true, "data" => $row]);
} else {
    echo json_encode(["success" => false, "message" => "User not found"]);
}
?>