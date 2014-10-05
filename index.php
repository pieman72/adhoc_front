<?// Load UI library
include_once('ui.php');

// Load application config
$conf = parse_ini_file('config.ini');

// Load user settings
$settings = (isset($_COOKIE)&&isset($_COOKIE['adhocSettings']) ? json_decode(urldecode($_COOKIE['adhocSettings'])) : (object)array());

// Start collecting errors
$errors = array();

// Start the session
if(session_status()==PHP_SESSION_NONE){
    session_set_cookie_params(
        0
        ,dirname($_SERVER['PHP_SELF']).'/'
        ,$_SERVER['HTTP_HOST']
    );
    session_start();
}

// Initialize a DB connection
$dbConn = mysqli_connect($conf['mysql_host'], $conf['mysql_user'], $conf['mysql_pass'], $conf['mysql_db']);
if($dbConn->error){
	$errors[] = $dbConn->error;
	$dbConn = null;
}

// If the user is not logged in by session, try to log them in by cookie
$username = null;
if(!count($errors)
		&& (
			!isset($_SESSION['username'])
			|| !$_SESSION['username']
		)
		&& isset($settings->username)
		&& isset($settings->password)
	){
	if(!($query = mysqli_stmt_init($dbConn))){
		$errors[] = "Could not initializedatabase statement: ".$dbConn->error;
	}
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
			,$settings->username
			,sha1($settings->password)
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
		setcookie(
			'adhocSettings'
			,$settingsTemp
			,strtotime('+1 year')
			,'/adhoc_demo/'
			,''
		);
		if($settings->remember){
			$settingsTemp = json_decode($settingsTemp);
			$settingsTemp->password = $settings->password;
			$settingsTemp = json_encode($settingsTemp);
		}
		$settings = json_decode($settingsTemp);
	}
}

// If the user was not loaded, clear the settings
if(!$_SESSION['username']){
	setcookie(
		'adhocSettings'
		,''
		,strtotime('+1 year')
		,'/adhoc_demo/'
		,''
	);
	$settings = (object) array();

// If the username was loaded, set a token for XSRF
}else if(!isset($_SESSION['xsrftoken'])){
	$_SESSION['xsrftoken'] = sha1(rand().$_SESSION['username']);
}

// If the user was found, try to load their projects
$projects = array();
if(!count($errors) && $_SESSION['username']){
	if(!($query = mysqli_stmt_init($dbConn))){
		$errors[] = "Could not initializedatabase statement: ".$dbConn->error;
	}
	if(!count($errors) && !mysqli_stmt_prepare($query, "
		SELECT
			p.id
			,p.project_name
			,LOWER(HEX(p.project_hash))
			,p.datetime_created
			,p.datetime_updated
		FROM
			front_projects p
			JOIN front_users u
				ON u.id = p.user
		WHERE
			u.username = ?
		ORDER BY
			p.datetime_updated DESC; ")){
		$errors[] = "Could not prepare database statement: ".$dbConn->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_param($query, 's'
			,$_SESSION['username']
		)){
		$errors[] = "Could not bind database parameters: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_execute($query)){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors) && !mysqli_stmt_bind_result($query
			,$projectId
			,$projectName
			,$projectHash
			,$projectCreated
			,$projectUpdated
		)){
		$errors[] = "Query failed: ".$query->error;
	}
	if(!count($errors)){
		while($query->fetch()){
			$projects[] = (object) array(
				'id'				=> $projectId
				,'project_name'		=> $projectName
				,'project_hash'		=> $projectHash
				,'datetime_created'	=> strtotime($projectCreated)
				,'datetime_updated'	=> strtotime($projectUpdated)
			);
		}
	}
}
?><!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>ADHOC - Live Demo</title>
	<link rel="shortcut icon" href="//static.harveyserv.ath.cx/adhoc/img/fav.png"/>
	<link rel="stylesheet" href="//static.harveyserv.ath.cx/adhoc/css/ui.css" type="text/css"/>
	<link rel="stylesheet" href="//static.harveyserv.ath.cx/adhoc/css/prism.css" type="text/css"/>
	<link rel="stylesheet" href="style.css" type="text/css"/>
