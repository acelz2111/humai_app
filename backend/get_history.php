<?php
header("Content-Type: application/json");
include "db.php";

$user_id = $_GET['user_id'];

$sql = "SELECT * FROM history WHERE user_id=?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$history = [];
while ($row = $result->fetch_assoc()) {
    $history[] = $row;
}

echo json_encode(["success" => true, "history" => $history]);
?>
