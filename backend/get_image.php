<?php
require_once 'db.php';
if (isset($_GET['id'])) {
    $stmt = $conn->prepare("SELECT captured_image FROM diagnosis WHERE id = ?");
    $stmt->bind_param("i", $_GET['id']);
    $stmt->execute();
    $stmt->bind_result($img);
    $stmt->fetch();
    if($img) {
        header("Content-Type: image/jpeg");
        echo $img;
    }
}
?>