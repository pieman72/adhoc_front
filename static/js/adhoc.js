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
		,MEMBER:		10
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
			['Null', '']
		]
		,[
			['Define Action', '']
			,['Call Action', '']
		]
		,[
			['Serial Group', '']
		]
		,[
			['If', '']
			,['Loop', '']
			,['Switch', '']
			,['Case', '']
			,['Fork', '']
			,['Continue', '']
			,['Break', '']
			,['Return', '']
		]
		,[
			['Plus', '+']
			,['Minus', '-']
			,['Times', '*']
			,['Divided By', '&#247;']
			,['Modulo', '%']
			,['Raised To', '^']
			,['Or', '||']
			,['And', '&&']
			,['Not', '!']
			,['Equivalent To', '==']
			,['Greater Than', '>']
			,['Less Than', '<']
			,['Greater Or Equal To', '>=']
			,['Less Or Equal To', '<=']
			,['Not Equal To', '!=']
			,['Array Index', '[]']
			,['Ternary If', '? :']
		]
		,[
			['Increment', '++']
			,['Increment', '++']
			,['Decrement', '--']
			,['Decrement', '--']
			,['Invert', '!!']
			,['Invert', '!!']
			,['Assign', '=']
			,['Add', '+=']
			,['Subtract', '-=']
			,['Multiply By', '*=']
			,['Divide By', '&#247;=']
			,['Modulo By', '%=']
			,['Raise To', '^=']
			,['Disjoin With', '||=']
			,['Conjoin With', '&&=']
		]
		,[
			['Variable', '']
			,['Variable', '']
		]
		,[
			['Boolean', '']
			,['Integer', '']
			,['Float', '']
			,['String', '']
			,['Array', '']
			,['Hash', '']
			,['Struct', '']
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
		,'Member'
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
					var alreadyOpen = !this.up().hasClassName('collapsed');
					$$('.toolboxCategory').each(function(category){
						category.addClassName('collapsed');
					});
					if(!alreadyOpen) this.up().removeClassName('collapsed');
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
				if(j+passed == 30) continue;
				if(j+passed == 32) continue;
				if(j+passed == 34) continue;
				if(j+passed == 45) continue;
				
				// Item
				item = $(document.createElement('div'));
				item.addClassName('toolboxItem');
				item.setAttribute('data-type', i);
				item.setAttribute('data-which', j+passed);
				item.observe('click', function(){
					var wasActive = this.hasClassName('active');
					$$('.toolboxItem.active').each(function(active){
						active.removeClassName('active');
					});
					if(!wasActive) this.addClassName('active');
				});

				// Icon
				icon = $(document.createElement('div'));
				icon.addClassName('toolboxItemIcon').addClassName('toolIcon_'+i+'_'+(j+passed));
				item.appendChild(icon);

				// Text
				text = $(document.createElement('div'));
				text.addClassName('toolboxItemText').update(adhoc.nodeWhichNames[i][j][0]);
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
				x: (Event.pointerX(e) - offset.left + adhoc.display_x) / adhoc.display_scale
				,y: (Event.pointerY(e) - offset.top + adhoc.display_y) / adhoc.display_scale
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
				x: (Event.pointerX(e) - offset.left + adhoc.display_x) / adhoc.display_scale
				,y: (Event.pointerY(e) - offset.top + adhoc.display_y) / adhoc.display_scale
			};
			var clickedNode = adhoc.getClickedNode(adhoc.rootNode, click);

			// If a node was clicked, figure out what to do with it
			if(clickedNode){
				var activeTools = $$('.toolboxItem.active');
				// If a tool is active
				if(activeTools.length){
					// Create a new node of the tool's type
					var type = parseInt(activeTools[0].getAttribute('data-type'));
					var which = parseInt(activeTools[0].getAttribute('data-which'));
					var newNode = adhoc.createNode(type, which);

					// Add the new node to its parent
					newNode.parent = clickedNode;
					clickedNode.children.push(newNode);

					// Ask for node info based on which
					switch(which){
					case adhoc.nodeWhich.ACTION_DEFIN:
					case adhoc.nodeWhich.ACTION_CALL:
// TODO: Prompt for action package/name
newNode.name='foo';
adhoc.refreshRender();
						break;

					case adhoc.nodeWhich.VARIABLE_ASIGN:
					case adhoc.nodeWhich.VARIABLE_EVAL:
// TODO: Prompt for variable name
newNode.name='bar';
adhoc.refreshRender();
						break;

					case adhoc.nodeWhich.LITERAL_BOOL: newNode.value = newNode.value || 1;
					case adhoc.nodeWhich.LITERAL_INT: newNode.value = newNode.value || 72;
					case adhoc.nodeWhich.LITERAL_FLOAT: newNode.value = newNode.value || 4.56;
					case adhoc.nodeWhich.LITERAL_STRNG: newNode.value = newNode.value || 'Hello';
					case adhoc.nodeWhich.LITERAL_ARRAY: newNode.value = newNode.value || 'a';
					case adhoc.nodeWhich.LITERAL_HASH: newNode.value = newNode.value || 'b';
					case adhoc.nodeWhich.LITERAL_STRCT: newNode.value = newNode.value || 'c';
// TODO: Prompt for literal value
adhoc.refreshRender();
						break;

					default:
						adhoc.refreshRender();
					}
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
				x: (Event.pointerX(e) - offset.left + adhoc.display_x) / adhoc.display_scale
				,y: (Event.pointerY(e) - offset.top + adhoc.display_y) / adhoc.display_scale
			};

			// Get the canvas' move coordinates
			var startx = parseFloat(adhoc.canvas.getAttribute('data-startx'));
			var starty = parseFloat(adhoc.canvas.getAttribute('data-starty'));
			var startpx = parseFloat(adhoc.canvas.getAttribute('data-startpx'));
			var startpy = parseFloat(adhoc.canvas.getAttribute('data-startpy'));

			// Set the new coordinates and redraw
			adhoc.display_x = startx + startpx - Event.pointerX(e);
			adhoc.display_y = starty + startpy - Event.pointerY(e);
			adhoc.refreshRender();
		};
		adhoc.canvas.observe('mousedown', downFunc);
		adhoc.canvas.observe('touchstart', downFunc);
		adhoc.canvas.observe('mouseup', upFunc);
		adhoc.canvas.observe('touchend', upFunc);
		adhoc.canvas.observe('mousemove', moveFunc);
		adhoc.canvas.observe('touchmove', moveFunc);

		// Ready the zoom buttons
		$('zoomIn').observe('click', function(){
			adhoc.display_scale *= 1.2;
			adhoc.refreshRender();
		});
		$('zoomOut').observe('click', function(){
			adhoc.display_scale /= 1.2;
			adhoc.refreshRender();
		});

		// Open an existing project or start a new one
