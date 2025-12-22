<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"));

if (!$data || !isset($data->user_id) || empty($data->comments)) {
    echo json_encode(["success" => false, "message" => "Feedback content cannot be empty."]);
    exit;
}

$user_id = intval($data->user_id);
$comments = trim($data->comments);

try {
    // Matches your humai_db.sql schema: table `feedback` (user_id, comments)
    $sql = "INSERT INTO feedback (user_id, comments, created_at) VALUES (?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $user_id, $comments);

    if ($stmt->execute()) {
        // Also log this action (Action ID 7 is 'Submit Feedback' in your SQL)
        $logSql = "INSERT INTO logs (user_id, action_id, detail) VALUES (?, 7, 'User submitted feedback')";
        $logStmt = $conn->prepare($logSql);
        $logStmt->bind_param("i", $user_id);
        $logStmt->execute();

        echo json_encode(["success" => true, "message" => "Thank you for your feedback!"]);
    } else {
        throw new Exception("Execute failed: " . $conn->error);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}
?>