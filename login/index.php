<?// Load UI library
include_once('../ui.php');

// Load application config
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

// If already logged in, go straight to homepage
if(isset($_SESSION['username'])){
	header('Location: /adhoc_demo/');
	exit;
}

// If registration was submitted, try to register the user
if(isset($_POST['submitted'])){
	// Get the user credentials from input
	if(!isset($_POST['username']) || !$_POST['username']){
		$errors[] = 'No username provided';
	}else if(!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]+$/', $_POST['username'])){
		$errors[] = 'Bad username provided';
	}
	if(!isset($_POST['password']) || !$_POST['password']){
		$errors[] = 'No password provided';
	}

	// Update settings based on input
	if(isset($settings->password)) unset($settings->password);
	$settings->username = $_POST['username'];
	$settings->remember = ($_POST['remember']=='1');

	// Try to create the user
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

	// Add password back to settings (if requested) and pass settings in the cookie
	if(!count($errors)){
		$_SESSION['username'] = $username;
		if($_POST['remember']=='1'){
			$settingsTemp = json_decode($settingsTemp);
			$settingsTemp->password = sha1($_POST['password']);
			$settingsTemp = json_encode($settingsTemp);
		}
		setcookie(
			'adhocSettings'
			,$settingsTemp
			,strtotime('+1 year')
			,'/adhoc_demo/'
			,''
		);
		header('Location: /adhoc_demo/');
		exit;
	}
}?><!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>ADHOC - Login</title>
	<link rel="shortcut icon" href="//static.harveyserv.ath.cx/adhoc/img/fav.png"/>
	<link rel="stylesheet" href="//static.harveyserv.ath.cx/adhoc/css/ui.css" type="text/css"/>
	<link rel="stylesheet" href="../style.css" type="text/css"/>
</head>
<body class="<?=(isset($settings->colorScheme) ? $settings->colorScheme : 'light')?>">
	<div id="page">
		<div style="padding:10px;">Don't have an account? <a href="../register/">Register</a> instead.</div>
		<div class="clear"></div>

		<div class="registrationForm">
			<h2>Login to ADHOC</h2>
			<form id="regForm" action="<?=dirname($_SERVER['PHP_SELF']).'/'?>" method="post" onsubmit="return checkForm();">
				<?if(count($errors)){?>
					<ul class="errors"><li><?=implode('</li><li>', $errors)?></li></ul>
				<?}?>

				<h4>Username / Password</h4>
				<input id="regUser" type="text" name="username" value="<?=(isset($_POST['username']) ? $_POST['username'] : '')?>" class="nxj_input" onblur="checkUser();" placeholder="Username" />
				/
				<input id="regPass" type="password" name="password" value="<?=(isset($_POST['password']) ? $_POST['password'] : '')?>" class="nxj_input" onblur="checkPass();" placeholder="Password" />
				<div class="clear"></div>

				<h4>Submit Login</h4>
				<input id="regRemember" type="checkbox" name="remember" value="1" <?=(isset($_POST['remember'])&&$_POST['remember'] ? 'checked="checked" ' : '')?>/>
				<label for="regRemember">Remember me on this browser</label>
				<div class="clear" style="height:10px;"></div>
				<input type="hidden" name="submitted" value="1" />
				<a id="regButton" href="javascript:void(0);" class="nxj_button nxj_cssButton disabled" onclick="return !$(this.hasClassName('disabled')) && $('regForm').submit();">Login</a>
			</form>
		</div>
	</div>

	<script src="//static.harveyserv.ath.cx/adhoc/js/prototype.js"></script>
	<script src="//static.harveyserv.ath.cx/adhoc/js/scriptaculous.js"></script>
	<script src="//static.harveyserv.ath.cx/adhoc/js/ui.js"></script>
	<script>
		function checkUser(){
			var val = $F('regUser');
			if(!val || val.match(/^[a-zA-Z_][a-zA-Z0-9_]+$/)){
				$('regUser').removeClassName('red');
				if($F('regPass') && !$('regPass').hasClassName('red')) $('regButton').removeClassName('disabled');
				return true;
			}else{
				$('regUser').addClassName('red');
				return false;
			}
		}
		function checkPass(){
			if($F('regPass')){
				$('regPass').removeClassName('red');
				if($F('regUser') && !$('regUser').hasClassName('red')) $('regButton').removeClassName('disabled');
				return true;
			}else{
				$('regPass').addClassName('red');
				return false;
			}
		}
		function checkForm(){
			return $F('regUser') && $F('regPass') && checkUser();
		}
		$('regUser').observe('keyup', checkUser);
		$('regPass').observe('keyup', checkPass);
		$('regForm').observe('submit', checkForm);
	</script>
</body>
</html>
