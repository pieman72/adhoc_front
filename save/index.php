<? // Load application config
$conf = parse_ini_file('../config.ini');
$host = $_SERVER['HTTP_HOST'];
$server = $_SERVER['SERVER_ADDR'];
$remote = $_SERVER['REMOTE_ADDR'];
$remote = (substr($server,0,strrpos($server,'.')) == substr($remote,0,strrpos($remote,'.')))
	? gethostbyname($host)
	: $remote;

// Get request headers
$headers = apache_request_headers();

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
if(!isset($_POST['xsrftoken'])
		|| !isset($_SESSION['xsrftoken'])
		|| $_POST['xsrftoken']!=$_SESSION['xsrftoken']
	){
	$errors[] = "XSRF Token mismatch. If this persists, try logging out and back in.";
}

// Initialize a DB connection
if(!count($errors)){
	$dbConn = mysqli_connect($conf['mysql_host'], $conf['mysql_user'], $conf['mysql_pass'], $conf['mysql_db']);
	if($dbConn->error){
		$errors[] = $dbConn->error;
		$dbConn = null;
	}
}

// Get parameters from request
$binary = str_replace(
	array(
		'\0'
		,"\r\n"
	)
	,array(
		"\0"
		,"\n"
	)
	,$_POST['binary']
);
$hash = md5($binary);
$projectId = $_POST['projectid'];
$projectName = $_POST['projectname'];
$tags = isset($headers['ADHOC-tags']) ? $headers['ADHOC-tags'] : '';

// If not logged in, throw an error
if(!count($errors) && !isset($_SESSION['username'])){
	$errors[] = "You must be logged in to save projects";
}

// Try to update the project in the database
if(!count($errors)){
	if($projectId){
		$sql = "
		UPDATE
			front_projects p
			JOIN front_users u
				ON u.id = p.user
		SET
			p.project_name = ?
			,p.tags = ?
			,p.project_hash = UNHEX(?)
			,datetime_updated = CURRENT_TIMESTAMP
		WHERE
			p.id = ?
			AND u.username = ? ;";
	}else{
		$sql = "
		INSERT INTO front_projects (
			user
			,project_name
			,tags
			,project_hash
			,datetime_updated
		) SELECT
			u.id
			,?
			,?
			,UNHEX(?)
			,CURRENT_TIMESTAMP
		FROM
			front_users u
		WHERE
			u.username = ? ;";
	}
	$query = mysqli_stmt_init($dbConn);
	if(!count($errors) && !mysqli_stmt_prepare($query, $sql)){
		$errors[] = "Could not prepare database statement: ".$dbConn->error;
	}
	if(!count($errors)){
		if($projectId && !mysqli_stmt_bind_param($query, 'sssss'
			,$projectName
			,$tags
			,$hash
			,$projectId
			,$_SESSION['username']
		)) $errors[] = "Could not bind database parameters: ".$query->error;
		if(!$projectId && !mysqli_stmt_bind_param($query, 'ssss'
			,$projectName
			,$tags
			,$hash
			,$_SESSION['username']
		)) $errors[] = "Could not bind database parameters: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_execute($query)){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors) && !$projectId && !($projectId = mysqli_insert_id($dbConn))){
		$errors[] = "Could not determin new project id";
	}

	// If we're all good, try to write the binary file
	if(!count($errors) && !file_put_contents("../generate/$hash.adh", $binary)){
		$errors[] = "Could not write to ADHOC binary file";
	}

	// No errors, return the projectId
	if(!count($errors)){
		echo $projectId;
		exit;
	}
}

// Handle any errors
if(count($errors)){
	header('HTTP/1.0 400 Bad Request');
	echo implode('<br/>\n', $errors);
}
