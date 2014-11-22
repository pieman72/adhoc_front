<? // Load application config
$conf = parse_ini_file('../../config.ini');
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

// If no logic id provided, throw an error
if(!isset($_POST['logicid'])){
	$errors[] = "No logic id provided";
}

// If not logged in, throw an error
if(!count($errors) && !isset($_SESSION['username'])){
	$errors[] = "You must be logged in to load logic grafts";
}

// Try to fetch the logic's hash by the logic ID
if(!count($errors)){
	$query = mysqli_stmt_init($dbConn);
	if(!mysqli_stmt_prepare($query, "
		SELECT
			LOWER(HEX(l.projectHash)) hash
		FROM
			logics l
		WHERE
			l.id = ?
		LIMIT
			1; ")){
		$errors[] = "Could not prepare database statement: ".$dbConn->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_param($query, 'i'
			,$_POST['logicid']
		)){
		$errors[] = "Could not bind database parameters: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_execute($query)){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_result($query
			,$fetchHash
		)){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors) && !$query->fetch()){
		$errors[] = "Could not find logic graft to load";
	}
	if(!count($errors)){
		$query = mysqli_stmt_init($dbConn);
		if(!mysqli_stmt_prepare($query, "
			SELECT
				lt.nodeId
				,t.name
			FROM
				logic_tags lt
				JOIN tags t
					ON lt.tagid = t.id
			WHERE
				lt.logicId = ?
			ORDER BY
				lt.nodeId; ")){
			$errors[] = "Could not prepare database statement: ".$dbConn->error;
		}
	}
	if(!count($errors) && !mysqli_stmt_bind_param($query, 'i'
			,$_POST['logicid']
		)){
		$errors[] = "Could not bind database parameters: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_execute($query)){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_result($query
			,$fetchNodeId
			,$fetchTagName
		)){
		$errors[] = "Query failed: ".$query->error;
	}
	$fetchTags = new stdClass();
	while(!count($errors) && ($fetchStatus=$query->fetch())){
		if(!isset($fetchTags->$fetchNodeId))
			$fetchTags->$fetchNodeId = array();
		$nodeTagArray = $fetchTags->$fetchNodeId;
		$nodeTagArray[] = $fetchTagName;
		$fetchTags->$fetchNodeId = $nodeTagArray;
	}
	$fetchTags = JSON_encode($fetchTags);

	// If we're all good, try to load the logic file by its hash
	if(!count($errors)){
		try{
			header('Content-type: application/adhoc');
			header("ADHOC-tags: $fetchTags");
			readfile("../../generate/$fetchHash.adh");
			exit;
		}catch(Exception $e){
			$errors[] = "Could not load logic graft";
		}
	}
}

// Handle any errors
if(count($errors)){
	header('HTTP/1.0 400 Bad Request');
	echo implode('<br/>', $errors);
}
