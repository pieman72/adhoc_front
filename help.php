<html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>ADHOC - Help</title>
	<link rel="shortcut icon" href="//static.harveyserv.ath.cx/adhoc/img/fav.png"/>
	<link rel="stylesheet" href="//static.harveyserv.ath.cx/adhoc/css/ui.css" type="text/css"/>
	<style type="text/css">
	html, body {
		background:#FFFFFF;
		color:#000000;
		font-family:OpenSans,Helvetica,Arial,sans-serif;
		overflow:visible;
		}
	body {
		overflow:auto;
		}
	h1, h2, h3, h4 {
		font-family:Roboto,Helvetica,Arial,sans-serif;
		margin:0 0 10px;
		}
	h5, h6 {
		font-family:Roboto,Helvetica,Arial,sans-serif;
		margin:0;
		}
	#toTop {
		background:url('//static.harveyserv.ath.cx/adhoc/img/toTop.png') no-repeat center 10px rgba(200, 200, 200, 0.8);
		border-radius:10px;
		cursor:pointer;
		font-size:14px;
		font-weight:bold;
		line-height:24px;
		opacity:1;
		padding-top:26px;
		position:fixed;
		right:10px;
		text-align:center;
		text-transform:uppercase;
		top:10px;
		width:50px;
		transition:opacity 0.5s;
		}
	#toTop.atTop {
		opacity:0;
		}
	</style>
</head>

