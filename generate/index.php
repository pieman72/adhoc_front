<?
// Get parameters from request
$binary = str_replace(
	array(
		'\0'
		,'\n'
		,'\"'
		,"\r\n"
	)
	,array(
		"\0"
		,"\n"
		,"\""
		,"\n"
	)
	,$_POST['binary']
);
$language = $_POST['language'];
$executable = (boolean) $_POST['executable'];
$dbg = (boolean) $_POST['dbg'];
$hash = md5($binary);

// Put the binary to a file
file_put_contents("$hash.adh", $binary);

// Execute ADHOC!
$command = "adhoc -l $language ".($executable ? '-e ' : '').($dbg ? '-d ' : '')."$hash.adh 2> ../error_log";
exec($command, &$output, &$return_var);
echo implode("\n", $output);
