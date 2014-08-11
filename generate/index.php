<? // Load application config
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

// Continue with generation only if no errors
if(!count($errors)){
	// File extensions for different languages
	$extensions = array(
		'asp.net'		=> 'aspnet'
		,'c'			=> 'c'
		,'c++'			=> 'cpp'
		,'c#'			=> 'cs'
		,'clike'		=> 'c'
		,'coffeescript'	=> 'coffee'
		,'golang'		=> 'go'
		,'html'			=> 'html'
		,'http'			=> 'http'
		,'java'			=> 'java'
		,'javascript'	=> 'js'
		,'markup'		=> 'ml'
		,'php'			=> 'php'
		,'python'		=> 'py'
		,'ruby'			=> 'rb'
		,'sass'			=> 'sass'
		,'scala'		=> 'scala'
		,'shell'		=> 'sh'
		,'sql'			=> 'sql'
	);

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
	$language = $_POST['language'];
	$executable = (boolean) $_POST['executable'];
	$dbg = (boolean) $_POST['dbg'];
	$hash = md5($binary);
	$ext = isset($extensions[$language]) ? $extensions[$language] : $language;

	// Put the binary to a file
	file_put_contents("$hash.adh", $binary);

	// Execute ADHOC!
	$command = "timeout --preserve-status 2 adhoc -l $language -o ../download/$hash.$ext ".($executable ? '-e ' : '').($dbg ? '-d ' : '')."$hash.adh 2>&1";
	exec($command, $error_output, $return_var);

	// Determine if it was successful
	echo json_encode((object) array(
		'error' => $error_output
		,'nodeId' => $return_var
		,'hash'	=> $hash
		,'ext' => $ext
		,'code' => htmlspecialchars(file_get_contents("../download/$hash.$ext"))
	));
}

// Handle any errors
if(count($errors)){
	header('HTTP/1.0 400 Bad Request');
	echo implode('<br/>\n', $errors);
}
