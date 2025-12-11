<?php
header("Content-Type: application/json");
include "db.php";

$data = json_decode(file_get_contents("php://input"));

$user_id = $data->user_id;
$message = $data->message;

$sql = "INSERT INTO feedback (user_id, message) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $user_id, $message);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Feedback submitted"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}
?>
