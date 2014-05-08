// Set up everything only after the page loads
Event.observe(window, 'load', function(){
	var adhoc = window.adhoc || {};

	// Certain class globals
	adhoc.canvas = null;
	adhoc.display_scale = 1.0;
	adhoc.display_x = 0;
	adhoc.display_y = 0;
	adhoc.lastId = 0;
	adhoc.textColor = '#000000';

	// AST node super-types
	adhoc.nodeTypes = {
		TYPE_NULL:	0
		,ACTION:	1
		,GROUP:		2
		,CONTROL:	3
		,OPERATOR:	4
		,ASSIGNMENT:5
		,VARIABLE:	6
		,LITERAL:	7
	};
	// AST node sub-types
	adhoc.nodeWhich = {
		WHICH_NULL:			0
		,ACTION_DEFIN:		1
		,ACTION_CALL:		2
		,GROUP_SERIAL:		3
		,CONTROL_IF:		4
		,CONTROL_LOOP:		5
		,CONTROL_SWITCH:	6
		,CONTROL_CASE:		7
		,CONTROL_FORK:		8
		,CONTROL_CNTNU:		9
		,CONTROL_BREAK:		10
		,CONTROL_RETRN:		11
		,OPERATOR_PLUS:		12
		,OPERATOR_MINUS:	13
		,OPERATOR_TIMES:	14
		,OPERATOR_DIVBY:	15
		,OPERATOR_MOD:		16
		,OPERATOR_EXP:		17
		,OPERATOR_OR:		18
		,OPERATOR_AND:		19
		,OPERATOR_NOT:		20
		,OPERATOR_EQUIV:	21
		,OPERATOR_GRTTN:	22
		,OPERATOR_LESTN:	23
		,OPERATOR_GRTEQ:	24
		,OPERATOR_LESEQ:	25
		,OPERATOR_NOTEQ:	26
		,OPERATOR_ARIND:	27
		,OPERATOR_TRNIF:	28
		,ASSIGNMENT_INCPR:	29
		,ASSIGNMENT_INCPS:	30
		,ASSIGNMENT_DECPR:	31
		,ASSIGNMENT_DECPS:	32
		,ASSIGNMENT_NEGPR:	33
		,ASSIGNMENT_NEGPS:	34
		,ASSIGNMENT_EQUAL:	35
		,ASSIGNMENT_PLUS:	36
		,ASSIGNMENT_MINUS:	37
		,ASSIGNMENT_TIMES:	38
		,ASSIGNMENT_DIVBY:	39
		,ASSIGNMENT_MOD:	40
		,ASSIGNMENT_EXP:	41
		,ASSIGNMENT_OR:		42
		,ASSIGNMENT_AND:	43
		,VARIABLE_ASIGN:	44
		,VARIABLE_EVAL:		45
		,LITERAL_BOOL:		46
		,LITERAL_INT:		47
		,LITERAL_FLOAT:		48
		,LITERAL_STRNG:		49
		,LITERAL_ARRAY:		50
		,LITERAL_HASH:		51
		,LITERAL_STRCT:		52
	};
	// AST node child connection types
	adhoc.nodeChildType = {
		CHILD_NULL:		0
		,STATEMENT:		1
		,EXPRESSION:	2
		,INITIALIZATION:3
		,CONDITION:		4
		,CASE:			5
		,PARAMETER:		6
		,ARGUMENT:		7
		,PARENT:		8
		,CHILD:			9
	};
	// AST node type names
	adhoc.nodeTypeNames = [
		'Null'
		,'Action'
		,'Group'
		,'Control'
		,'Operator'
		,'Assignment'
		,'Variable'
		,'Literal'
	];
	// AST node sub-type names
	adhoc.nodeWhichNames = [
		[
			'Null'
		]
		,[
			'Define Action'
			,'Call Action'
		]
		,[
			'Serial Group'
		]
		,[
			'If'
			,'Loop'
			,'Switch'
			,'Case'
			,'Fork'
			,'Continue'
			,'Break'
			,'Return'
		]
		,[
			'+ Plus'
			,'- Minus'
			,'* Times'
			,'/ Divided By'
			,'% Modulo'
			,'^ Raised To'
			,'|| Or'
			,'&& And'
			,'! Not'
			,'== Equivalent To'
			,'> Greater Than'
			,'< Less Than'
			,'>= Greater Or Equal To'
			,'<= Less Or Equal To'
			,'!= Not Equal To'
			,'[] Array Index'
			,'?: Ternary If'
			,'++ Increment'
			,'++ Increment'
			,'-- Decrement'
			,'-- Decrement'
			,'!! Invert'
			,'!! Invert'
		]
		,[
			'= Assign'
			,'+= Add'
			,'-= Subtract'
			,'*= Multiply By'
			,'/= Divide By'
			,'%= Modulo By'
			,'^= Raise To'
			,'||= Disjoin With'
			,'&&= Conjoin With'
		]
		,[
			'x Variable'
			,'x Variable'
		]
		,[
			'Boolean'
			,'Integer'
			,'Float'
			,'String'
			,'Array'
			,'Hash'
			,'Struct'
		]
	];
	// AST node child connection type names
	adhoc.nodeChildTypeNames = [
		'Null'
		,'Statement'
		,'Expression'
		,'Initialization'
		,'Condition'
		,'Case'
		,'Parameter'
		,'Argument'
		,'Parent'
		,'Child'
	];

	// Sisplay errors to the user
	adhoc.error = function(s){
		alert(s);
		return false;
	}

	// Initialize the GUI editor
	adhoc.init = function(){
		// Initialize drawing canvas
		adhoc.canvas = $('canvas');
		if(!adhoc.canvas) return adhoc.error("Could not find drawing canvas.");
		adhoc.sizeCanvas();
		Event.observe(window, 'resize', adhoc.sizeCanvas);

		// Set some drawing parameters
		if(!adhoc.canvas.getContext) return adhoc.error("Your browser does not support drawing.");
		var ctx = adhoc.canvas.getContext('2d');
		ctx.lineWidth = 6;
		ctx.font = "20px Arial";
		ctx.fillStyle = adhoc.textColor;

		// Ready the toolbox categories
		var cat, head, body, item, icon, text, clear, passed=0, toolbox=$('toolbox');
		for(var i=0,leni=adhoc.nodeTypeNames.length; i<leni; ++i){
			// Print section headings (except null and assignment)
			if(i!=0 && i!=5){
				// Category
				cat = $(document.createElement('div'));
				cat.addClassName('toolboxCategory');
				if(i!=1) cat.addClassName('collapsed');

				// Heading
				head = $(document.createElement('div'));
				head.addClassName('toolboxCategoryHeading').update(adhoc.nodeTypeNames[i]);
				head.observe('click', function(){
					$$('.toolboxCategory').each(function(category){
						category.addClassName('collapsed');
					});
					this.up().removeClassName('collapsed');
				});
				cat.appendChild(head);

				// Body
				body = $(document.createElement('div'));
				body.addClassName('toolboxCategoryBody');
				cat.appendChild(body);

				// Spacers
				clear = $(document.createElement('div'));
				clear.addClassName('clear').setStyle({height:'40px'});
				body.appendChild(clear);
				clear = $(document.createElement('div'));
				clear.addClassName('clear');
				cat.appendChild(clear);

				// Add
				toolbox.appendChild(cat);
			}

			// Print toolbox items
			for(var j=0,lenj=adhoc.nodeWhichNames[i].length; j<lenj; ++j){
				if(j+passed == 0) continue;
				// Item
				item = $(document.createElement('div'));
				item.addClassName('toolboxItem');
				item.setAttribute('data-type', i);
				item.setAttribute('data-which', j+passed);
				item.observe('click', function(){
					$$('.toolboxItem.active').each(function(active){
						active.removeClassName('active');
					});
					this.addClassName('active');
				});

				// Icon
				icon = $(document.createElement('div'));
				icon.addClassName('toolboxItemIcon').addClassName('toolIcon_'+i+'_'+(j+passed));
				item.appendChild(icon);

				// Text
				text = $(document.createElement('div'));
				text.addClassName('toolboxItemText').update(adhoc.nodeWhichNames[i][j]);
				item.appendChild(text);

				// Add
				body.appendChild(item);

				// Spacer
				clear = $(document.createElement('div'));
				clear.addClassName('clear');
				body.appendChild(clear);
			}
			passed += lenj;
		}

		// Ready the canvas
		var downFunc = function(e){
			// Get the scaled location of the click
			var offset = adhoc.canvas.positionedOffset();
			var click = {
				x: (Event.pointerX(e)-offset.left) / adhoc.display_scale + adhoc.display_x
				,y: (Event.pointerY(e)-offset.top) / adhoc.display_scale + adhoc.display_y
			};
			var clickedNode = adhoc.getClickedNode(adhoc.rootNode, click);

			// If a node was clicked, figure out what to do with it
			if(clickedNode){
				// nothing?

			// Otherwise, we're trying to move the canvas
			}else{
				adhoc.canvas.addClassName('moving');
				adhoc.canvas.setAttribute('data-startx', adhoc.display_x);
				adhoc.canvas.setAttribute('data-starty', adhoc.display_y);
				adhoc.canvas.setAttribute('data-startpx', Event.pointerX(e));
				adhoc.canvas.setAttribute('data-startpy', Event.pointerY(e));
			}
		};
		var upFunc = function(e){
			// Get the scaled location of the click
			var offset = adhoc.canvas.positionedOffset();
			var click = {
				x: (Event.pointerX(e)-offset.left) / adhoc.display_scale + adhoc.display_x
				,y: (Event.pointerY(e)-offset.top) / adhoc.display_scale + adhoc.display_y
			};
			var clickedNode = adhoc.getClickedNode(adhoc.rootNode, click);

			// If a node was clicked, figure out what to do with it
			if(clickedNode){
				var activeTools = $$('.toolboxItem.active');
				if(activeTools.length){
					var type = parseInt(activeTools[0].getAttribute('data-type'));
					var which = parseInt(activeTools[0].getAttribute('data-which'));
					var newNode = adhoc.createNode(type, which);
// TODO
newNode.name='foo';
					newNode.parent = clickedNode;
					clickedNode.children.push(newNode);
					adhoc.refreshRender();
				}else{
				}
			}

			// Regardless, we're done moving the canvas
			adhoc.canvas.removeClassName('moving');
		};
		var moveFunc = function(e){
			// If the canvas isn't moving, just return
			if(!adhoc.canvas.hasClassName('moving')) return;

			// Get the scaled location of the cursor
			var offset = adhoc.canvas.positionedOffset();
			var click = {
				x: (Event.pointerX(e)-offset.left) / adhoc.display_scale + adhoc.display_x
				,y: (Event.pointerY(e)-offset.top) / adhoc.display_scale + adhoc.display_y
			};

			// Get the canvas' move coordinates
			var startx = parseFloat(adhoc.canvas.getAttribute('data-startx'));
			var starty = parseFloat(adhoc.canvas.getAttribute('data-starty'));
			var startpx = parseFloat(adhoc.canvas.getAttribute('data-startpx'));
			var startpy = parseFloat(adhoc.canvas.getAttribute('data-startpy'));

			// Set the new coordinates and redraw
			adhoc.display_x = startx - ((Event.pointerX(e) - startpx) / adhoc.display_scale);
			adhoc.display_y = starty - ((Event.pointerY(e) - startpy) / adhoc.display_scale);
			adhoc.refreshRender();
		};
		adhoc.canvas.observe('mousedown', downFunc);
		adhoc.canvas.observe('touchstart', downFunc);
		adhoc.canvas.observe('mouseup', upFunc);
		adhoc.canvas.observe('touchend', upFunc);
		adhoc.canvas.observe('mousemove', moveFunc);
		adhoc.canvas.observe('touchmove', moveFunc);

		// Open an existing project or start a new one
// TODO
var test = adhoc.createNode(adhoc.nodeTypes.ACTION, adhoc.nodeWhich.ACTION_DEFIN);
test.name = 'Print 99 Bottles';
adhoc.rootNode = test;

		// Render the initial tree
		adhoc.refreshRender();
	}

	// When the screen size changes, we have to resize the canvas too
	adhoc.sizeCanvas = function(){
		var workspace = $('workspace');
		adhoc.canvas.setAttribute('width', workspace.getWidth()*0.8);
		adhoc.canvas.setAttribute('height', workspace.getHeight());
		adhoc.refreshRender();
	}

	// Re-compute all the node locations and redraw those that are on-screen
	adhoc.refreshRender = function(){
		if(!adhoc.rootNode) return;
		var ctx = adhoc.canvas.getContext('2d');
		ctx.clearRect(0, 0, adhoc.canvas.width, adhoc.canvas.height);
		ctx.lineWidth = 6;
		ctx.font = "20px Arial";
		adhoc.subTreeHeightNode(adhoc.rootNode);
		adhoc.positionNode(adhoc.rootNode, 0);
		adhoc.renderNode(adhoc.rootNode);
	}

	// Generate the next available node ID
	adhoc.nextId = function(){
		return ++adhoc.lastId;
	}

	// Create a new node with just a type and empty contents
	adhoc.createNode = function(t, w){
		return {
			id: adhoc.nextId()
			,parent: null
			,scope: null
			,nodeType: t
			,which: w
			,childType: null
			,dataType: null
			,package: null
			,name: null
			,value: null
			,children: []
			,scopeVars: []
			,x: 0
			,y: 0
			,width: null
			,height: null
			,subTreeHeight: 100
		};
	}

	// Recursively determine the display heights of each subtree
	adhoc.subTreeHeightNode = function(n){
		if(!n.children.length) return (n.subTreeHeight = 100);
		n.subTreeHeight = 0;
		for(var i=0; i<n.children.length; ++i){
			n.subTreeHeight += adhoc.subTreeHeightNode(n.children[i]);
		}
		return n.subTreeHeight;
	}

	// Recursively determine each node's display position
	adhoc.positionNode = function(n, d){
		var passed = d ? n.y : 0;
		n.x = d*200 + 100;
		n.y = n.subTreeHeight/2 + passed;
		for(var i=0; i<n.children.length; ++i){
			n.children[i].y = passed;
			passed += n.children[i].subTreeHeight;
			adhoc.positionNode(n.children[i], d+1);
		}
	}

	// Recursively draw each node
	adhoc.renderNode = function(n){
		var ctx = adhoc.canvas.getContext('2d');
		var nodeColor;

		switch(n.nodeType){
		case adhoc.nodeTypes.TYPE_NULL:
			break;
		case adhoc.nodeTypes.ACTION:
			// Determine the right color
			nodeColor = (n.which == adhoc.nodeWhich.ACTION_DEFIN ? '#87FF00' : '#5FD7FF');

			// Get label text size
			var title = n.name;
			if(title.length > 20) title = title.substr(0, 18)+'...';
			var size = ctx.measureText(title);
			size.height = 20;
			n.width = size.width + 30;
			n.height = size.height + 50;

			// Print label text
			ctx.fillText(
				title
				,(n.x-(size.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y+(size.height/2.0)-3) * adhoc.display_scale - adhoc.display_y
			); 

			// Draw box border
			ctx.strokeStyle = nodeColor;
			ctx.strokeRect(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y-(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
				,n.width * adhoc.display_scale
				,n.height * adhoc.display_scale
			);
			break;
		case adhoc.nodeTypes.GROUP:
			break;
		case adhoc.nodeTypes.CONTROL:
			break;
		case adhoc.nodeTypes.OPERATOR:
			break;
		case adhoc.nodeTypes.ASSIGNMENT:
			break;
		case adhoc.nodeTypes.VARIABLE:
			break;
		case adhoc.nodeTypes.LITERAL:
			break;
		}

		// Proceed recursively
		for(var i=0; i<n.children.length; ++i){
			var c = n.children[i];

			// Draw a connecting arrow
			ctx.strokeStyle = nodeColor;
			ctx.beginPath();
			ctx.moveTo(
				(n.x+(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,n.y * adhoc.display_scale - adhoc.display_y
			);
			ctx.lineTo(
				(c.x-(c.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,c.y * adhoc.display_scale - adhoc.display_y
			);
			ctx.stroke();

			// Render one child
			adhoc.renderNode(c);
		}
	}

	// Recursively determine whether the click landed in a node
	adhoc.getClickedNode = function(n, click){
		// See if it's in this node
		if(click.x >= n.x-(n.width/2.0)
				&& click.x <= n.x+(n.width/2.0)
				&& click.y >= n.y-(n.height/2.0)
				&& click.y <= n.y+(n.height/2.0)
			) return n;

		// Check the children
		for(var i=0; i<n.children.length; ++i){
			var temp = adhoc.getClickedNode(n.children[i], click);
			if(temp) return temp;
		}

		// If we've gotten here, then the click was on the canvas
		return null;
	}

	adhoc.init();
});
