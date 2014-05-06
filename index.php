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
			'id'            => 'adhoc_lightbox'
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

				<div class="toolboxCategory">
					<div class="toolboxCategoryHeading">Action</div>
					<div class="clear"></div>

					<div class="toolboxItem" data-type="1" data-which="1">
						<div class="toolboxItemIcon iconActionDef"></div>
						<div class="toolboxItemText">Define Action</div>
					</div>
					<div class="clear"></div>

					<div class="toolboxItem" data-type="1" data-which="2">
						<div class="toolboxItemIcon iconActionCall"></div>
						<div class="toolboxItemText">Call Action</div>
					</div>
					<div class="clear"></div>
				</div>

				<div class="toolboxCategory collapsed">
					<div class="toolboxCategoryHeading">Group</div>
					<div class="clear"></div>

					<div class="toolboxItem" data-type="2" data-which="3">
						<div class="toolboxItemIcon iconGroupSerial"></div>
						<div class="toolboxItemText">Serial Group</div>
					</div>
					<div class="clear"></div>
				</div>

				<div class="toolboxCategory collapsed">
					<div class="toolboxCategoryHeading">Control</div>
				</div>

				<div class="toolboxCategory collapsed">
					<div class="toolboxCategoryHeading">Operator</div>
				</div>

				<div class="toolboxCategory collapsed">
					<div class="toolboxCategoryHeading">Variable</div>
				</div>

				<div class="toolboxCategory collapsed">
					<div class="toolboxCategoryHeading">Literal</div>
				</div>
			</div>

			<canvas id="canvas" class="floatLeft"></canvas>
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
