<? // Load application config
$conf = parse_ini_file('../../config.ini');
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

// If not logged in, throw an error
if(!count($errors) && (!isset($_SESSION['username']) || $_SESSION['username']!='kenny')){
	$errors[] = "You must be logged in as an administrator to save logics";
}

// Get parameters from request
$tags = isset($headers['ADHOC-tags'])
	? JSON_decode($headers['ADHOC-tags'])
	: null;

// Try to add the logic to the database
if(!count($errors)){
	$sql = "
		INSERT INTO logics (
			projectHash
			,name
			,package
			,totalLoops
			,maxLoopNest
			,condReturns
			,actionVerb
			,nodeCount
			,paramCount
			,childCount
			,inputsVoid
			,inputsBool
			,inputsInt
			,inputsFloat
			,inputsString
			,inputsArray
			,inputsHash
			,inputsStruct
			,inputsAction
			,inputsMixed
			,outputType
		) VALUES (
			UNHEX(?),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
		) ON DUPLICATE KEY UPDATE
			projectHash = VALUES(projectHash)
			,totalLoops = VALUES(totalLoops)
			,maxLoopNest = VALUES(maxLoopNest)
			,condReturns = VALUES(condReturns)
			,actionVerb = VALUES(actionVerb)
			,nodeCount = VALUES(nodeCount)
			,paramCount = VALUES(paramCount)
			,childCount = VALUES(childCount)
			,inputsVoid = VALUES(inputsVoid)
			,inputsBool = VALUES(inputsBool)
			,inputsInt = VALUES(inputsInt)
			,inputsFloat = VALUES(inputsFloat)
			,inputsString = VALUES(inputsString)
			,inputsArray = VALUES(inputsArray)
			,inputsHash = VALUES(inputsHash)
			,inputsStruct = VALUES(inputsStruct)
			,inputsAction = VALUES(inputsAction)
			,inputsMixed = VALUES(inputsMixed)
			,outputType = VALUES(outputType)
			; ";
	$query = mysqli_stmt_init($dbConn);
	if(!mysqli_stmt_prepare($query, $sql)){
		$errors[] = "Could not prepare database statement: ".$dbConn->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_param($query, 'sssiiisiiiiiiiiiiiiii'
		,$_POST['projectHash']
		,$_POST['name']
		,$_POST['package']
		,$_POST['totalLoops']
		,$_POST['maxLoopNest']
		,$_POST['condReturns']
		,$_POST['actionVerb']
		,$_POST['nodeCount']
		,$_POST['paramCount']
		,$_POST['childCount']
		,$_POST['inputsVoid']
		,$_POST['inputsBool']
		,$_POST['inputsInt']
		,$_POST['inputsFloat']
		,$_POST['inputsString']
		,$_POST['inputsArray']
		,$_POST['inputsHash']
		,$_POST['inputsStruct']
		,$_POST['inputsAction']
		,$_POST['inputsMixed']
		,$_POST['outputType']
	)){
		$errors[] = "Could not bind database parameters: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_execute($query)){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors)){
		echo 'ok';
	}
}

// Handle any errors
if(count($errors)){
	header('HTTP/1.0 400 Bad Request');
	echo implode('<br/>\n', $errors);
}
