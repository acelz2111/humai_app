<?php
// File: backend/get_history.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php'; 

// REPLACE THIS WITH YOUR COMPUTER'S IP ADDRESS
$base_url = "http://192.168.101.8/HumAI/backend/";

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if ($user_id > 0) {
    // ✅ Added GROUP BY d.id to prevent duplicates
    $sql = "SELECT d.id, d.confidence, d.date_diagnosed, d.location,
                   ds.name AS disease_name, 
                   t.description, t.treatment, t.prevention
            FROM diagnosis d 
            JOIN diseases ds ON d.disease_id = ds.id 
            LEFT JOIN treatment t ON ds.id = t.disease_id
            WHERE d.user_id = ? 
            GROUP BY d.id 
            ORDER BY d.date_diagnosed DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $history = [];
    while ($row = $result->fetch_assoc()) {
        // ✅ CRITICAL FIX: Do NOT format the date here. 
        // Send the raw MySQL timestamp (YYYY-MM-DD HH:MM:SS) to the frontend.
        // The frontend 'formatDateTime' function will handle the display.
        $row['raw_date'] = $row['date_diagnosed']; 
        
        $row['image_url'] = $base_url . "get_image.php?id=" . $row['id'];
        
        if (empty($row['location'])) {
            $row['location'] = "Unknown Location";
        }

        $history[] = $row;
    }

    echo json_encode(["success" => true, "data" => $history]);
} else {
    echo json_encode(["success" => false, "message" => "Invalid User ID"]);
}
$conn->close();
?>