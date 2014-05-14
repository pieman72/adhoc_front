<!DOCTYPE html>
<?php include_once('ui.php');?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>ADHOC - Live Demo</title>
	<link rel="shortcut icon" href="static/img/fav.png"/>
	<link rel="stylesheet" href="static/css/ui.css" type="text/css"/>
	<link rel="stylesheet" href="static/css/style.css" type="text/css"/>
</head>
<body>
	<div id="page">
		<?php echo Nxj_UI::lightbox(array(
			'id'            => 'theLightbox'
			,'title'		=> 'Lightbox'
			,'content'      => 'This is a test'
		));?>

		<div id="controls" class="collapsed">
			<div class="controlsLeft floatLeft">
			</div>
			<div class="controlsRight floatRight">
				<div id="controlsToggle" title="Show/Hide Controls" onclick="$('controls').toggleClassName('collapsed');"><div></div></div>
			</div>
		</div>

		<div id="workspace">
			<div id="toolbox" class="floatLeft">
				<div class="toolboxTitle">ToolBox</div>
			</div>

			<canvas id="canvas" class="floatLeft"></canvas>

			<div id="viewControls">
			    <div id="zoomIn" class="zoomHolder">
					<div class="icon"></div>
				</div>
			    <div id="zoomOut" class="zoomHolder">
					<div class="icon"></div>
				</div>
			</div>
		</div>

		<div id="output">
		</div>
	</div>

	<script src="static/js/prototype.js"></script>
	<script src="static/js/scriptaculous.js"></script>
	<script src="static/js/ui.js"></script>
	<script src="static/js/adhoc.js"></script>
</body>
</html>
