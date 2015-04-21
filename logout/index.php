<?// Remove the current login
session_destroy();

// Remove the browser cookie
setcookie(
	'adhocSettings'
	,''
	,strtotime('+1 year')
	,'/adhoc_demo/'
	,'.harveyserv.ath.cx'
);

// Redirect back to the homepage
header('Location: /adhoc_demo/');
