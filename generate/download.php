<?
// Get params from POST
$ext = $_POST['ext'];
$hash = $_POST['hash'];
$rename = $_POST['rename'];

// Fetch the file
header('Content-Type: application/octet-stream');
header("Content-Disposition: attachment; filename=\"$rename.$ext\"");
header('Content-Transfer-Encoding: binary');
file_get_contents("$hash.$ext");
