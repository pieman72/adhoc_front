<?// Load application config
$conf = parse_ini_file('../config.ini');
$host = $_SERVER['HTTP_HOST'];
$server = $_SERVER['SERVER_ADDR'];
$remote = $_SERVER['REMOTE_ADDR'];
$remote = (substr($server,0,strrpos($server,'.')) == substr($remote,0,strrpos($remote,'.')))
	? gethostbyname($host)
	: $remote;

// Load user settings
$settings = (isset($_COOKIE)&&isset($_COOKIE['adhocSettings']) ? json_decode(urldecode($_COOKIE['adhocSettings'])) : (object)array());

// Start collecting errors
$errors = array();

// Start the session
if(session_status()==PHP_SESSION_NONE){
    session_set_cookie_params(
        0
        ,dirname(dirname($_SERVER['PHP_SELF'])).'/'
        ,$host
    );
    session_start();
}

// Initialize a DB connection
$dbConn = mysqli_connect($conf['mysql_host'], $conf['mysql_user'], $conf['mysql_pass'], $conf['mysql_db']);
if($dbConn->error){
	$errors[] = $dbConn->error;
	$dbConn = null;
}

// If already logged in, pass back the current XSRF token, or make a new one
if(isset($_SESSION['username'])){
	if(isset($_POST['username']) && $_SESSION['username']==$_POST['username']){
		if(!isset($_SESSION['xsrftoken']))
			$_SESSION['xsrftoken'] = sha1(rand().$_SESSION['username']);
		exit($_SESSION['xsrftoken']);
	}else{
		http_response_code(401);
		exit;
	}
}

// Try to log the user in
if(!isset($_POST['username']) || !$_POST['username']){
	http_response_code(401);
	exit;
}
if(!isset($_POST['password']) || !$_POST['password']){
	http_response_code(401);
	exit;
}

// Try to fetch the user
$query = mysqli_stmt_init($dbConn);
if(!count($errors) && !mysqli_stmt_prepare($query, "
	SELECT
		username
		,settings
	FROM
		front_users
	WHERE
		username = ?
		AND password = UNHEX(?)
	LIMIT
		1; ")){
	$errors[] = "Could not prepare database statement: ".$dbConn->error;
}
if(!count($errors) && !mysqli_stmt_bind_param($query, 'ss'
		,$_POST['username']
		,sha1(sha1($_POST['password']))
	)){
	$errors[] = "Could not bind database parameters: ".$query->error;
}
if(!count($errors) && !mysqli_stmt_execute($query)){
	$errors[] = "Query failed: ".$query->error;
}
if(!count($errors) && !mysqli_stmt_bind_result($query
		,$username
		,$settingsTemp
	)){
	$errors[] = "Query failed: ".$query->error;
}
if(!count($errors) && !$query->fetch()){
	$errors[] = "Could not load user";
}
if(!count($errors) && !$query->close()){
	$errors[] = "Could not close database connection";
}

// Add password back to settings (if requested) and pass settings in the cookie
if(!count($errors)){
	$_SESSION['username'] = $username;
	if($settings){
		$query = mysqli_stmt_init($dbConn);
		if(!count($errors) && !mysqli_stmt_prepare($query, "
			UPDATE
				front_users
			SET
				settings = ?
			WHERE
				username = ?;")){
			$errors[] = "Could not prepare database statement: ".$dbConn->error;
		}
		if(!count($errors) && !mysqli_stmt_bind_param($query, 'ss'
				,$settings
				,$username
			)){
			$errors[] = "Could not bind database parameters: ".$query->error;
		}
		if(!count($errors) && !mysqli_stmt_execute($query)){
			$errors[] = "Query failed: ".$query->error;
		}
		if(!count($errors) && !$query->close()){
			$errors[] = "Could not close database connection";
		}
	}
	if(!isset($_SESSION['xsrftoken']))
		$_SESSION['xsrftoken'] = sha1(rand().$_SESSION['username']);
	exit($_SESSION['xsrftoken']);
}else{
	http_response_code(401);
	exit;
}
