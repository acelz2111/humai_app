<?php
// backend/migrate_passwords.php
// ⚠️ RUN THIS ONCE TO HASH EXISTING PASSWORDS, THEN DELETE THIS FILE

header("Content-Type: text/html; charset=UTF-8");

require 'db.php';

echo "<!DOCTYPE html><html><head><title>Password Migration</title>";
echo "<style>body{font-family:Arial;padding:20px;background:#f0f0f0;}";
echo ".success{color:green;}.error{color:red;}.info{color:blue;}</style></head><body>";
echo "<h1>Password Migration Tool</h1>";

// Fetch all users
$sql = "SELECT id, email, password FROM users";
$result = $conn->query($sql);

if (!$result) {
    echo "<p class='error'>Error fetching users: " . $conn->error . "</p>";
    exit();
}

$updated = 0;
$skipped = 0;
$errors = 0;

echo "<h2>Starting migration...</h2><hr>";

while ($row = $result->fetch_assoc()) {
    // Check if password is already hashed
    // Bcrypt hashes are 60 characters and start with $2y$
    if (strlen($row['password']) == 60 && strpos($row['password'], '$2y$') === 0) {
        echo "<p class='info'>✓ Skipped: {$row['email']} (already hashed)</p>";
        $skipped++;
        continue;
    }
    
    // Hash the plain text password
    $hashedPassword = password_hash($row['password'], PASSWORD_DEFAULT);
    
    // Update user's password
    $updateSql = "UPDATE users SET password=? WHERE id=?";
    $stmt = $conn->prepare($updateSql);
    
    if (!$stmt) {
        echo "<p class='error'>✗ Error preparing update for {$row['email']}: " . $conn->error . "</p>";
        $errors++;
        continue;
    }
    
    $stmt->bind_param("si", $hashedPassword, $row['id']);
    
    if ($stmt->execute()) {
        echo "<p class='success'>✓ Updated: {$row['email']}</p>";
        $updated++;
    } else {
        echo "<p class='error'>✗ Error updating {$row['email']}: " . $stmt->error . "</p>";
        $errors++;
    }
    
    $stmt->close();
}

echo "<hr><h2>Migration Complete!</h2>";
echo "<p><strong>Updated:</strong> $updated</p>";
echo "<p><strong>Skipped:</strong> $skipped</p>";
echo "<p><strong>Errors:</strong> $errors</p>";

if ($errors == 0 && $updated > 0) {
    echo "<p class='success' style='font-size:18px;'>✓ All passwords successfully migrated!</p>";
    echo "<p class='error' style='font-size:16px;'>⚠️ IMPORTANT: DELETE THIS FILE NOW (migrate_passwords.php)</p>";
}

$conn->close();

echo "</body></html>";
?>