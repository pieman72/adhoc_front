<!DOCTYPE html>
<?php include_once('ui.php');?>
<?$settings = (isset($_COOKIE)&&isset($_COOKIE['adhocSettings']) ? json_decode(stripslashes($_COOKIE['adhocSettings'])) : (object)array());?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>ADHOC - Live Demo</title>
	<link rel="shortcut icon" href="static/img/fav.png"/>
	<link rel="stylesheet" href="static/css/ui.css" type="text/css"/>
	<link rel="stylesheet" href="static/css/style.css" type="text/css"/>
	<link rel="stylesheet" href="static/css/prism.css" type="text/css"/>
</head>
<body class="<?=(isset($settings->colorScheme) ? $settings->colorScheme : 'light')?>">
	<div id="page">
		<?php echo Nxj_UI::lightbox(array(
			'id'            => 'theLightbox'
			,'title'		=> 'Lightbox'
			,'content'      => 'This is a test'
		));?>

		<div id="controls" class="collapsed">
			<div class="controlsLeft floatLeft">
				<div class="floatLeft" style="height:100%;width:10px;"></div>
				<div class="floatLeft">
					<div style="height:10px;" class="clear"></div>

					<div class="floatLeft">
						<div class="floatLeft">
							<label for="projectName">Package Name</label>
							<div class="clear"></div>

							<input type="text" id="projectName" class="nxj_input" value="My Project" />
							<div class="clear" style="height:20px;"></div>

							<a id="newPackageButton" class="nxj_button nxj_cssButton" href="javascript:void(0);">New Package</a>
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

							<?$checked = (isset($settings->showNullNodes)&&$settings->showNullNodes ? 'checked="checked" ' : '');?>
							<input type="radio"
									class="floatLeft"
									name="showNullNodes"
									value="1"
									id="showNullNodes_1"
									<?=$checked?> />
							<label for="showNullNodes_1">Yes</label>
							<div class="clear"></div>
							<?$checked = (!isset($settings->showNullNodes)||!$settings->showNullNodes ? 'checked="checked" ' : '');?>
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
				<div style="height:10px;" class="clear"></div>

				<div class="floatLeft">
					<label onclick="$('languageChoice').addClassName('nxj_selectOpen'); Event.stop(event);">Target Language</label>
					<div class="clear"></div>

					<?php echo Nxj_UI::selectbox(array(
						'id'			=> 'languageChoice'
						,'float'		=> 'left'
						,'width'		=> 200
						,'options'		=> array(
							(object) array(
								'value'		=> 'c'
								,'display'	=> 'C (ANSI C99)'
								,'default'	=> true
							)
						)
					));?>
				</div>

				<a id="generateButton" class="nxj_button nxj_cssButton" href="javascript:void(0);">Generate Code</a>

				<div id="controlsToggle" title="Show/Hide Controls">
					<div></div>
				</div>
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

		<div id="output" style="display:none;">
			<div class="close"></div>
			<div class="outputControls">
				<a id="downloadButton" class="nxj_button nxj_cssButton floatRight" href="javascript:void(0);">Download Code</a>
			</div>
			<pre><code id="generatedCode"></code></pre>
		</div>
	</div>

	<script src="static/js/prototype.js"></script>
	<script src="static/js/scriptaculous.js"></script>
	<script src="static/js/ui.js"></script>
	<script src="static/js/adhoc.js"></script>
	<script src="static/js/prism.js" data-manual></script>
</body>
</html>
