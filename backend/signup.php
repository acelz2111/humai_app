<?php
// backend/signup.php
require_once 'db.php';

$input = file_get_contents("php://input");
$data = json_decode($input);

if (!$data) {
    echo json_encode(["success" => false, "message" => "No data received"]);
    exit();
}

try {
    $first_name = trim($data->first_name);
    $last_name = trim($data->last_name);
    $email = trim($data->email);
    $phone_number = trim($data->phone_number);
    $password = password_hash($data->password, PASSWORD_DEFAULT);

    // 1. Local Validation for the 10-digit Trigger in your DB
    if (!preg_match('/^[0-9]{10}$/', $phone_number)) {
        echo json_encode(["success" => false, "message" => "Phone number must be exactly 10 digits."]);
        exit();
    }

    // 2. Start Transaction
    $conn->begin_transaction();

    $sql = "INSERT INTO user (first_name, last_name, email, phone_number, password, type_id, registered_date) 
            VALUES (?, ?, ?, ?, ?, 2, NOW())";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssss", $first_name, $last_name, $email, $phone_number, $password);
    
    if ($stmt->execute()) {
        // --- CRITICAL: You must commit or the data is lost! ---
        $conn->commit(); 
        echo json_encode(["success" => true, "message" => "Signup successful!"]);
    } else {
        throw new Exception("Execution failed.");
    }

} catch (Exception $e) {
    $conn->rollback(); // Undo if error occurs
    echo json_encode(["success" => false, "message" => "Database Error: " . $e->getMessage()]);
}
?>