<body>
	<div id="toTop" class="atTop">Top</div>
	<h1 id="sec_contents">Contents</h1>
		<ol>
			<li><a href="javascript:sec('sec_contents');">Contents</a>
			</li>
			<li><a href="javascript:sec('sec_about');">About</a>
				<ol>
					<li><a href="javascript:sec('sec_about_aop');">Action-Oriented Programming (AOP)</a></li>
					<li><a href="javascript:sec('sec_about_adhoc');">ADHOC</a></li>
					<li><a href="javascript:sec('sec_about_project');">This Project</a></li>
				</ol>
			</li>
			<li><a href="javascript:sec('sec_nodes');">Nodes</a>
				<ol>
					<li><a href="javascript:sec('sec_nodes_types');">Types</a></li>
					<li><a href="javascript:sec('sec_nodes_properties');">Properties</a></li>
				</ol>
			</li>
			<li><a href="javascript:sec('sec_datatypes');">Datatypes</a>
			</li>
			<li><a href="javascript:sec('sec_keyboard');">Keyboard Controls</a>
			</li>
			<li><a href="javascript:sec('sec_generating');">Generating Code</a>
				<ol>
					<li><a href="javascript:sec('sec_generating_languages');">Languages</a></li>
					<li><a href="javascript:sec('sec_generating_adhoc');">ADHOC Back-End</a></li>
				</ol>
			</li>
			<li><a href="javascript:sec('sec_more');">More Info</a>
			</li>
		</ol>
	<br/>

	<h1 id="sec_about">About</h1>
		<h3 id="sec_about_aop">Action-Oriented Programming</h3>
		<p>Action-Oriented Programming (AOP) refers to a programming paradigm
		focused on semantic groups called "actions". Like functions in other
		languages, actions are defined with a header which declares arguments to
		be passed to the action, and with a body which defines the
		implementation of the action. What sets actions apart from functions is
		the semantic nature in which their bodies are defined. An action body
		will rarely contain any direct implementation, but will rather call a
		number of simpler actions.  For example, the body of a "quick sort"
		action may consist of calls to a "choose pivot" action, a "partition by
		comparator" action, and to itself recursively. AOP's declarative nature
		is aimed at semantic clarity and code readability.</p>
		<br/>

		<h3 id="sec_about_adhocp">ADHOC</h3>
		<p>Following the AOP paradigm, ADHOC is an application for abstracting
		programming logic away from the syntax of any particular language. The
		idea is that there is some <i>important logic</i> that only a programmer
		can supply, but most other program content is syntactic fluff for
		helping a text-based compiler understand the important logic.
		ADHOC supplies a graphical interface and optimization tools in order to
		let the programmer focus solely on designing the important logic.</p>
		<br/>

		<h3 id="sec_about_project">This Project</h3>
		<p>This web front-end is an early attempt at designing an easy-to-use
		GUI for the ADHOC language. It allows users to define constructs of
		important logic and from those constructs to generate target code in
		several languages. This front-end is free to use and is open-source
		under the <a href="LICENSE">GPL v3.</a></p>
		<br/>
	<br/>

	<h1 id="sec_nodes">Nodes</h1>
		<h3 id="sec_nodes_types">Types</h3>
		<p>An ADHOC project consists of a tree of nodes, each of which
		represents a logical concept in programming. There are 6 main types of
		nodes in ADHOC:</p>
		<ul>
			<li>
				<b>Action Nodes</b> represent actions in the AOP model. They are
				generally composed of children that represent simpler actions.
				Actions belong to packages, and the root node for any project is
				always an action definition for the highest-level function of
				the project (e.g. "Run Web Server"). Once an action is defined,
				it can be used in other parts of the project. Some important
				system actions are already defined, and can be called from any
				project. Action definitions appear as green rectangles and
				action calls appear as blue rectangles.
			</li>
			<li>
				<b>Group Nodes</b> are a way of establishing relationships
				between other particular other nodes. The "serial group"
				indicates that any actions within it always be performed in
				sequence, while otherwise, sibling actions can may be performed
				concurrently at the discretion of the code generation process.
				Serial groups appear as dashed gray rectangles around their
				children.
			</li>
			<li>
				<b>Control Nodes</b> help to control the logical flow of a
				program. The include things like conditionals, iteration, and
				explicit execution forking. Control nodes appear as magenta
				triangles.
			</li>
			<li>
				<b>Operator Nodes</b> are like action calls, in that they take
				arguments and almost always yield a result, however, they are
				typically much simpler than actions, and their behaviors are
				generally intuitive or have standard programming meanings.
				Operator nodes appear as purple circles.
			</li>
			<li>
				<b>Variable Nodes</b> represent named values. Just as in other
				programming languages, algebra, or symbolic logic, a variable's
				name is used as a temporary stand-in for an actual value. The
				variable is said to "hold" that value until and unless it is
				"assigned" a new one. Variable nodes appear as black or white
				text with no border.
			</li>
			<li>
				<b>Literal Nodes</b> represent exact values, such as numbers,
				text, or collections of things. Literal nodes appear as orange
				text with no border.
			</li>
		</ul>
		<p>The tree of nodes behaves like an <a target="_blank"
		href="http://en.wikipedia.org/wiki/Abstract_syntax_tree">abstract syntax
		tree</a> which represents just the general logic of a program. Because
		of this generality, the ADHOC back-end is able to generate code in
		multiple different languages from the tree.</p>
		<br/>

		<h3 id="sec_nodes_properties">Properties</h3>
		<p>Nodes have a number of important properties, including an 'id' which
		is unique within the project, a 'type' (from the list above), a 'name'
		which is what is displayed on screen, and sometimes a 'value' (mostly
		for literal nodes). These properties can be viewed by selecting an
		existing node, and pressing <code>[Enter]</code>.</p>
		<br/>
	<br/>

	<h1 id="sec_datatypes">Datatypes</h1>
		<p>ADHOC uses 8 datatypes to classify values. The types are:</p>
		<ul>
			<li>
				<b>Boolean</b> - a simple true/false value.
			</li>
			<li>
				<b>Integer</b> - a numerical value without a decimal. Depending
				on the target language, may have an upper and lower bound.
			</li>
			<li>
				<b>Float</b> - a numerical value with a decimal. Depending on
				the target language, may have an upper and lower bound, and a
				degree of precision.
			</li>
			<li>
				<b>String</b> - a text value. Any text is valid, except
				quotation marks which <em>must</em> be escaped with a back-slash
				(<code>\"</code>). Use of other escapes (e.g. <code>\n</code>
				<code>\t</code> <code>\b</code>, etc.) is supported and
				encouraged.
			</li>
			<li>
				<b>Array</b> - a numerically-indexed collection of other values.
				Some target languages will require that all values in the
				collection be of the same type, however, ADHOC generally does
				not require this. The size of an array need not be known when
				target code is generated, and the size can change dynamically
				during program execution.
			</li>
			<li>
				<b>Hash</b> - a string-indexed collection of other values. Other
				than the indexing, hashes behave identically to arrays.
			</li>
			<li>
				<b>Struct</b> - a structured hash, with all indices
				pre-determined by a struct definition node.
			</li>
			<li>
				<b>Action</b> - a value representing a defined action. This
				allows for functional programming paradigms.
			</li>
		</ul>
		<p>Similarly to many scripting languages, ADHOC itself does not
		delineate between primitive and complex datatypes, and it allows for
		<a target="_blank"
		href="http://en.wikipedia.org/wiki/Type_system#Type_checking">
		late ("weak") type checking</a>. However, when generating code, ADHOC
		will hold to the standards of the target language, and may throw an
		error if certain actions are not compatible with the target type system.
		</p>
	<br/>

	<h1 id="sec_keyboard">Keyboard Controls</h1>
		<p>This application is primarily intended to be used with a mouse,
		however, keyboard shortcuts are available for most common tasks:</p>
		<ul>
			<li><code>[Esc]</code>: Close dialogs and deselect nodes</li>
			<li><code>[Enter]</code>: Confirm most dialogs, or with a node selected, display a dialog of that node's details</li>
			<li><code>[Space]</code>: Rename the selected node, or change its value</li>
			<li><code>[Del]</code>: Remove the selected node and it's children</li>
			<li><code>[Up]</code>, <code>[Down]</code>, <code>[Left]</code>, <code>[Right]</code>: Cycle through most open menus or active toolbox items</li>
			<li><code>[1]</code> - <code>[6]</code>: Activate a category in the toolbox</li>
			<li><code>[Ctrl]</code>+<code>[+]</code>: Zoom in</li>
			<li><code>[Ctrl]</code>+<code>[-]</code>: Zoom out</li>
			<li><code>[Ctrl]</code>+<code>[a]</code>: Select generated code</li>
			<li><code>[Ctrl]</code>+<code>[g]</code>: Generate code!</li>
			<li><code>[Ctrl]</code>+<code>[h]</code>: Show help</li>
			<li><code>[Ctrl]</code>+<code>[l]</code>: Load a file</li>
			<li><code>[Ctrl]</code>+<code>[s]</code>: Save a file</li>
			<li><code>[Ctrl]</code>+<code>[y]</code>: Redo</li>
			<li><code>[Ctrl]</code>+<code>[z]</code>: Undo</li>
			<li><code>[`]</code> (back-tick): Toggle the control panel</li>
		</ul>
	<br/>

	<h1 id="sec_generating">Generating Code</h1>
		<h3 id="sec_generating_languages">Languages</h3>
		<p>One of ADHOC's most important features is the generation of code in
		multiple target languages. Each language has its idiosyncrasies, but the
		<i>important logic</i> generally remains the same. ADHOC uses a
		best-effort approach to smooth your logic into the target language's
		specific syntax.<p/>
		<p>Currently, the following languages are supported:</p>
		<ul>
			<li>C (ANSI C99)
				<span style="font-size:10px;">
					- (requires <a target="_blank" href="https://raw.githubusercontent.com/pieman72/adhoc/master/libadhoc.c">ADHOC C library</a>
					and <a target="_blank" href="https://raw.githubusercontent.com/pieman72/adhoc/master/libadhoc.h">header</a>)
				</span>
			</li>
			<li>Javascript
				<span style="font-size:10px;">
					- (requires <a target="_blank" href="https://raw.githubusercontent.com/pieman72/adhoc/master/libadhoc.js">ADHOC JS library</a>)
				</span>
			</li>
		</ul>
		<br/>

		<h3 id="sec_generating_adhoc">ADHOC Back-End</h3>
		<p>The browser application with which you are currently interfacing
		provides a convenient GUI for the creation and editing of ADHOC trees.
		However, when you click the "Generate Code" button, your current project
		is serialized and then sent to the back-end application for validation
		and code generation. The code for the back-end application is also
		open-source, and can be found here: <a target="_blank"
		href="https://github.com/pieman72/adhoc">
		https://github.com/pieman72/adhoc</a></p>
		<br/>
	<br/>

	<h1 id="sec_more">More Info</h1>
		<p>There's more information on the project's <a target="_blank" href="http://harveyserv.ath.cx/adhoc/">homepage</a></p>
		<p>Feel free to get involved <a target="_blank" href="https://github.com/pieman72/adhoc_front">on GitHub</a></p>
		<p>If you have questions or comments, email <a href="mailto:kenny@harveyserv.ath.cx">kenny@harveyserv.ath.cx</a></p>
	<br/>

	<script src="//static.harveyserv.ath.cx/adhoc/js/prototype.js"></script>
	<script src="//static.harveyserv.ath.cx/adhoc/js/scriptaculous.js"></script>
	<script src="//static.harveyserv.ath.cx/adhoc/js/ui.js"></script>
	<script src="//static.harveyserv.ath.cx/adhoc/js/prism.js"></script>
	<script>
		function sec(s){
			Effect.ScrollTo(((!s||!$(s)) ? document.body : s), {duration: 0.4});
		}
		Event.observe(window, 'load', function(){
			Event.observe(window, 'keyup', function(e){
				if((e.which||window.event.keyCode) != Event.KEY_ESC) return;
				parent.adhoc.regainFocus();
			});
			Event.observe(window, 'scroll', function(){
				if($(document.body).scrollTop > 50){
					$('toTop').removeClassName('atTop');
				}else{
					$('toTop').addClassName('atTop');
				}
			});
			$('toTop').observe('click', function(){
				sec();
			});
		});
	</script>
</body>
</html>