// TODO: Load an old project or initialize a new one with it's root action
adhoc.rootNode = adhoc.createNode(adhoc.nodeTypes.ACTION, adhoc.nodeWhich.ACTION_DEFIN);
adhoc.rootNode.name = 'Print 99 Bottles';

		// Render the initial tree
		adhoc.refreshRender();
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
		ctx.font = "20px Arial";
		ctx.fillStyle = adhoc.textColor;

		switch(n.nodeType){
		case adhoc.nodeTypes.TYPE_NULL:
			break;

		case adhoc.nodeTypes.ACTION:
			// Determine the right color
			nodeColor = (n.which == adhoc.nodeWhich.ACTION_DEFIN ? '#87FF00' : '#5FD7FF');

			// Get label text and its size
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
// TODO: Render a group
			break;

		case adhoc.nodeTypes.CONTROL:
			// Determine the right color
			nodeColor = '#D7005F';

			// Get label text and its size
			var title = adhoc.nodeWhichNames[adhoc.nodeTypes.CONTROL][n.which - adhoc.nodeWhich.CONTROL_IF][0];
			var size, textSize = 20;
			n.width = 87;
			n.height = 100;
			do{
				size = ctx.measureText(title);
				if(size.width+15 < n.width) break;
				ctx.font = "" + (--textSize) + "px Arial";
			}while(true);
			size.height = 20;

			// Print label text
			ctx.fillText(
				title
				,(n.x-(size.width/2.0)-5) * adhoc.display_scale - adhoc.display_x
				,(n.y+(size.height/2.0)-3) * adhoc.display_scale - adhoc.display_y
			);

			// Draw triangle border
			ctx.strokeStyle = nodeColor;
			ctx.beginPath();
			ctx.moveTo(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,n.y * adhoc.display_scale - adhoc.display_y
			);
			ctx.lineTo(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y-(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
			);
			ctx.lineTo(
				(n.x+(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,n.y * adhoc.display_scale - adhoc.display_y
			);
			ctx.lineTo(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y+(n.height/2.0)) * adhoc.display_scale - adhoc.display_y
			);
			ctx.lineTo(
				(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,n.y * adhoc.display_scale - adhoc.display_y
			);
			ctx.stroke();
			break;

		case adhoc.nodeTypes.OPERATOR:
		case adhoc.nodeTypes.ASSIGNMENT:
			// Determine the right color
			nodeColor = '#AF5FFF';
			ctx.font = "32px Arial";

			// Get label text and its size
			var offset = (n.nodeType == adhoc.nodeTypes.OPERATOR)
				? adhoc.nodeWhich.OPERATOR_PLUS
				: adhoc.nodeWhich.ASSIGNMENT_INCPR;
			var title = adhoc.nodeWhichNames[n.nodeType][n.which-offset][1];
			var size = ctx.measureText(title);
			size.height = 20;
			n.width = 80;
			n.height = 80;

			// Print label text
			ctx.fillText(
				title
				,(n.x-(size.width/2.0)) * adhoc.display_scale - adhoc.display_x
				,(n.y+(size.height/2.0)) * adhoc.display_scale - adhoc.display_y
			); 

			// Draw box border
			ctx.strokeStyle = nodeColor;
			ctx.beginPath();
			ctx.arc(
				n.x * adhoc.display_scale - adhoc.display_x
				,n.y * adhoc.display_scale - adhoc.display_y
				,(n.width/2.0) * adhoc.display_scale
				,0
				,Math.PI*2
			);
			ctx.stroke();
			break;

		case adhoc.nodeTypes.VARIABLE:
			// Get label text and its size
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
			break;

		case adhoc.nodeTypes.LITERAL:
			ctx.fillStyle = '#FF8700';
			switch(n.which){
			case adhoc.nodeWhich.LITERAL_BOOL:
				// Get label text and its size
				var title = (n.value ? "true" : "false");
				var size = ctx.measureText(title);
				size.height = 20;
				n.width = size.width + 30;
				n.height = size.height + 50;

				// Print label text
				ctx.fillText(
					title
					,(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)-3) * adhoc.display_scale - adhoc.display_y
				); 
				break;

			case adhoc.nodeWhich.LITERAL_INT:
			case adhoc.nodeWhich.LITERAL_FLOAT:
			case adhoc.nodeWhich.LITERAL_STRNG:
				// Get label text and its size
				var title = n.value;
				if(title.length > 20) title = title.substr(0, 18)+'...';
				var size = ctx.measureText(title);
				size.height = 20;
				n.width = size.width + 30;
				n.height = size.height + 50;

				// Print label text
				ctx.fillText(
					title
					,(n.x-(n.width/2.0)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0)-3) * adhoc.display_scale - adhoc.display_y
				); 
				break;

			case adhoc.nodeWhich.LITERAL_ARRAY:
				// Determine the color for the brackets
				nodeColor = '#000000';

				// Set the node's dimensions
				n.width = 100;
				n.height = 100;

				// Darw the items
// TODO: draw shorthand for array items

				// Draw the brackets
				ctx.strokeStyle = nodeColor;
				ctx.beginPath();
				ctx.moveTo(
					(n.x-(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0+5)+5) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x-(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0+5)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0+5)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y-(n.height/2.0+5)+5) * adhoc.display_scale - adhoc.display_y
				);
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(
					(n.x-(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0+5)-5) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x-(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0+5)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0+5)) * adhoc.display_scale - adhoc.display_y
				);
				ctx.lineTo(
					(n.x+(n.width/2.0+5)) * adhoc.display_scale - adhoc.display_x
					,(n.y+(n.height/2.0+5)-5) * adhoc.display_scale - adhoc.display_y
				);
				ctx.stroke();

				ctx.strokeStyle = nodeColor;
				break;

			case adhoc.nodeWhich.LITERAL_HASH:
// TODO: render a literal hash
				break;

			case adhoc.nodeWhich.LITERAL_STRCT:
// TODO: render a literal struct
				break;

			}
			break;
		}

		// Proceed recursively
		for(var i=0; i<n.children.length; ++i){
			var c = n.children[i];

			// Render one child
			adhoc.renderNode(c);

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

	// Initialize the application
	adhoc.init();
});
