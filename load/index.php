<?
$hash = $_POST['hash'];

header('Content-type: application/adhoc');
readfile("../generate/$hash.adh");
