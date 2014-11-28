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

// Weights for different factors
$weight_totalLoops		= 1.0;
$weight_maxLoopNest		= 1.0;
$weight_condReturns		= 1.0;
$weight_actionVerb		= 3.0;
$weight_nodeCount		= 0.1;
$weight_paramCount		= 1.0;
$weight_childCount		= 1.0;
$weight_inputsVoid		= 0.5;
$weight_inputsBool		= 0.5;
$weight_inputsInt		= 0.5;
$weight_inputsFloat		= 0.5;
$weight_inputsString	= 0.5;
$weight_inputsArray		= 0.5;
$weight_inputsHash		= 0.5;
$weight_inputsStruct	= 0.5;
$weight_inputsAction	= 0.5;
$weight_inputsMixed		= 0.5;
$weight_outputType		= 1.0;
$scale_diffSegmenting	= 5;

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
$tags = isset($headers['ADHOC-tags'])
	? JSON_decode($headers['ADHOC-tags'])
	: null;

// Try to update the project in the database
if(!count($errors)){
	$sql = "
		SELECT
			data.id
			,data.name
			,data.package
			,data.diff
			,data.isConfirmed
		FROM (
			SELECT
				l.id
				,l.name
				,l.package
				,(
					ABS(l.totalLoops - ?) * ?
					+ ABS(l.maxLoopNest - ?) * ?
					+ ABS(l.condReturns - ?) * ?
					+ CASE WHEN l.actionVerb = ? THEN 0 ELSE ? END
					+ ABS(l.nodeCount - ?) * ?
					+ ABS(l.paramCount - ?) * ?
					+ ABS(l.childCount - ?) * ?
					+ ABS(l.inputsVoid - ?) * ?
					+ ABS(l.inputsBool - ?) * ?
					+ ABS(l.inputsInt - ?) * ?
					+ ABS(l.inputsFloat - ?) * ?
					+ ABS(l.inputsString - ?) * ?
					+ ABS(l.inputsArray - ?) * ?
					+ ABS(l.inputsHash - ?) * ?
					+ ABS(l.inputsStruct - ?) * ?
					+ ABS(l.inputsAction - ?) * ?
					+ ABS(l.inputsMixed - ?) * ?
					+ ABS(l.outputType - ?) * ?
				) diff
				,l.isConfirmed
			FROM
				logics l
		) data
		ORDER BY
			FLOOR(data.diff / ?) ASC
			,data.isConfirmed DESC
			,data.diff ASC
		LIMIT 5; ";
	$query = mysqli_stmt_init($dbConn);
	if(!mysqli_stmt_prepare($query, $sql)){
		$errors[] = "Could not prepare database statement: ".$dbConn->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_param($query, 'idididsdididididididididididididididd'
		,$_POST['totalLoops']	,$weight_totalLoops
		,$_POST['maxLoopNest']	,$weight_maxLoopNest
		,$_POST['condReturns']	,$weight_condReturns
		,$_POST['actionVerb']	,$weight_actionVerb
		,$_POST['nodeCount']	,$weight_nodeCount
		,$_POST['paramCount']	,$weight_paramCount
		,$_POST['childCount']	,$weight_childCount
		,$_POST['inputsVoid']	,$weight_inputsVoid
		,$_POST['inputsBool']	,$weight_inputsBool
		,$_POST['inputsInt']	,$weight_inputsInt
		,$_POST['inputsFloat']	,$weight_inputsFloat
		,$_POST['inputsString']	,$weight_inputsString
		,$_POST['inputsArray']	,$weight_inputsArray
		,$_POST['inputsHash']	,$weight_inputsHash
		,$_POST['inputsStruct']	,$weight_inputsStruct
		,$_POST['inputsAction']	,$weight_inputsAction
		,$_POST['inputsMixed']	,$weight_inputsMixed
		,$_POST['outputType']	,$weight_outputType
		,$scale_diffSegmenting
	)){
		$errors[] = "Could not bind database parameters: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_execute($query)){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_result($query
			,$fetchLogicId
			,$fetchLogicName
			,$fetchLogicPackage
			,$fetchLogicDiff
			,$fetchLogicConfirmed
		)){
		$errors[] = "Query failed: ".$query->error;
	}
	$fetchLogics = [];
	$fetchStatus = 'Ok';
	while(!count($errors) && ($fetchStatus=$query->fetch())){
		$fetchLogics[] = [
			'id'		=> $fetchLogicId
			,'name'		=> $fetchLogicName
			,'package'	=> $fetchLogicPackage
			,'diff'		=> $fetchLogicDiff
			,'confirmed'=> $fetchLogicConfirmed
		];
	}
	if($fetchStatus === false){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors)){
		header('Content-type: application/json');
		echo JSON_encode($fetchLogics);
	}
}

// Handle any errors
if(count($errors)){
	header('HTTP/1.0 400 Bad Request');
	echo implode('<br/>\n', $errors);
}
