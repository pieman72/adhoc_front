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

		// Ready the toolbox items
		$$('.toolboxCategoryHeading').each(function(heading){
			heading.observe('click', function(){
				$$('.toolboxCategory').each(function(category){
					category.addClassName('collapsed');
				});
				this.up().removeClassName('collapsed');
			});
		});
		$$('.toolboxItem').each(function(item){
			item.observe('click', function(){
				$$('.toolboxItem.active').each(function(active){
					active.removeClassName('active');
				});
				this.addClassName('active');
			});
		});

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
// TODO: nothing
			// Otherwise, we're trying to move the canvas
			}else{
// TODO: set the canvas as moving
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
// TODO: if there is a tool active, add a new child to the clicked node
			// Otherwise, we're trying to move the canvas
			}else{
// TODO: set the canvas as not moving
			}
		};
		var moveFunc = function(e){
// TODO: if the canvas is not set to moving, return, otherwise move the canvas
		};
		adhoc.canvas.observe('mousedown', downFunc);
		adhoc.canvas.observe('touchstart', downFunc);
		adhoc.canvas.observe('mouseup', upFunc);
		adhoc.canvas.observe('touchend', upFunc);
		adhoc.canvas.observe('mousemove', moveFunc);
		adhoc.canvas.observe('touchmove', moveFunc);

		// Open an existing project or start a new one
var test = adhoc.createNode(adhoc.nodeTypes.ACTION, adhoc.nodeWhich.ACTION_DEFIN);
test.x = 200;
test.y = 200;
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
			,parentId: null
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
		n.x = d*200 + 100;
		n.y = n.subTreeHeight/2 + (d ? n.y : 0);
		var passed = 0;
		for(var i=0; i<n.children.length; ++i){
			n.children[i].y = passed;
			passed += n.children[i].subTreeHeight;
			adhoc.positionNode(n.children[i], d+1);
		}
	}

	// Recursively draw each node
	adhoc.renderNode = function(n){
		var ctx = adhoc.canvas.getContext('2d');

		switch(n.nodeType){
		case adhoc.nodeTypes.TYPE_NULL:
			break;
		case adhoc.nodeTypes.ACTION:
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
			ctx.strokeStyle = '#87FF00'
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
			// TODO: draw a connecting arrow
			// Render one child
			adhoc.renderNode(n.children[i]);
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
