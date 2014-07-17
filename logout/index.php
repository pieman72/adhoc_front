<?// Load UI library
include_once('../ui.php');

// Load application config
$conf = parse_ini_file('../config.ini');

// Load user settings
$settings = (isset($_COOKIE)&&isset($_COOKIE['adhocSettings']) ? json_decode(urldecode($_COOKIE['adhocSettings'])) : (object)array());

// Start collecting errors
$errors = array();

// Start the session
if(session_status()==PHP_SESSION_NONE){
    session_set_cookie_params(
        0
        ,dirname($_SERVER['PHP_SELF']).'/'
        ,$_SERVER['HTTP_HOST']
    );
    session_start();
}

// Initialize a DB connection
$dbConn = mysqli_connect($conf['mysql_host'], $conf['mysql_user'], $conf['mysql_pass'], $conf['mysql_db']);
if($dbConn->error){
	$errors[] = $dbConn->error;
	$dbConn = null;
}

// If the user is not logged in by session, try to log them in by cookie
$username = null;
if(!count($errors) && isset($_SESSION['username']) && $_SESSION['username']){
	if(!($query = mysqli_stmt_init($dbConn))){
		$errors[] = "Could not initializedatabase statement: ".$dbConn->error;
	}
	if(!count($errors) && !mysqli_stmt_prepare($query, "
		UPDATE
			front_users
		SET
			settings = ?
		WHERE
			username = ?
		LIMIT
			1; ")){
		$errors[] = "Could not prepare database statement: ".$dbConn->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_param($query, 'ss'
			,json_encode($settings)
			,$_SESSION['username']
		)){
		$errors[] = "Could not bind database parameters: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_execute($query)){
		$errors[] = "Query failed: ".$query->error;
	}
}

// Display errors
if(count($errors)){
	// TODO
}

// Remove the current login
unset($_SESSION['username']);
setcookie(
	'adhocSettings'
	,''
	,strtotime('+1 year')
	,'/adhoc_demo/'
	,''
);

// Redirect back to the homepage
header('Location: /adhoc_demo/');
