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

	// Verify the request using captcha
	if(!count($errors)){
		$curl = curl_init($conf['captcha_ver_url']);
		curl_setopt_array($curl, array(
			CURLOPT_RETURNTRANSFER	=> true
			,CURLOPT_POST			=> true
			,CURLOPT_POSTFIELDS		=> array(
				'privatekey'		=> $conf['captcha_prv_key']
				,'remoteip'			=> $remote
				,'challenge'		=> $_POST['recaptcha_challenge_field']
				,'response'			=> $_POST['recaptcha_response_field']
			)
		));
		$curl_response = curl_exec($curl);
		if(strpos($curl_response, 'true') !== 0){
			$errors[] = 'Captcha failed';
		}
	}

	// Update settings based on input
	if(isset($settings->password)) unset($settings->password);
	$settings->username = $_POST['username'];
	$settings->remember = ($_POST['remember']=='1');

	// Try to create the user
	$query = mysqli_stmt_init($dbConn);
	if(!count($errors) && !mysqli_stmt_prepare($query, "
		INSERT IGNORE INTO front_users (
			username
			,password
			,settings
		) VALUES (
			?
			,UNHEX(?)
			,?
		); ")){
		$errors[] = "Could not prepare database statement: ".$dbConn->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_param($query, 'sss'
			,$_POST['username']
			,sha1(sha1($_POST['password']))
			,json_encode($settings)
		)){
		$errors[] = "Could not bind database parameters: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_execute($query)){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_affected_rows($query)){
		$errors[] = "Username \"".$_POST['username']."\" is taken";
	}

	// Add password back to settings (if requested) and pass settings in the cookie
	if(!count($errors)){
		if($_POST['remember']=='1') $settings->password = sha1($_POST['password']);
		$_SESSION['username'] = $_POST['username'];
		setcookie(
			'adhocSettings'
			,json_encode($settings)
			,strtotime('+1 year')
			,'/adhoc_demo/'
			,''
		);
		header('Location: /adhoc_demo/');
	}
}?><!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>ADHOC - Register</title>
	<link rel="shortcut icon" href="//static.harveyserv.ath.cx/adhoc/img/fav.png"/>
	<link rel="stylesheet" href="//static.harveyserv.ath.cx/adhoc/css/ui.css" type="text/css"/>
	<link rel="stylesheet" href="../style.css" type="text/css"/>
</head>
<body class="<?=(isset($settings->colorScheme) ? $settings->colorScheme : 'light')?>">
	<div id="page">
		<div style="padding:10px;">Already have an account? <a href="../login/">Login</a> instead.</div>
		<div class="clear"></div>

		<div class="registrationForm">
			<h2>Register for ADHOC</h2>
			<form id="regForm" action="<?=dirname($_SERVER['PHP_SELF']).'/'?>" method="post" onsubmit="return checkForm();">
				<?if(count($errors)){?>
					<ul class="errors"><li><?=implode('</li><li>', $errors)?></li></ul>
				<?}?>

				<h4>Username / Password</h4>
				<input id="regUser" type="text" name="username" value="<?=(isset($_POST['username']) ? $_POST['username'] : '')?>" class="nxj_input" onblur="checkUser();" placeholder="Username" />
				/
				<input id="regPass" type="password" name="password" value="<?=(isset($_POST['password']) ? $_POST['password'] : '')?>" class="nxj_input" onblur="checkPass();" placeholder="Password" />
				<div class="clear"></div>

				<h4>Human Checkpoint</h4>
				<div id="captcha_holder" style="display:none;">
					<input id="recaptcha_response_field" name="recaptcha_response_field" placeholder="Human?" />
					<div class="reminder recaptcha_only_if_image">(Enter all text you see in this image, including numbers)</div>
					<div class="reminder recaptcha_only_if_audio">(Please type every number you hear. Spaces are not required)</div>
					<div class="clear"></div>

					<div id="recaptcha_image"></div>
					<div class="floatLeft">
						<a href="javascript:Recaptcha.showhelp()">Help</a><br/>
						<a href="javascript:Recaptcha.reload();">New Captcha</a><br/>
						<a class="recaptcha_only_if_image" href="javascript:Recaptcha.switch_type('audio');">Use Audio</a>
						<a class="recaptcha_only_if_audio" href="javascript:Recaptcha.switch_type('image');">Use Image</a>
					</div>

				</div>
				<script>var RecaptchaOptions = {theme:'custom',custom_theme_widget:'captcha_holder'};</script>
				<script src="<?=$conf['captcha_pub_url']?>"></script>
				<div class="clear"></div>


				<h4>Submit Registration</h4>
				<input id="regRemember" type="checkbox" name="remember" value="1" <?=(isset($_POST['remember'])&&$_POST['remember'] ? 'checked="checked" ' : '')?>/>
				<label for="regRemember">Remember me on this browser</label>
				<div class="clear" style="height:10px;"></div>
				<input type="hidden" name="submitted" value="1" />
				<a id="regButton" href="javascript:void(0);" class="nxj_button nxj_cssButton disabled" onclick="return !$(this.hasClassName('disabled')) && $('regForm').submit();">Register</a>
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
				if($F('recaptcha_response_field') && $F('regPass') && !$('regPass').hasClassName('red')) $('regButton').removeClassName('disabled');
				return true;
			}else{
				$('regUser').addClassName('red');
				return false;
			}
		}
		function checkPass(){
			if($F('regPass')){
				$('regPass').removeClassName('red');
				if($F('recaptcha_response_field') && $F('regUser') && !$('regUser').hasClassName('red')) $('regButton').removeClassName('disabled');
				return true;
			}else{
				$('regPass').addClassName('red');
				return false;
			}
		}
		function checkCaptcha(e){
			if($F('recaptcha_response_field')){
				$('recaptcha_response_field').removeClassName('red');
				if($F('regUser') && !$('regUser').hasClassName('red') && $F('regPass') && !$('regPass').hasClassName('red')) $('regButton').removeClassName('disabled');
				if((e.which||window.event.keyCode) == Event.KEY_RETURN && !$('regButton').hasClassName('disabled')) $('regForm').submit();
				return true;
			}else{
				$('recaptcha_response_field').addClassName('red');
				return false;
			}
		}
		function checkForm(){
			return $F('regUser') && $F('regPass') && $F('recaptcha_response_field') && checkUser();
		}
		var catcha_promise = setTimeout(function(){
			if($('recaptcha_response_field')){
				$('recaptcha_response_field').addClassName('nxj_input');
				$('recaptcha_response_field').observe('keyup', checkCaptcha);
				clearTimeout(catcha_promise);
			}
		}, 500);
		$('regUser').observe('keyup', checkUser);
		$('regPass').observe('keyup', checkPass);
		$('regForm').observe('submit', checkForm);
	</script>
</body>
</html>
