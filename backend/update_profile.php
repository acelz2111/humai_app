<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->user_id)) {
    echo json_encode(["success" => false, "message" => "Invalid data"]);
    exit;
}

$user_id = intval($data->user_id);
$first_name = trim($data->first_name);
$last_name = trim($data->last_name);
$email = trim($data->email);
$phone = trim($data->phone);

try {
    if (!empty($data->password)) {
        // Update with password change
        $hashed_pass = password_hash($data->password, PASSWORD_DEFAULT);
        $sql = "UPDATE user SET first_name=?, last_name=?, email=?, phone_number=?, password=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssi", $first_name, $last_name, $email, $phone, $hashed_pass, $user_id);
    } else {
        // Update without password change
        $sql = "UPDATE user SET first_name=?, last_name=?, email=?, phone_number=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssssi", $first_name, $last_name, $email, $phone, $user_id);
    }

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Profile updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}
?>