</head>
<body class="<?=(isset($settings->colorScheme) ? $settings->colorScheme : 'light')?>">
	<div id="page">
		<?=Nxj_UI::lightbox(array(
			'id'            => 'theLightbox'
			,'title'		=> 'Login Error'
			,'content'      => '<ul><li>'.implode('</li><li>', $errors).'</li></ul>'
			,'visible'		=> count($errors)
		))?>
		<?$projectOptions = array();?>
		<?foreach($projects as $i=>$oneProject){?>
			<?$projectOptions[] = (object) array(
				'value'		=> $oneProject->id
				,'display'	=> "<span class=\"projectOption\">".$oneProject->project_name."</span><span class=\"projectDate\">".Nxj_UI::timeAgo($oneProject->datetime_updated)."</span>"
			);?>
		<?}?>
		<?$projectSelect = Nxj_UI::selectbox(array(
			'id'            => 'projectSelect'
			,'width'        => 370
			,'zindex'       => 1
			,'options'      => $projectOptions
			,'defaultText'	=> '(Select a Project)'
		));?>
		<?=Nxj_UI::lightbox(array(
			'id'            => 'projectLightbox'
			,'title'		=> 'Load Saved Project'
			,'content'      => "<br/>$projectSelect"
		))?>

		<div id="controls"<?=(isset($_SESSION['username']) ? ' class="collapsed"' : '')?>>
			<div class="controlsLeft floatLeft">
				<div class="floatLeft" style="height:100%;width:10px;"></div>
				<div class="floatLeft">
					<div class="floatLeft" style="border-bottom:1px solid #000000;width:100%;">
						<?if(isset($_SESSION['username'])){?>
							Logged in as <b><?=$_SESSION['username']?></b>.&nbsp;&nbsp;
							<a class="logoutLink" href="logout/">Log-out</a>
						<?}else{?>
							Hello, guest. Would you like to <a href="login/">login</a> or <a href="register/">register</a>?
						<?}?>
					</div>
					<div style="height:15px;" class="clear"></div>

					<div class="floatLeft">
						<div class="floatLeft">
							<span id="newPackageButton" class="nxj_button nxj_cssButton" href="javascript:void(0);" style="margin-right:6px;width:40px;">New</span>
							<span id="loadPackageButton" class="nxj_button nxj_cssButton<?=(isset($settings->username) ? '' : ' disabled')?>" href="javascript:void(0);" style="position:relative;width:50px;">
								Load
								<?if(!isset($settings->username)){?>
									<?=Nxj_UI::tooltip(array(
										'id'            => 'loadTip'
										,'direction'    => 'right'
										,'width'		=> 163
										,'height'		=> 40
										,'content'      => 'You must <a href="login/" target="_blank">login</a> or <a href="register/" target="_blank">register</a> in order to load a project'
									))?>
								<?}?>
							</span>
							<div class="clear" style="height:20px;"></div>

							<label for="projectName">Package Name</label>
							<div class="clear"></div>

							<input type="text" id="projectName" class="nxj_input" value="New Project"/>
							<div class="clear" style="height:10px;"></div>

							<span id="savePackageButton" class="nxj_button nxj_cssButton<?=(isset($settings->username) ? '' : ' disabled')?>" style="position:relative;">
								Save
								<?if(!isset($settings->username)){?>
									<?=Nxj_UI::tooltip(array(
										'id'            => 'saveTip'
										,'direction'    => 'right'
										,'width'		=> 163
										,'height'		=> 40
										,'content'      => 'You must <a href="login/" target="_blank">login</a> or <a href="register/" target="_blank">register</a> in order to save a project'
									))?>
								<?}?>
							</span>
						</div>
					</div>
					<div class="floatLeft" style="height:10px;width:20px;"></div>

					<div class="floatLeft">
						<div class="floatLeft">
							<span>Connector Labels</span>
							<div class="clear"></div>

							<?$checked = (isset($settings->labelConnectors)&&$settings->labelConnectors==0 ? 'checked="checked"' : '');?>
							<input type="radio"
									class="floatLeft"
									name="labelConnectors"
									value="0"
									id="labelConnectors_0"
									<?=$checked?> />
							<label for="labelConnectors_0">None</label>
							<div class="clear"></div>
							<?$checked = (!isset($settings->labelConnectors)||$settings->labelConnectors==1 ? 'checked="checked" ' : '');?>
							<input type="radio"
									class="floatLeft"
									name="labelConnectors"
									value="1"
									id="labelConnectors_1"
									<?=$checked?> />
							<label for="labelConnectors_1">Some</label>
							<div class="clear"></div>
							<?$checked = (isset($settings->labelConnectors)&&$settings->labelConnectors==2 ? 'checked="checked" ' : '');?>
							<input type="radio"
									class="floatLeft"
									name="labelConnectors"
									value="2"
									id="labelConnectors_2"
									<?=$checked?> />
							<label for="labelConnectors_2">All</label>
							<div class="clear"></div>
						</div>
						<div class="clear" style="height:10px;"></div>

						<div class="floatLeft">
							<span>Show Placeholders</span>
							<div class="clear"></div>

							<?$checked = (!isset($settings->showNullNodes)||$settings->showNullNodes ? 'checked="checked" ' : '');?>
							<input type="radio"
									class="floatLeft"
									name="showNullNodes"
									value="1"
									id="showNullNodes_1"
									<?=$checked?> />
							<label for="showNullNodes_1">Yes</label>
							<div class="clear"></div>
							<?$checked = (isset($settings->showNullNodes)&&!$settings->showNullNodes ? 'checked="checked" ' : '');?>
							<input type="radio"
									class="floatLeft"
									name="showNullNodes"
									value="0"
									id="showNullNodes_0"
									<?=$checked?> />
							<label for="showNullNodes_0">No</label>
							<div class="clear"></div>
						</div>
					</div>
					<div class="floatLeft" style="height:10px;width:20px;"></div>

					<div class="floatLeft">
						<div class="floatLeft">
							<span>Color Scheme</span>
							<div class="clear"></div>

							<?$checked = (!isset($settings->colorScheme)||$settings->colorScheme=='light' ? 'checked="checked" ' : '');?>
							<input type="radio"
									class="floatLeft"
									name="colorScheme"
									value="light"
									id="colorScheme_light"
									<?=$checked?> />
							<label for="colorScheme_light">Light</label>
							<div class="clear"></div>
							<?$checked = (isset($settings->colorScheme)&&$settings->colorScheme=='dark' ? 'checked="checked" ' : '');?>
							<input type="radio"
									class="floatLeft"
									name="colorScheme"
									value="dark"
									id="colorScheme_dark"
									<?=$checked?> />
							<label for="colorScheme_dark">Dark</label>
							<div class="clear"></div>
						</div>
					</div>
				</div>
			</div>
			<div class="controlsRight floatRight">
				<div class="floatRight" style="border-bottom:1px solid #000000;width:100%;">
					<div class="floatRight" style="height:10px;width:10px;"></div>
					<div class="floatRight">
						ADHOC Front-End (<a target="_blank" href="LICENSE">GPL v3</a>) |
						<a target="_blank" href="http://harveyserv.ath.cx/adhoc/">About</a> |
						<a id="helpLink" href="javascript:void(0);">Help</a>
					</div>
				</div>
				<div style="height:10px;" class="clear"></div>

				<div class="floatLeft">
					<label onclick="$('languageChoice').addClassName('nxj_selectOpen'); Event.stop(event);">Target Language</label>
					<div class="clear"></div>

					<?=Nxj_UI::selectbox(array(
						'id'			=> 'languageChoice'
						,'float'		=> 'left'
						,'width'		=> 200
						,'options'		=> array(
							(object) array('value' => 'c', 'display' => 'C (ANSI C99)', 'default' => true)
							,(object) array('value' => 'javascript', 'display' => 'javascript')
						)
					));?>
				</div>

				<div class="floatLeft" style="margin-left:10px;">
					<label class="floatLeft">Generate Executable</label>
					<div class="floatLeft" style="position:relative;">&nbsp;[?]
						<?=Nxj_UI::tooltip(array(
							'id'            => 'executableTip'
							,'direction'    => 'down'
							,'width'		=> 163
							,'height'		=> 120
							,'content'      => 'If checked, the generated code should be able to be executed with only the necessary ADHOC libraries, and no other user code. If unchecked, the generated code will simply implement the logic of your actions, but may, for example, need a <code>main()</code> function in order to run.'
						))?>
					</div>
					<div class="clear"></div>

					<?$checked = (!isset($settings->executable)||!$settings->executable ? '' : 'checked="checked" ');?>
					<input type="checkbox"
							class="floatLeft"
							name="generateExecutable"
							value="1"
							id="generateExecutable"
							<?=$checked?>/>
				</div>


				<a id="generateButton" class="nxj_button nxj_cssButton green" href="javascript:void(0);">Generate Code</a>

				<div id="controlsToggle" title="Show/Hide Controls">
					<div></div>
				</div>
			</div>
		</div>

		<div id="workspace">
			<div id="toolbox" class="Action">
				<div class="toolboxTitle">ToolBox</div>
				<div id="toolboxTabs"></div>
				<div class="clear"></div>
				<div id="toolboxItems"></div>
			</div>

			<canvas id="canvas" class="floatLeft"></canvas>

			<div id="histControls">
				<div id="histBack" class="histHolder disabled" title="Undo">
					<div class="icon"></div>
				</div>
				<div id="histFwd" class="histHolder disabled" title="Redo">
					<div class="icon"></div>
				</div>
			</div>

			<div id="zoomControls">
				<div id="zoomIn" class="zoomHolder" title="Zoom In">
					<div class="icon"></div>
				</div>
				<div id="zoomPrcent" class="zoomHolder">100</div>
				<div id="zoomOut" class="zoomHolder" title="Zoom Out">
					<div class="icon"></div>
				</div>
			</div>
		</div>

		<div id="output" style="display:none;">
			<div class="close"></div>
			<div class="outputControls">
				<form id="downloadForm" action="download/" method="post">
					<input type="hidden" id="download_ext" name="ext" />
					<input type="hidden" id="download_hash" name="hash" />
					<input type="hidden" id="download_rename" name="rename" />
					<a id="downloadButton" class="nxj_button nxj_cssButton floatRight" href="javascript:void(0);" onclick="$('downloadForm').submit();">Download Code</a>
				</form>
			</div>
			<pre><code id="generatedCode"></code></pre>
		</div>
	</div>

	<div id="xsrfToken" style="display:none;"><?=(isset($_SESSION['xsrftoken']) ? $_SESSION['xsrftoken'] : '')?></div>

	<script src="//static.harveyserv.ath.cx/adhoc/js/prototype.js"></script>
	<script src="//static.harveyserv.ath.cx/adhoc/js/scriptaculous.js"></script>
	<script src="//static.harveyserv.ath.cx/adhoc/js/ui.js"></script>
	<script src="//static.harveyserv.ath.cx/adhoc/js/prism.js" data-manual></script>
	<script src="adhoc.js"></script>
</body>
</html>
