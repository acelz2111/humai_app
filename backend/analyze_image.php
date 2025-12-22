<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once 'db.php'; 

// Increase limits for large base64 strings
ini_set('upload_max_filesize', '20M');
ini_set('post_max_size', '20M');

$data = json_decode(file_get_contents("php://input"));

if (isset($data->image) && isset($data->user_id)) {
    $user_id = $data->user_id;
    $location = isset($data->location) ? $data->location : 'Unknown';
    
    // Clean and decode base64
    $base64_string = preg_replace('#^data:image/\w+;base64,#i', '', $data->image);
    $image_data = base64_decode($base64_string);

    // Simulated Diagnosis (Replace with model logic)
    $disease_id = 1; 
    $confidence = 98.5;
    $notes = "Mobile Capture";

    $stmt = $conn->prepare("INSERT INTO diagnosis (user_id, disease_id, confidence, notes, location, captured_image, date_diagnosed) VALUES (?, ?, ?, ?, ?, ?, NOW())");
    
    $null = NULL; 
    $stmt->bind_param("iidssb", $user_id, $disease_id, $confidence, $notes, $location, $null);
    $stmt->send_long_data(5, $image_data);

    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "data" => [
                "disease" => "Rice Blast",
                "confidence" => $confidence . "%",
                "treatment" => "Apply recommended fungicides...",
                "prevention" => "Use disease-resistant seeds."
            ]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Incomplete data"]);
}
$conn->close();
?>