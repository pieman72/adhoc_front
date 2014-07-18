<?  // Load application config
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

// If no project id provided, throw an error
if(!isset($_POST['projectid'])){
	$errors[] = "No project id provided";
}

// If not logged in, throw an error
if(!count($errors) && !isset($_SESSION['username'])){
	$errors[] = "You must be logged in to load projects";
}

// Try to fetch the project's hash by the project ID
if(!count($errors)){
	$query = mysqli_stmt_init($dbConn);
	if(!count($errors) && !mysqli_stmt_prepare($query, "
		SELECT
			LOWER(HEX(p.project_hash))
			,u.username
		FROM
			front_projects p
			JOIN front_users u
				ON u.id = p.user
		WHERE
			p.id = ?
		LIMIT
			1; ")){
		$errors[] = "Could not prepare database statement: ".$dbConn->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_param($query, 's'
			,$_POST['projectid']
		)){
		$errors[] = "Could not bind database parameters: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_execute($query)){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_result($query
			,$fetchHash
			,$fetchUser
		)){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors) && !$query->fetch()){
		$errors[] = "Could not find project to load";
	}
	if(!count($errors) && $fetchUser!=$_SESSION['username']){
		$errors[] = "Could not find project to load";
	}

	// If we're all good, try to load the project file by its hash
	if(!count($errors)){
		try{
			header('Content-type: application/adhoc');
			readfile("../generate/$fetchHash.adh");
			exit;
		}catch(Exception $e){
			$errors[] = "Could not load project file";
		}
	}
}

// Handle any errors
if(count($errors)){
	header('HTTP/1.0 400 Bad Request');
	echo implode('<br/>\n', $errors);
}
