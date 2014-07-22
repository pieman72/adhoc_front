<?
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
