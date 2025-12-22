<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

$input = file_get_contents("php://input");
$data = json_decode($input);

if (!$data || empty($data->email) || empty($data->password)) {
    echo json_encode(["success" => false, "message" => "Email and password required."]);
    exit;
}

$email = trim($data->email);
$password = $data->password;

try {
    $sql = "SELECT id, password FROM user WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        $db_password = $user['password'];

        // 1. Check if it's a modern hash
        if (password_verify($password, $db_password)) {
            $login_success = true;
        } 
        // 2. Fallback: Check if it's one of the old plain-text passwords
        else if ($password === $db_password) {
            $login_success = true;
        } 
        else {
            $login_success = false;
        }

        if ($login_success) {
            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "user" => ["id" => $user['id']]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Incorrect password."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "User not found."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Server error."]);
}
$conn->close();
?>