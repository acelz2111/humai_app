<?php
$host = "localhost";     // usually localhost
$user = "root";          // default XAMPP username
$pass = "";              // default XAMPP password (empty string)
$dbname = "humai_db1"; // <-- change to your DB name

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Database connection failed."]));
}
?>
