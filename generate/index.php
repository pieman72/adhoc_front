<?
// File extensions for different languages
$extensions = array(
	'asp.net'		=> 'aspnet'
	,'c'			=> 'c'
	,'c++'			=> 'cpp'
	,'c#'			=> 'csharp'
	,'clike'		=> 'clike'
	,'coffeescript'	=> 'coffeescript'
	,'golang'		=> 'go'
	,'html'			=> 'markup'
	,'http'			=> 'http'
	,'java'			=> 'java'
	,'javascript'	=> 'javascript'
	,'markup'		=> 'markup'
	,'php'			=> 'php'
	,'python'		=> 'python'
	,'ruby'			=> 'ruby'
	,'sass'			=> 'scss'
	,'scala'		=> 'scala'
	,'shell'		=> 'bash'
	,'sql'			=> 'sql'
);

// Get parameters from request
$binary = str_replace(
	array(
		'\0'
		,'\n'
		,"\r\n"
	)
	,array(
		"\0"
		,"\n"
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
