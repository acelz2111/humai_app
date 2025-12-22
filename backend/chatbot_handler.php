<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);
$userMsg = strtolower($data['message']);

// Default response if no match found
$reply = "I'm not sure about that. Try asking about Rice Blast, Sheath Blight, or how to prevent specific diseases.";

// Fetch all diseases and treatments from your tables
$query = "SELECT ds.name, ds.cause, t.treatment, t.prevention, t.description 
          FROM diseases ds 
          JOIN treatment t ON ds.id = t.disease_id";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $name = strtolower($row['name']);
        
        // Check if the user mentioned the disease name
        if (strpos($userMsg, $name) !== false) {
            if (strpos($userMsg, 'prevent') !== false || strpos($userMsg, 'avoid') !== false) {
                $reply = "To prevent " . $row['name'] . ": " . $row['prevention'];
            } elseif (strpos($userMsg, 'treat') !== false || strpos($userMsg, 'cure') !== false) {
                $reply = "Recommended treatment for " . $row['name'] . ": " . $row['treatment'];
            } else {
                $reply = $row['name'] . " is caused by " . $row['cause'] . ". " . $row['description'];
            }
            break; 
        }
    }
}

echo json_encode(["success" => true, "reply" => $reply]);
?>